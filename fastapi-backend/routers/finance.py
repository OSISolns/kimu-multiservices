from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
import uuid

from ..models import FinanceContract, FinancePayment, ClientCredit, SavedItem, CarListing
from ..schemas import (FinanceContractCreate, FinancePaymentCreate,
                        ClientCreditCreate, ClientCreditUpdate, CreditPaymentRequest)
from ..auth_utils import get_current_user, require_roles
from ..database import get_session

router = APIRouter(tags=["finance"])


# ─── Finance Contracts ────────────────────────────────────────────────────────

@router.get("/api/finance-contracts")
def list_contracts(session: Session = Depends(get_session), _: dict = Depends(get_current_user)):
    contracts = session.exec(select(FinanceContract).order_by(FinanceContract.createdAt.desc())).all()
    return {"success": True, "data": contracts}


@router.post("/api/finance-contracts")
def create_contract(body: FinanceContractCreate, session: Session = Depends(get_session),
                    _: dict = Depends(require_roles("admin", "accountant", "manager"))):
    contract = FinanceContract(
        id=str(uuid.uuid4()),
        **body.model_dump(),
        createdAt=datetime.utcnow(),
        updatedAt=datetime.utcnow()
    )
    session.add(contract)
    session.commit()
    session.refresh(contract)
    return {"success": True, "data": contract}


@router.put("/api/finance-contracts/{contract_id}/status")
def update_contract_status(contract_id: str, status: str,
                            session: Session = Depends(get_session),
                            _: dict = Depends(require_roles("admin", "accountant"))):
    contract = session.get(FinanceContract, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    contract.status = status
    contract.updatedAt = datetime.utcnow()
    session.add(contract)
    session.commit()
    return {"success": True, "data": contract}


@router.post("/api/finance-contracts/{contract_id}/payments")
def record_finance_payment(contract_id: str, body: FinancePaymentCreate,
                            session: Session = Depends(get_session),
                            current_user: dict = Depends(get_current_user)):
    contract = session.get(FinanceContract, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    payment = FinancePayment(
        id=str(uuid.uuid4()),
        contractId=contract_id,
        amount=body.amount,
        notes=body.notes,
        recordedBy=int(current_user.get("userId", 0)),
        paymentDate=datetime.utcnow(),
        createdAt=datetime.utcnow()
    )
    contract.amountPaid += body.amount
    if contract.amountPaid >= contract.totalPrice:
        contract.status = "COMPLETED"
    session.add(payment)
    session.add(contract)
    session.commit()
    return {"success": True, "data": payment}


# ─── Client Credits ───────────────────────────────────────────────────────────

@router.get("/api/client-credits")
def list_credits(session: Session = Depends(get_session), _: dict = Depends(get_current_user)):
    return {"success": True, "data": session.exec(select(ClientCredit).order_by(ClientCredit.createdAt.desc())).all()}


@router.post("/api/client-credits")
def create_credit(body: ClientCreditCreate, session: Session = Depends(get_session),
                  _: dict = Depends(get_current_user)):
    credit = ClientCredit(**body.model_dump(), createdAt=datetime.utcnow(), updatedAt=datetime.utcnow())
    session.add(credit)
    session.commit()
    session.refresh(credit)
    return {"success": True, "data": credit}


@router.put("/api/client-credits/{credit_id}")
def update_credit(credit_id: int, body: ClientCreditUpdate, session: Session = Depends(get_session),
                  _: dict = Depends(get_current_user)):
    credit = session.get(ClientCredit, credit_id)
    if not credit:
        raise HTTPException(status_code=404, detail="Client credit not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(credit, field, value)
    credit.updatedAt = datetime.utcnow()
    session.add(credit)
    session.commit()
    return {"success": True, "data": credit}


@router.post("/api/client-credits/{credit_id}/pay")
def pay_credit(credit_id: int, body: CreditPaymentRequest, session: Session = Depends(get_session),
               _: dict = Depends(get_current_user)):
    credit = session.get(ClientCredit, credit_id)
    if not credit:
        raise HTTPException(status_code=404, detail="Client credit not found")
    credit.paidAmount += body.amount
    credit.status = "paid" if credit.paidAmount >= credit.totalCredit else "active"
    credit.updatedAt = datetime.utcnow()
    session.add(credit)
    session.commit()
    return {"success": True, "data": credit}


# ─── Saved Items ──────────────────────────────────────────────────────────────

@router.get("/api/saved-items")
def list_saved(session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    user_id = int(current_user.get("userId", 0))
    items = session.exec(select(SavedItem).where(SavedItem.userId == user_id)).all()
    return {"success": True, "data": items}


@router.post("/api/saved-items")
def save_item(itemType: str, itemId: int, notes: str = None,
              session: Session = Depends(get_session),
              current_user: dict = Depends(get_current_user)):
    user_id = int(current_user.get("userId", 0))
    existing = session.exec(
        select(SavedItem).where(SavedItem.userId == user_id,
                                SavedItem.itemType == itemType,
                                SavedItem.itemId == itemId)
    ).first()
    if existing:
        return {"success": True, "data": existing, "message": "Already saved"}
    item = SavedItem(userId=user_id, itemType=itemType, itemId=itemId, notes=notes,
                     createdAt=datetime.utcnow(), updatedAt=datetime.utcnow())
    session.add(item)
    session.commit()
    session.refresh(item)
    return {"success": True, "data": item}


@router.delete("/api/saved-items/{item_id}")
def delete_saved(item_id: int, session: Session = Depends(get_session),
                 _: dict = Depends(get_current_user)):
    item = session.get(SavedItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Saved item not found")
    session.delete(item)
    session.commit()
    return {"success": True}


# ─── Car Listings ─────────────────────────────────────────────────────────────

@router.get("/api/car-listings")
def list_car_listings(status: str = None, session: Session = Depends(get_session)):
    stmt = select(CarListing)
    if status:
        stmt = stmt.where(CarListing.status == status)
    return {"success": True, "data": session.exec(stmt.order_by(CarListing.createdAt.desc())).all()}


@router.post("/api/car-listings")
def create_car_listing(body: dict, session: Session = Depends(get_session)):
    """Public endpoint for sell-your-car submissions."""
    import json
    listing = CarListing(
        userId=body.get("userId", 1),
        make=body.get("make", ""),
        model=body.get("model", ""),
        year=body.get("year", 2020),
        price=body.get("price", 0),
        mileage=body.get("mileage", 0),
        condition=body.get("condition", "Used"),
        transmission=body.get("transmission", "Manual"),
        fuelType=body.get("fuelType", "Petrol"),
        color=body.get("color", ""),
        description=body.get("description"),
        images=json.dumps(body.get("images", [])),
        contactPhone=body.get("contactPhone", ""),
        location=body.get("location", ""),
        createdAt=datetime.utcnow(),
        updatedAt=datetime.utcnow()
    )
    session.add(listing)
    session.commit()
    session.refresh(listing)
    return {"success": True, "data": listing}


@router.put("/api/car-listings/{listing_id}/status")
def update_listing_status(listing_id: int, status: str, session: Session = Depends(get_session),
                           _: dict = Depends(require_roles("admin", "manager"))):
    listing = session.get(CarListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.status = status
    listing.updatedAt = datetime.utcnow()
    session.add(listing)
    session.commit()
    return {"success": True, "data": listing}
