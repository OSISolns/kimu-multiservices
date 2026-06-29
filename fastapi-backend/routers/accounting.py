from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from datetime import datetime
import json

from ..models import Income, Expense, Invoice, Budget, PettyCashTransaction
from ..schemas import IncomeCreate, ExpenseCreate, InvoiceCreate, BudgetCreate, PettyCashCreate
from ..auth_utils import get_current_user, require_roles
from ..database import get_session

router = APIRouter(prefix="/api/accounting", tags=["accounting"])


# ─── Income ──────────────────────────────────────────────────────────────────

@router.get("/income")
def list_income(session: Session = Depends(get_session),
                _: dict = Depends(require_roles("admin", "accountant", "manager"))):
    items = session.exec(select(Income).order_by(Income.date.desc())).all()
    return {"success": True, "data": items}


@router.post("/income")
def create_income(body: IncomeCreate, session: Session = Depends(get_session),
                  _: dict = Depends(require_roles("admin", "accountant"))):
    item = Income(**body.model_dump(), createdAt=datetime.utcnow(), updatedAt=datetime.utcnow())
    session.add(item)
    session.commit()
    session.refresh(item)
    return {"success": True, "data": item}


@router.put("/income/{income_id}")
def update_income(income_id: int, body: IncomeCreate, session: Session = Depends(get_session),
                  _: dict = Depends(require_roles("admin", "accountant"))):
    item = session.get(Income, income_id)
    if not item:
        raise HTTPException(status_code=404, detail="Income record not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    item.updatedAt = datetime.utcnow()
    session.add(item)
    session.commit()
    return {"success": True, "data": item}


@router.delete("/income/{income_id}")
def delete_income(income_id: int, session: Session = Depends(get_session),
                  _: dict = Depends(require_roles("admin", "accountant"))):
    item = session.get(Income, income_id)
    if not item:
        raise HTTPException(status_code=404, detail="Income record not found")
    session.delete(item)
    session.commit()
    return {"success": True}


# ─── Expenses ────────────────────────────────────────────────────────────────

@router.get("/expenses")
def list_expenses(session: Session = Depends(get_session),
                  _: dict = Depends(require_roles("admin", "accountant", "manager"))):
    items = session.exec(select(Expense).order_by(Expense.date.desc())).all()
    return {"success": True, "data": items}


@router.post("/expenses")
def create_expense(body: ExpenseCreate, session: Session = Depends(get_session),
                   _: dict = Depends(require_roles("admin", "accountant"))):
    item = Expense(**body.model_dump(), createdAt=datetime.utcnow(), updatedAt=datetime.utcnow())
    session.add(item)
    session.commit()
    session.refresh(item)
    return {"success": True, "data": item}


@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, session: Session = Depends(get_session),
                   _: dict = Depends(require_roles("admin", "accountant"))):
    item = session.get(Expense, expense_id)
    if not item:
        raise HTTPException(status_code=404, detail="Expense not found")
    session.delete(item)
    session.commit()
    return {"success": True}


# ─── Invoices ────────────────────────────────────────────────────────────────

@router.get("/invoices")
def list_invoices(session: Session = Depends(get_session),
                  _: dict = Depends(require_roles("admin", "accountant", "manager"))):
    return {"success": True, "data": session.exec(select(Invoice).order_by(Invoice.createdAt.desc())).all()}


@router.post("/invoices")
def create_invoice(body: InvoiceCreate, session: Session = Depends(get_session),
                   _: dict = Depends(require_roles("admin", "accountant"))):
    tax_amount = body.amount * (body.taxRate / 100)
    total = body.amount + tax_amount
    count = session.exec(select(func.count(Invoice.id))).one() or 0
    invoice_number = f"INV-{datetime.utcnow().year}-{str(count + 1).zfill(4)}"
    invoice = Invoice(
        invoiceNumber=invoice_number,
        clientName=body.clientName, clientEmail=body.clientEmail,
        clientPhone=body.clientPhone, amount=body.amount,
        taxRate=body.taxRate, taxAmount=tax_amount,
        totalAmount=total, grandTotal=total,
        dueDate=body.dueDate, description=body.description,
        items=json.dumps(body.items), status=body.status,
        createdAt=datetime.utcnow(), updatedAt=datetime.utcnow()
    )
    session.add(invoice)
    session.commit()
    session.refresh(invoice)
    return {"success": True, "data": invoice}


# ─── Budgets ─────────────────────────────────────────────────────────────────

@router.get("/budgets")
def list_budgets(session: Session = Depends(get_session),
                 _: dict = Depends(require_roles("admin", "accountant", "manager"))):
    return {"success": True, "data": session.exec(select(Budget)).all()}


@router.post("/budgets")
def create_budget(body: BudgetCreate, session: Session = Depends(get_session),
                  _: dict = Depends(require_roles("admin", "accountant"))):
    budget = Budget(**body.model_dump(), createdAt=datetime.utcnow(), updatedAt=datetime.utcnow())
    session.add(budget)
    session.commit()
    session.refresh(budget)
    return {"success": True, "data": budget}


# ─── Petty Cash ───────────────────────────────────────────────────────────────

@router.get("/petty-cash")
def list_petty_cash(session: Session = Depends(get_session),
                    _: dict = Depends(require_roles("admin", "accountant"))):
    items = session.exec(select(PettyCashTransaction).order_by(PettyCashTransaction.date.desc())).all()
    return {"success": True, "data": items}


@router.post("/petty-cash")
def create_petty_cash(body: PettyCashCreate, session: Session = Depends(get_session),
                      current_user: dict = Depends(require_roles("admin", "accountant"))):
    item = PettyCashTransaction(
        **body.model_dump(), requestedBy=current_user.get("username"),
        date=datetime.utcnow(), createdAt=datetime.utcnow(), updatedAt=datetime.utcnow()
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return {"success": True, "data": item}


# ─── Financial Summary ────────────────────────────────────────────────────────

@router.get("/summary")
def financial_summary(session: Session = Depends(get_session),
                      _: dict = Depends(require_roles("admin", "accountant", "manager"))):
    total_income = session.exec(select(func.sum(Income.amount))).one() or 0
    total_expense = session.exec(select(func.sum(Expense.amount))).one() or 0
    return {
        "success": True,
        "totalIncome": total_income,
        "totalExpenses": total_expense,
        "netProfit": total_income - total_expense,
    }
