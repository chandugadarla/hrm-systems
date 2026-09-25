from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WorkReport(Base):
    __tablename__ = "work_reports"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"),
        nullable=False,
        index=True
    )

    report_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    work_description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    tasks_completed: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    hours_worked: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="submitted"
    )

    performance_rating: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )