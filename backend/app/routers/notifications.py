from datetime import date
import os
import smtplib
from email.message import EmailMessage

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, Notification
from app.schemas.notification import NotificationCreate, NotificationResponse
from app.utils.auth import get_current_user, require_role


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)


# =========================================================
# SERIALIZE NOTIFICATION
# =========================================================

def serialize_notification(notification: Notification) -> dict:
    return {
        "id": notification.id,
        "employee_id": notification.employee_id,
        "title": notification.title,
        "message": notification.message,
        "notification_type": notification.notification_type,
        "event_date": (
            notification.event_date.isoformat()
            if notification.event_date
            else None
        ),
        "created_at": (
            notification.created_at.isoformat()
            if notification.created_at
            else None
        ),
    }


# =========================================================
# EMAIL
# =========================================================

def send_notification_email(
    recipient_email: str,
    employee_name: str,
    title: str,
    message_text: str,
    notification_type: str,
    event_date: str,
):
    """
    Send HR notification email to one employee.

    Email failure must NEVER cancel the database notification.
    """

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_host:
        raise ValueError("SMTP_HOST is missing in .env")

    if not smtp_username:
        raise ValueError("SMTP_USERNAME is missing in .env")

    if not smtp_password:
        raise ValueError("SMTP_PASSWORD is missing in .env")

    if not recipient_email:
        return

    message = EmailMessage()

    message["Subject"] = f"HRM System - {title}"
    message["From"] = smtp_username
    message["To"] = recipient_email

    plain_text = f"""
Hello {employee_name},

A new notification has been published by HR.

Title: {title}
Type: {notification_type}
Date: {event_date}

{message_text}

Please log in to the HRM portal to view the notification.

Regards,
HRM System
"""

    message.set_content(plain_text)

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="
    margin:0;
    padding:0;
    background:#f5f7fa;
    font-family:Arial,Helvetica,sans-serif;
">

    <div style="
        width:100%;
        padding:40px 0;
        background:#f5f7fa;
    ">

        <div style="
            max-width:620px;
            width:90%;
            margin:0 auto;
            background:#ffffff;
            border:1px solid #e5e7eb;
            border-radius:14px;
            overflow:hidden;
        ">

            <div style="
                background:#162238;
                padding:28px 30px;
                color:#ffffff;
            ">
                <div style="
                    font-size:13px;
                    letter-spacing:1.5px;
                    text-transform:uppercase;
                    opacity:.8;
                ">
                    HRM System
                </div>

                <h1 style="
                    margin:8px 0 0;
                    font-size:24px;
                    font-weight:600;
                ">
                    New HR Notification
                </h1>
            </div>

            <div style="padding:32px 30px;">

                <p style="
                    margin:0 0 20px;
                    color:#344054;
                    font-size:15px;
                ">
                    Hello {employee_name},
                </p>

                <div style="
                    padding:20px;
                    background:#f8fafc;
                    border:1px solid #e4e7ec;
                    border-radius:10px;
                ">

                    <div style="
                        color:#667085;
                        font-size:12px;
                        text-transform:uppercase;
                        letter-spacing:1px;
                        margin-bottom:8px;
                    ">
                        {notification_type}
                    </div>

                    <h2 style="
                        margin:0 0 12px;
                        color:#101828;
                        font-size:22px;
                    ">
                        {title}
                    </h2>

                    <div style="
                        color:#667085;
                        font-size:13px;
                        margin-bottom:18px;
                    ">
                        Event date: {event_date}
                    </div>

                    <p style="
                        margin:0;
                        color:#475467;
                        font-size:15px;
                        line-height:1.7;
                        white-space:pre-line;
                    ">
                        {message_text}
                    </p>

                </div>

                <p style="
                    margin:24px 0 0;
                    color:#667085;
                    font-size:13px;
                    line-height:1.6;
                ">
                    Please log in to the HRM portal to view the complete notification.
                </p>

            </div>

            <div style="
                padding:18px 30px;
                background:#fafafa;
                border-top:1px solid #eaecf0;
                text-align:center;
                color:#98a2b3;
                font-size:11px;
            ">
                HRM System • Secure Employee Management
            </div>

        </div>

    </div>

</body>
</html>
"""

    message.add_alternative(
        html_content,
        subtype="html",
    )

    try:
        if smtp_port == 465:

            with smtplib.SMTP_SSL(
                smtp_host,
                smtp_port,
                timeout=20,
            ) as server:

                server.login(
                    smtp_username,
                    smtp_password,
                )

                server.send_message(message)

        else:

            with smtplib.SMTP(
                smtp_host,
                smtp_port,
                timeout=20,
            ) as server:

                server.ehlo()
                server.starttls()
                server.ehlo()

                server.login(
                    smtp_username,
                    smtp_password,
                )

                server.send_message(message)

        print(
            f"Notification email sent successfully to {recipient_email}"
        )

    except Exception as error:

        # IMPORTANT:
        # Email failure must not break notification creation.
        print(
            f"Notification email failed for {recipient_email}: {error}"
        )


# =========================================================
# HR - CREATE NOTIFICATION
# =========================================================

@router.post(
    "/",
    response_model=NotificationResponse,
)
def create_notification(
    notification_data: NotificationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr")),
):

    title = notification_data.title.strip()
    message = notification_data.message.strip()
    notification_type = notification_data.notification_type.strip()

    if not title:
        raise HTTPException(
            status_code=400,
            detail="Notification title is required.",
        )

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Notification message is required.",
        )

    if notification_type not in {
        "Public Holiday",
        "Festival",
        "Announcement",
    }:
        raise HTTPException(
            status_code=400,
            detail=(
                "Notification type must be "
                "Public Holiday, Festival, or Announcement."
            ),
        )

    if not notification_data.event_date:
        raise HTTPException(
            status_code=400,
            detail="Event date is required.",
        )

    # -----------------------------------------------------
    # CREATE GLOBAL NOTIFICATION
    # employee_id=None means every employee
    # -----------------------------------------------------

    new_notification = Notification(
        employee_id=None,
        title=title,
        message=message,
        notification_type=notification_type,
        event_date=notification_data.event_date,
    )

    db.add(new_notification)

    # Save FIRST.
    # This guarantees the notification exists even if email fails.
    db.commit()
    db.refresh(new_notification)

    # -----------------------------------------------------
    # GET ALL EMPLOYEES
    # -----------------------------------------------------

    employees = (
        db.query(Employee)
        .filter(Employee.role == "employee")
        .all()
    )

    # -----------------------------------------------------
    # SEND EMAIL TO EVERY EMPLOYEE
    # -----------------------------------------------------

    for employee in employees:

        if not employee.email:
            continue

        employee_name = (
            f"{employee.first_name or ''} "
            f"{employee.last_name or ''}"
        ).strip()

        background_tasks.add_task(
            send_notification_email,
            employee.email,
            employee_name or "Employee",
            title,
            message,
            notification_type,
            str(notification_data.event_date),
        )

    return new_notification


# =========================================================
# ALL AUTHENTICATED USERS - VIEW NOTIFICATIONS
# =========================================================

@router.get(
    "/",
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    query = db.query(Notification)

    # -----------------------------------------------------
    # EMPLOYEE
    # -----------------------------------------------------

    if current_user.get("role") == "employee":

        employee_id = current_user.get("employee_id")

        if not employee_id:
            raise HTTPException(
                status_code=401,
                detail="Employee ID is missing from login token.",
            )

        # Global notifications + personal notifications.
        #
        # IMPORTANT:
        # No event_date filter here.
        # If HR published it, employees should be able
        # to see it.
        query = query.filter(
            (Notification.employee_id == employee_id)
            | (Notification.employee_id.is_(None))
        )

    # -----------------------------------------------------
    # HR
    # -----------------------------------------------------

    notifications = (
        query
        .order_by(
            Notification.created_at.desc(),
            Notification.event_date.desc(),
        )
        .all()
    )

    return [
        serialize_notification(notification)
        for notification in notifications
    ]


# =========================================================
# VIEW ONE NOTIFICATION
# =========================================================

@router.get("/{notification_id}")
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    # HR can view any notification.

    if current_user.get("role") == "hr":
        return serialize_notification(notification)

    # Employee can view:
    # - global notification
    # - their own notification

    employee_id = current_user.get("employee_id")

    if (
        notification.employee_id is not None
        and notification.employee_id != employee_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this notification.",
        )

    return serialize_notification(notification)
