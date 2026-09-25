import os
import smtplib
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from dotenv import load_dotenv

load_dotenv()


def _smtp_config():
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_host or not smtp_username or not smtp_password:
        raise RuntimeError(
            "SMTP configuration is missing. "
            "Check SMTP_HOST, SMTP_USERNAME and SMTP_PASSWORD in .env"
        )

    return smtp_host, smtp_port, smtp_username, smtp_password


def _send_message(message):
    smtp_host, smtp_port, smtp_username, smtp_password = _smtp_config()

    if smtp_port == 465:
        with smtplib.SMTP_SSL(
            smtp_host, smtp_port, timeout=30
        ) as server:
            server.login(smtp_username, smtp_password)
            server.sendmail(
                smtp_username,
                message["To"],
                message.as_string()
            )
    else:
        with smtplib.SMTP(
            smtp_host, smtp_port, timeout=30
        ) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_username, smtp_password)
            server.sendmail(
                smtp_username,
                message["To"],
                message.as_string()
            )


def _attach_logo(message):
    logo_path = (
        Path(__file__).resolve().parent.parent
        / "static"
        / "HRMLogo.png"
    )

    if not logo_path.exists():
        return

    try:
        with open(logo_path, "rb") as image_file:
            logo = MIMEImage(image_file.read())
            logo.add_header(
                "Content-ID",
                "<hrm_logo>"
            )
            logo.add_header(
                "Content-Disposition",
                "inline",
                filename="HRMLogo.png"
            )
            message.attach(logo)
    except Exception as error:
        print(f"Could not attach HRM logo: {error}")


# =========================================================
# OTP EMAIL
# =========================================================

def send_otp_email(
    recipient_email: str,
    otp: str
):
    _, _, smtp_username, _ = _smtp_config()

    message = MIMEMultipart("related")
    message["Subject"] = "Your HRM Login OTP"
    message["From"] = smtp_username
    message["To"] = recipient_email

    html_body = f"""
<html>
<body style="font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: auto; padding: 30px;
                border: 1px solid #e5e7eb; border-radius: 10px;">

        <div style="text-align: center;">
            <img src="cid:hrm_logo"
                 alt="HRM"
                 style="max-width: 180px;">
        </div>

        <h2 style="text-align: center;">HRM Login Verification</h2>

        <p>Your One-Time Password (OTP) is:</p>

        <div style="text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold;
                         letter-spacing: 8px;">
                {otp}
            </span>
        </div>

        <p>This OTP is valid for a limited time.</p>
        <p>If you did not request this OTP, please ignore this email.</p>

        <p>Regards,<br><strong>HRM Team</strong></p>
    </div>
</body>
</html>
"""

    text_body = f"""
HRM Login Verification

Your OTP is: {otp}

This OTP is valid for a limited time.

If you did not request this OTP, please ignore this email.

Regards,
HRM Team
"""

    alternative = MIMEMultipart("alternative")
    alternative.attach(MIMEText(text_body, "plain"))
    alternative.attach(MIMEText(html_body, "html"))
    message.attach(alternative)

    _attach_logo(message)
    _send_message(message)

    print(f"OTP email sent successfully to: {recipient_email}")


# =========================================================
# PROJECT ASSIGNMENT EMAIL
# =========================================================

def send_project_assignment_email(
    recipient_email: str,
    employee_name: str,
    project_name: str
):
    _, _, smtp_username, _ = _smtp_config()

    message = MIMEMultipart("related")
    message["Subject"] = f"New Project Assignment - {project_name}"
    message["From"] = smtp_username
    message["To"] = recipient_email

    html_body = f"""
<html>
<body style="font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: auto; padding: 30px;
                border: 1px solid #e5e7eb; border-radius: 10px;">

        <div style="text-align: center;">
            <img src="cid:hrm_logo"
                 alt="HRM"
                 style="max-width: 180px;">
        </div>

        <h2>New Project Assignment</h2>

        <p>Hello <strong>{employee_name}</strong>,</p>

        <p>You have been assigned to a new project.</p>

        <p>
            <strong>Project:</strong> {project_name}
        </p>

        <p>Please check your HRM dashboard for more details.</p>

        <p>Regards,<br><strong>HRM Team</strong></p>
    </div>
</body>
</html>
"""

    text_body = f"""
New Project Assignment

Hello {employee_name},

You have been assigned to a new project.

Project: {project_name}

Please check your HRM dashboard for more details.

Regards,
HRM Team
"""

    alternative = MIMEMultipart("alternative")
    alternative.attach(MIMEText(text_body, "plain"))
    alternative.attach(MIMEText(html_body, "html"))
    message.attach(alternative)

    _attach_logo(message)
    _send_message(message)

    print(
        f"Project assignment email sent successfully to: "
        f"{recipient_email}"
    )


# =========================================================
# LEAVE STATUS EMAIL
# =========================================================

def send_leave_status_email(
    recipient_email: str,
    employee_name: str,
    leave_type: str,
    start_date: str,
    end_date: str,
    status: str
):
    _, _, smtp_username, _ = _smtp_config()

    status_text = status.capitalize()

    message = MIMEMultipart("related")
    message["Subject"] = f"Leave Request {status_text} - HRM"
    message["From"] = smtp_username
    message["To"] = recipient_email

    text_body = f"""
Leave Request {status_text}

Hello {employee_name},

Your leave request has been {status}.

Leave Type: {leave_type}
Start Date: {start_date}
End Date: {end_date}
Status: {status_text}

Regards,
HRM Team
"""

    html_body = f"""
<html>
<body style="font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: auto; padding: 30px;
                border: 1px solid #e5e7eb; border-radius: 10px;">

        <div style="text-align: center;">
            <img src="cid:hrm_logo"
                 alt="HRM"
                 style="max-width: 180px;">
        </div>

        <h2>Leave Request {status_text}</h2>

        <p>Hello <strong>{employee_name}</strong>,</p>

        <p>
            Your leave request has been
            <strong>{status}</strong>.
        </p>

        <p>
            <strong>Leave Type:</strong> {leave_type}<br>
            <strong>Start Date:</strong> {start_date}<br>
            <strong>End Date:</strong> {end_date}<br>
            <strong>Status:</strong> {status_text}
        </p>

        <p>Regards,<br><strong>HRM Team</strong></p>
    </div>
</body>
</html>
"""

    alternative = MIMEMultipart("alternative")
    alternative.attach(MIMEText(text_body, "plain"))
    alternative.attach(MIMEText(html_body, "html"))
    message.attach(alternative)

    _attach_logo(message)
    _send_message(message)

    print(
        f"Leave status email sent successfully to: "
        f"{recipient_email}"
    )
