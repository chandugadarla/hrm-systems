from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    WorkReport,
    Project,
    ProjectEmployee,
    WorkReportProject,
)
from app.schemas.work_report import (
    WorkReportCreate,
    WorkReportResponse,
    PerformanceRatingUpdate,
)
from app.utils.auth import require_role


router = APIRouter(
    prefix="/work-reports",
    tags=["Work Reports"]
)


# =========================
# EMPLOYEE - CREATE WORK REPORT
# =========================

@router.post("/", response_model=WorkReportResponse)
def create_work_report(
    report: WorkReportCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("employee"))
):
    employee_id = current_user["employee_id"]

    # Employees may only submit reports for projects assigned to them.
    assigned_projects = db.query(ProjectEmployee).filter(
        ProjectEmployee.employee_id == employee_id,
        ProjectEmployee.project_id.in_(report.project_ids)
    ).all()

    assigned_project_ids = {
        assignment.project_id
        for assignment in assigned_projects
    }

    invalid_project_ids = [
        project_id
        for project_id in report.project_ids
        if project_id not in assigned_project_ids
    ]

    if invalid_project_ids:
        raise HTTPException(
            status_code=403,
            detail="You can only submit reports for projects assigned to you"
        )

    new_report = WorkReport(
        employee_id=employee_id,
        report_date=report.report_date,
        work_description=report.work_description,
        tasks_completed=report.tasks_completed,
        hours_worked=report.hours_worked,
        status="submitted"
    )

    db.add(new_report)
    db.flush()

    # Keep the work report and its project relationships in separate tables.
    for project_id in report.project_ids:
        db.add(
            WorkReportProject(
                work_report_id=new_report.id,
                project_id=project_id
            )
        )

    db.commit()
    db.refresh(new_report)

    return new_report


# =========================
# EMPLOYEE - VIEW OWN REPORTS
# =========================

@router.get("/my", response_model=list[WorkReportResponse])
def get_my_work_reports(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("employee"))
):
    return (
        db.query(WorkReport)
        .filter(
            WorkReport.employee_id == current_user["employee_id"]
        )
        .order_by(WorkReport.report_date.desc(), WorkReport.id.desc())
        .all()
    )


# =========================
# HR - VIEW ALL REPORTS
# Includes the projects used for each report.
# =========================

@router.get("/all")
def get_all_work_reports(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr"))
):
    reports = (
        db.query(WorkReport)
        .order_by(WorkReport.report_date.desc(), WorkReport.id.desc())
        .all()
    )

    result = []

    for report in reports:
        project_rows = (
            db.query(Project.id, Project.name)
            .join(
                WorkReportProject,
                WorkReportProject.project_id == Project.id
            )
            .filter(
                WorkReportProject.work_report_id == report.id
            )
            .order_by(Project.name.asc())
            .all()
        )

        result.append({
            "id": report.id,
            "employee_id": report.employee_id,
            "report_date": report.report_date,
            "work_description": report.work_description,
            "tasks_completed": report.tasks_completed,
            "hours_worked": report.hours_worked,
            "status": report.status,
            "performance_rating": report.performance_rating,
            "created_at": report.created_at,
            "projects": [
                {
                    "id": project_id,
                    "name": project_name
                }
                for project_id, project_name in project_rows
            ],
        })

    return result


# =========================
# HR - RATE WORK REPORT
# =========================

@router.put(
    "/{report_id}/performance",
    response_model=WorkReportResponse
)
def rate_work_report(
    report_id: int,
    rating_data: PerformanceRatingUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr"))
):
    report = (
        db.query(WorkReport)
        .filter(WorkReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Work report not found"
        )

    report.performance_rating = rating_data.performance_rating
    report.status = "reviewed"

    db.commit()
    db.refresh(report)

    return report
