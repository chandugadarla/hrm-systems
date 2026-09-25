import random
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, OTPCode
from app.schemas.auth import SendOTPRequest, VerifyOTPRequest
from app.utils.email import send_otp_email
from app.utils.jwt import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/send-otp")
def send_otp(
    request: SendOTPRequest,
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(
        Employee.email == request.email
    ).first()

    if not employee:
        return {
            "message": "Employee not found"
        }

    otp = str(random.randint(100000, 999999))

    expires_at = datetime.utcnow() + timedelta(minutes=5)

    otp_code = OTPCode(
        employee_id=employee.id,
        otp=otp,
        expires_at=expires_at
    )

    db.add(otp_code)
    db.commit()

    send_otp_email(
        recipient_email=employee.email,
        otp=otp
    )

    return {
        "message": "OTP sent successfully"
    }


@router.post("/verify-otp")
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    employee = db.query(Employee).filter(
        Employee.email == request.email
    ).first()

    if not employee:
        return {
            "message": "Employee not found"
        }

    otp_code = db.query(OTPCode).filter(
        OTPCode.employee_id == employee.id,
        OTPCode.otp == request.otp
    ).order_by(
        OTPCode.created_at.desc()
    ).first()

    if not otp_code:
        return {
            "message": "Invalid OTP"
        }

    if datetime.utcnow() > otp_code.expires_at:
        return {
            "message": "OTP expired"
        }

    access_token = create_access_token(
        employee_id=employee.id,
        role=employee.role
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "employee_id": employee.id,
        "role": employee.role
    }