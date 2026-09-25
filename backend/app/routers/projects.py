from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Employee,
    Project,
    ProjectEmployee,
    Notification,
)
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectStatusUpdate,
)
from app.utils.auth import require_role
from app.utils.email import send_project_assignment_email


router = APIRouter(
    prefix="/projects",
    tags=["Project Management"],
)


# =========================================================
# HR - CREATE PROJECT
# =========================================================

@router.post(
    "/",
    response_model=ProjectResponse,
)
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr")),
):

    # -----------------------------------------------------
    # CREATE PROJECT
    # -----------------------------------------------------

    new_project = Project(
        name=project_data.name,
        description=project_data.description,
        status=project_data.status,
        start_date=project_data.start_date,
        end_date=project_data.end_date,
    )

    db.add(new_project)
    db.flush()

    # -----------------------------------------------------
    # ASSIGN EMPLOYEES
    # -----------------------------------------------------

    assigned_employees = []

    employee_ids = project_data.assigned_employee_ids or []

    for employee_id in employee_ids:

        employee = (
            db.query(Employee)
            .filter(
                Employee.id == employee_id,
                Employee.role == "employee",
            )
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=404,
                detail=f"Employee {employee_id} not found.",
            )

        assignment = ProjectEmployee(
            project_id=new_project.id,
            employee_id=employee.id,
        )

        db.add(assignment)

        assigned_employees.append(employee)

    # -----------------------------------------------------
    # SAVE PROJECT + ASSIGNMENTS
    # -----------------------------------------------------

    db.commit()
    db.refresh(new_project)

    # -----------------------------------------------------
    # CREATE EMPLOYEE NOTIFICATIONS
    # -----------------------------------------------------

    created_notifications = []

    for employee in assigned_employees:

        notification = Notification(
            employee_id=employee.id,
            title="New Project Assignment",
            message=(
                f"You have been assigned to the project "
                f"'{new_project.name}'. "
                f"{new_project.description or ''}"
            ),
            notification_type="project_assignment",
            event_date=new_project.start_date,
        )

        db.add(notification)
        created_notifications.append(notification)

    db.commit()

    # -----------------------------------------------------
    # SEND EMAILS
    # -----------------------------------------------------

    email_failures = []

    for employee in assigned_employees:

        if not employee.email:
            email_failures.append(
                f"EMP-{employee.id}: email missing"
            )
            continue

        employee_name = (
            f"{employee.first_name or ''} "
            f"{employee.last_name or ''}"
        ).strip()

        try:

            send_project_assignment_email(
                recipient_email=employee.email,
                employee_name=employee_name,
                project_name=new_project.name,
                project_description=new_project.description,
                start_date=new_project.start_date,
                end_date=new_project.end_date,
            )

            print(
                f"Project assignment email sent to "
                f"{employee.email}"
            )

        except Exception as error:

            print(
                f"Project assignment email failed "
                f"for {employee.email}: {error}"
            )

            email_failures.append(employee.email)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    response_message = "Project created successfully."

    if assigned_employees:
        response_message += (
            f" {len(assigned_employees)} employee(s) "
            f"were assigned and notified."
        )

    if email_failures:
        response_message += (
            " Email could not be sent to: "
            + ", ".join(email_failures)
        )

    return {
        "id": new_project.id,
        "name": new_project.name,
        "description": new_project.description,
        "status": new_project.status,
        "start_date": new_project.start_date,
        "end_date": new_project.end_date,
        "assigned_employee_ids": [
            employee.id
            for employee in assigned_employees
        ],
        "created_at": new_project.created_at,
    }


# =========================================================
# HR - VIEW ALL PROJECTS
# =========================================================

@router.get(
    "/all",
    response_model=list[ProjectResponse],
)
def get_all_projects(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr")),
):

    projects = (
        db.query(Project)
        .order_by(Project.created_at.desc())
        .all()
    )

    result = []

    for project in projects:

        assignments = (
            db.query(ProjectEmployee)
            .filter(
                ProjectEmployee.project_id == project.id
            )
            .all()
        )

        employee_ids = [
            assignment.employee_id
            for assignment in assignments
        ]

        result.append(
            {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "start_date": project.start_date,
                "end_date": project.end_date,
                "assigned_employee_ids": employee_ids,
                "created_at": project.created_at,
            }
        )

    return result


# =========================================================
# EMPLOYEE - VIEW MY PROJECTS
# =========================================================

@router.get(
    "/my",
    response_model=list[ProjectResponse],
)
def get_my_projects(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("employee")),
):

    employee_id = current_user.get("employee_id")

    if not employee_id:
        raise HTTPException(
            status_code=401,
            detail="Employee ID missing from login token.",
        )

    projects = (
        db.query(Project)
        .join(
            ProjectEmployee,
            ProjectEmployee.project_id == Project.id,
        )
        .filter(
            ProjectEmployee.employee_id == employee_id
        )
        .order_by(Project.created_at.desc())
        .all()
    )

    result = []

    for project in projects:

        assignments = (
            db.query(ProjectEmployee)
            .filter(
                ProjectEmployee.project_id == project.id
            )
            .all()
        )

        result.append(
            {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "start_date": project.start_date,
                "end_date": project.end_date,
                "assigned_employee_ids": [
                    assignment.employee_id
                    for assignment in assignments
                ],
                "created_at": project.created_at,
            }
        )

    return result


# =========================================================
# HR - UPDATE PROJECT STATUS
# =========================================================

@router.put(
    "/{project_id}/status",
    response_model=ProjectResponse,
)
def update_project_status(
    project_id: int,
    status_data: ProjectStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr")),
):

    allowed_statuses = {
        "ongoing",
        "completed",
    }

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Status must be ongoing or completed.",
        )

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    project.status = status_data.status

    db.commit()
    db.refresh(project)

    return project


# =========================================================
# PROJECT SUMMARY
# =========================================================

@router.get("/summary")
def get_project_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr")),
):

    total_projects = (
        db.query(func.count(Project.id))
        .scalar()
    )

    ongoing_projects = (
        db.query(func.count(Project.id))
        .filter(Project.status == "ongoing")
        .scalar()
    )

    completed_projects = (
        db.query(func.count(Project.id))
        .filter(Project.status == "completed")
        .scalar()
    )

    return {
        "total_projects": total_projects,
        "ongoing_projects": ongoing_projects,
        "completed_projects": completed_projects,
    }