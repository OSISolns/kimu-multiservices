from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from datetime import datetime

from ..models import Payment
from ..schemas import PaymentCreate, PaymentUpdate
from ..auth_utils import get_current_user, require_roles
from ..database import get_session

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("")
def list_payments(status: str = None, bookingType: str = None,
                  session: Session = Depends(get_session),
                  _: dict = Depends(get_current_user)):
    stmt = select(Payment)
    if status:
        stmt = stmt.where(Payment.status == status)
    if bookingType:
        stmt = stmt.where(Payment.bookingType == bookingType)
    payments = session.exec(stmt.order_by(Payment.paymentDate.desc())).all()
    return payments


@router.post("")
def create_payment(body: PaymentCreate, session: Session = Depends(get_session),
                   current_user: dict = Depends(get_current_user)):
    payment = Payment(**body.model_dump(), userId=int(current_user.get("userId", 0)))
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return {"success": True, "data": payment}


@router.put("/{payment_id}")
def update_payment(payment_id: int, body: PaymentUpdate,
                   session: Session = Depends(get_session),
                   _: dict = Depends(require_roles("admin", "accountant"))):
    payment = session.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(payment, field, value)
    session.add(payment)
    session.commit()
    session.refresh(payment)
    return {"success": True, "data": payment}


@router.get("/summary")
def financial_summary(session: Session = Depends(get_session),
                      _: dict = Depends(require_roles("admin", "accountant", "manager"))):
    total = session.exec(
        select(func.sum(Payment.amount)).where(Payment.status == "completed")
    ).one() or 0
    pending = session.exec(
        select(func.sum(Payment.amount)).where(Payment.status == "pending")
    ).one() or 0
    count = session.exec(select(func.count(Payment.id))).one() or 0
    return {"success": True, "totalRevenue": total, "pendingAmount": pending, "totalTransactions": count}
