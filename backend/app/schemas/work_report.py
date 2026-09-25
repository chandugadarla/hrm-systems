from datetime import date, datetime

from pydantic import BaseModel, Field


class WorkReportCreate(BaseModel):
    report_date: date

    project_ids: list[int] = Field(
        min_length=1,
        description="One or more projects assigned to the employee"
    )

    work_description: str
    tasks_completed: str | None = None
    hours_worked: int | None = Field(
        default=None,
        ge=0,
        le=24
    )


class WorkReportResponse(BaseModel):
    id: int
    employee_id: int
    report_date: date
    work_description: str
    tasks_completed: str | None
    hours_worked: int | None
    status: str
    performance_rating: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class PerformanceRatingUpdate(BaseModel):
    performance_rating: int = Field(
        ge=1,
        le=5
    )