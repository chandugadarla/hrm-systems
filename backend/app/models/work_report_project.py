from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WorkReportProject(Base):
    __tablename__ = "work_report_projects"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    work_report_id: Mapped[int] = mapped_column(
        ForeignKey("work_reports.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )