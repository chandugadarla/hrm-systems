from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, LeaveRequest, Notification
from app.schemas.leave import (
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveStatusUpdate,
)
from app.utils.auth import get_current_user, require_role
from app.utils.email import send_leave_status_email


router = APIRouter(
    prefix="/leaves",
    tags=["Leaves"]
)


# =========================================================
# EMPLOYEE - APPLY FOR LEAVE
# =========================================================

@router.post(
    "/",
    response_model=LeaveRequestResponse
)
def create_leave_request(
    leave_data: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("employee"))
):
    employee_id = current_user["employee_id"]

    leave = LeaveRequest(
        employee_id=employee_id,
        leave_type=leave_data.leave_type,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        reason=leave_data.reason,
        status="pending",
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


# =========================================================
# EMPLOYEE - VIEW MY LEAVES
# =========================================================

@router.get(
    "/my",
    response_model=list[LeaveRequestResponse]
)
def get_my_leaves(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("employee"))
):
    employee_id = current_user["employee_id"]

    leaves = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == employee_id
        )
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )

    return leaves


# =========================================================
# HR - VIEW ALL LEAVE REQUESTS
# =========================================================

@router.get(
    "/all",
    response_model=list[LeaveRequestResponse]
)
def get_all_leaves(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr"))
):
    leaves = (
        db.query(LeaveRequest)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )

    return leaves


# =========================================================
# HR - APPROVE / REJECT / REVOKE LEAVE
# =========================================================

@router.put(
    "/{leave_id}/status",
    response_model=LeaveRequestResponse
)
def update_leave_status(
    leave_id: int,
    status_data: LeaveStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr"))
):
    # Allowed statuses
    allowed_statuses = {
        "approved",
        "rejected",
        "revoked",
    }

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid leave status"
        )

    # Find leave request
    leave = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.id == leave_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    # Find employee who submitted the leave
    employee = (
        db.query(Employee)
        .filter(
            Employee.id == leave.employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # Update leave status
    leave.status = status_data.status

    # =====================================================
    # CREATE PERSONAL DASHBOARD NOTIFICATION
    # =====================================================

    notification = Notification(
        employee_id=employee.id,
        title=f"Leave {status_data.status.capitalize()}",
        message=(
            f"Your {leave.leave_type} leave request "
            f"from {leave.start_date} to {leave.end_date} "
            f"has been {status_data.status}."
        ),
        notification_type="leave_status",
        event_date=leave.start_date,
    )

    db.add(notification)

    # Save database changes first
    db.commit()
    db.refresh(leave)

    # =====================================================
    # SEND EMAIL
    # =====================================================

    try:
        send_leave_status_email(
            recipient_email=employee.email,
            employee_name=(
                f"{employee.first_name} "
                f"{employee.last_name}"
            ),
            leave_type=leave.leave_type,
            start_date=str(leave.start_date),
            end_date=str(leave.end_date),
            status=leave.status,
        )

    except Exception as error:
        # Do not undo the leave status if email fails
        print(
            f"Leave status updated, but email failed "
            f"for {employee.email}: {error}"
        )

    return leave


# =========================================================
# EMPLOYEE - VIEW SINGLE LEAVE
# =========================================================

@router.get(
    "/{leave_id}",
    response_model=LeaveRequestResponse
)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    leave = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.id == leave_id
        )
        .first()
    )

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    # HR can view any leave
    if current_user["role"] == "hr":
        return leave

    # Employee can only view their own leave
    if leave.employee_id != current_user["employee_id"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this leave request"
        )

    return leave