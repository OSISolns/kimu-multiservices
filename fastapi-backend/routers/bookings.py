from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

from ..models import Booking, ActivityLog
from ..schemas import BookingCreate, BookingUpdate
from ..auth_utils import get_current_user, require_roles
from ..database import get_session

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.get("")
def list_bookings(type: str = None, status: str = None, session: Session = Depends(get_session),
                  _: dict = Depends(get_current_user)):
    stmt = select(Booking)
    if type:
        stmt = stmt.where(Booking.type == type)
    if status:
        stmt = stmt.where(Booking.status == status)
    bookings = session.exec(stmt.order_by(Booking.createdAt.desc())).all()
    return {"success": True, "data": bookings}


@router.post("")
def create_booking(body: BookingCreate, session: Session = Depends(get_session)):
    """Public endpoint — no auth required for customer bookings."""
    booking = Booking(**body.model_dump(), createdAt=datetime.utcnow())
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return {"success": True, "data": booking}


@router.get("/{booking_id}")
def get_booking(booking_id: int, session: Session = Depends(get_session),
                _: dict = Depends(get_current_user)):
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"success": True, "data": booking}


@router.put("/{booking_id}")
def update_booking(booking_id: int, body: BookingUpdate, session: Session = Depends(get_session),
                   current_user: dict = Depends(get_current_user)):
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(booking, field, value)
    session.add(booking)
    log = ActivityLog(userId=int(current_user.get("userId", 0)),
                      action="booking_updated",
                      details=f"Booking #{booking_id} updated")
    session.add(log)
    session.commit()
    session.refresh(booking)
    return {"success": True, "data": booking}


@router.delete("/{booking_id}")
def delete_booking(booking_id: int, session: Session = Depends(get_session),
                   _: dict = Depends(require_roles("admin", "manager"))):
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    session.delete(booking)
    session.commit()
    return {"success": True, "message": "Booking deleted"}


@router.post("/{booking_id}/confirm-return")
def confirm_return(booking_id: int, session: Session = Depends(get_session),
                   _: dict = Depends(get_current_user)):
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.returnConfirmed = True
    booking.status = "Completed"
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return {"success": True, "data": booking}
