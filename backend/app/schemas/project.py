from datetime import date, datetime

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    status: str = "ongoing"
    start_date: date
    end_date: date | None = None

    # Multiple employees can be assigned to one project
    assigned_employee_ids: list[int] = Field(default_factory=list)


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None
    status: str
    start_date: date
    end_date: date | None

    # Return all assigned employee IDs
    assigned_employee_ids: list[int] = Field(default_factory=list)

    created_at: datetime

    class Config:
        from_attributes = True


class ProjectStatusUpdate(BaseModel):
    status: str