from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.models import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.routers.auth import router as auth_router
from app.routers.work_reports import router as work_reports_router
from app.utils.auth import get_current_user, require_role
from app.routers.leaves import router as leaves_router
from app.routers.projects import router as projects_router
from app.routers.notifications import router as notifications_router
from app.routers.dashboard import router as dashboard_router    
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="HRM System")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(work_reports_router)
app.include_router(leaves_router)
app.include_router(projects_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)


@app.get("/")
def home():
    return {
        "message": "HRM Backend is running"
    }


@app.get("/db-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))

        return {
            "database": "connected",
            "result": result.scalar()
        }


# =========================
# EMPLOYEE MANAGEMENT
# =========================

@app.post("/employees")
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr"))
):
    new_employee = Employee(
        first_name=employee.first_name,
        last_name=employee.last_name,
        email=employee.email,
        role=employee.role,
        department=employee.department,
        designation=employee.designation
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return new_employee


@app.get("/employees")
def get_employees(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr"))
):
    employees = db.query(Employee).all()

    return employees


@app.get("/employees/{employee_id}")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr"))
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        return {
            "message": "Employee not found"
        }

    return employee


@app.put("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr"))
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        return {
            "message": "Employee not found"
        }

    update_data = employee_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    return employee


@app.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("hr"))
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        return {
            "message": "Employee not found"
        }

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee deleted successfully"
    }


# =========================
# AUTHENTICATED USER
# =========================

@app.get("/me")
def get_my_profile(
    current_user: dict = Depends(get_current_user)
):
    return {
        "message": "Authenticated successfully",
        "employee_id": current_user["employee_id"],
        "role": current_user["role"]
    }


# =========================
# HR TEST
# =========================

@app.get("/hr-test")
def hr_test(
    current_user: dict = Depends(require_role("hr"))
):
    return {
        "message": "HR access granted",
        "employee_id": current_user["employee_id"],
        "role": current_user["role"]
    }


# =========================
# EMPLOYEE TEST
# =========================

@app.get("/employee/profile")
def employee_profile(
    current_user: dict = Depends(require_role("employee"))
):
    return {
        "message": "Employee access granted",
        "employee_id": current_user["employee_id"],
        "role": current_user["role"]
    }