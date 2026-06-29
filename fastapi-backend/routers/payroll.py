from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
import json

from ..models import Employee, SalaryStructure, Payroll, PayrollItem
from ..schemas import EmployeeCreate, EmployeeUpdate, PayrollCreate
from ..auth_utils import get_current_user, require_roles
from ..database import get_session

router = APIRouter(prefix="/api/payroll", tags=["payroll"])


# ─── Employees ───────────────────────────────────────────────────────────────

@router.get("/employees")
def list_employees(session: Session = Depends(get_session),
                   _: dict = Depends(require_roles("admin", "accountant"))):
    return {"success": True, "data": session.exec(select(Employee).order_by(Employee.createdAt.desc())).all()}


@router.post("/employees")
def create_employee(body: EmployeeCreate, session: Session = Depends(get_session),
                    _: dict = Depends(require_roles("admin", "accountant"))):
    existing = session.exec(select(Employee).where(Employee.employeeId == body.employeeId)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    emp = Employee(**body.model_dump(), createdAt=datetime.utcnow(), updatedAt=datetime.utcnow())
    session.add(emp)
    session.commit()
    session.refresh(emp)
    return {"success": True, "data": emp}


@router.put("/employees/{emp_id}")
def update_employee(emp_id: int, body: EmployeeUpdate, session: Session = Depends(get_session),
                    _: dict = Depends(require_roles("admin", "accountant"))):
    emp = session.get(Employee, emp_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(emp, field, value)
    emp.updatedAt = datetime.utcnow()
    session.add(emp)
    session.commit()
    return {"success": True, "data": emp}


@router.delete("/employees/{emp_id}")
def delete_employee(emp_id: int, session: Session = Depends(get_session),
                    _: dict = Depends(require_roles("admin"))):
    emp = session.get(Employee, emp_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    session.delete(emp)
    session.commit()
    return {"success": True}


# ─── Payroll Records ─────────────────────────────────────────────────────────

@router.get("/records")
def list_payrolls(year: int = None, month: int = None, session: Session = Depends(get_session),
                  _: dict = Depends(require_roles("admin", "accountant"))):
    stmt = select(Payroll)
    if year:
        stmt = stmt.where(Payroll.year == year)
    if month:
        stmt = stmt.where(Payroll.month == month)
    return {"success": True, "data": session.exec(stmt.order_by(Payroll.createdAt.desc())).all()}


@router.post("/records")
def create_payroll(body: PayrollCreate, session: Session = Depends(get_session),
                   current_user: dict = Depends(require_roles("admin", "accountant"))):
    existing = session.exec(
        select(Payroll).where(Payroll.employeeId == body.employeeId, Payroll.period == body.period)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Payroll for this period already exists")
    payroll = Payroll(
        **body.model_dump(),
        processedBy=int(current_user.get("userId", 0)),
        processedAt=datetime.utcnow(),
        createdAt=datetime.utcnow(),
        updatedAt=datetime.utcnow()
    )
    session.add(payroll)
    session.commit()
    session.refresh(payroll)
    return {"success": True, "data": payroll}


@router.put("/records/{payroll_id}/status")
def update_payroll_status(payroll_id: int, status: str, session: Session = Depends(get_session),
                           _: dict = Depends(require_roles("admin", "accountant"))):
    payroll = session.get(Payroll, payroll_id)
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")
    payroll.status = status
    if status == "paid":
        payroll.paymentDate = datetime.utcnow()
    payroll.updatedAt = datetime.utcnow()
    session.add(payroll)
    session.commit()
    return {"success": True, "data": payroll}


# ─── Salary Structures ────────────────────────────────────────────────────────

@router.get("/salary-structures/{emp_id}")
def get_salary_structure(emp_id: int, session: Session = Depends(get_session),
                         _: dict = Depends(require_roles("admin", "accountant"))):
    structures = session.exec(
        select(SalaryStructure).where(SalaryStructure.employeeId == emp_id, SalaryStructure.isActive == True)
    ).all()
    return {"success": True, "data": structures}
