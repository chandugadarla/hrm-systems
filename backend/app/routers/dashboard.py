from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, WorkReport, LeaveRequest, Project
from app.utils.auth import require_role


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# =========================
# HR DASHBOARD SUMMARY
# =========================

@router.get("/hr")
def get_hr_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr"))
):
    total_employees = db.query(
        func.count(Employee.id)
    ).filter(
        Employee.role == "employee"
    ).scalar()

    total_work_reports = db.query(
        func.count(WorkReport.id)
    ).scalar()

    pending_leaves = db.query(
        func.count(LeaveRequest.id)
    ).filter(
        LeaveRequest.status == "pending"
    ).scalar()

    total_projects = db.query(
        func.count(Project.id)
    ).scalar()

    ongoing_projects = db.query(
        func.count(Project.id)
    ).filter(
        Project.status == "ongoing"
    ).scalar()

    completed_projects = db.query(
        func.count(Project.id)
    ).filter(
        Project.status == "completed"
    ).scalar()

    return {
        "total_employees": total_employees,
        "total_work_reports": total_work_reports,
        "pending_leave_requests": pending_leaves,
        "total_projects": total_projects,
        "ongoing_projects": ongoing_projects,
        "completed_projects": completed_projects
    }
# =========================
# EMPLOYEE DASHBOARD SUMMARY
# =========================

@router.get("/employee")
def get_employee_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("employee"))
):
    employee_id = current_user["employee_id"]

    total_work_reports = db.query(
        func.count(WorkReport.id)
    ).filter(
        WorkReport.employee_id == employee_id
    ).scalar()

    pending_leaves = db.query(
        func.count(LeaveRequest.id)
    ).filter(
        LeaveRequest.employee_id == employee_id,
        LeaveRequest.status == "pending"
    ).scalar()

    approved_leaves = db.query(
        func.count(LeaveRequest.id)
    ).filter(
        LeaveRequest.employee_id == employee_id,
        LeaveRequest.status == "approved"
    ).scalar()

    assigned_projects = db.query(
        func.count(Project.id)
    ).filter(
        Project.assigned_employee_id == employee_id
    ).scalar()

    ongoing_projects = db.query(
        func.count(Project.id)
    ).filter(
        Project.assigned_employee_id == employee_id,
        Project.status == "ongoing"
    ).scalar()

    completed_projects = db.query(
        func.count(Project.id)
    ).filter(
        Project.assigned_employee_id == employee_id,
        Project.status == "completed"
    ).scalar()

    return {
        "total_work_reports": total_work_reports,
        "pending_leave_requests": pending_leaves,
        "approved_leave_requests": approved_leaves,
        "assigned_projects": assigned_projects,
        "ongoing_projects": ongoing_projects,
        "completed_projects": completed_projects
    }