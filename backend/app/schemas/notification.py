from datetime import date, datetime

from pydantic import BaseModel


class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str
    event_date: date


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    event_date: date
    created_at: datetime

    class Config:
        from_attributes = True