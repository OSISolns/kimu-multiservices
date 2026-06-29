from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlmodel import Session, select
from passlib.hash import bcrypt
from datetime import datetime
import shutil, os

from ..models import User
from ..schemas import UserCreate, UserUpdate
from ..auth_utils import get_current_user, require_roles
from ..database import get_session

router = APIRouter(prefix="/api/users", tags=["users"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "profiles")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("")
def list_users(role: str = None, status: str = None, session: Session = Depends(get_session),
               _: dict = Depends(require_roles("admin", "manager", "accountant"))):
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role)
    if status:
        stmt = stmt.where(User.status == status)
    users = session.exec(stmt).all()
    return {"success": True, "users": [u.model_dump(exclude={"passwordHash"}) for u in users]}


@router.post("")
def create_user(body: UserCreate, session: Session = Depends(get_session),
                _: dict = Depends(require_roles("admin", "accountant"))):
    existing = session.exec(select(User).where(User.username == body.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(
        username=body.username,
        fullName=body.fullName,
        email=body.email,
        phone=body.phone,
        passwordHash=bcrypt.hash(body.password),
        role=body.role,
        department=body.department,
        status=body.status,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"success": True, "user": user.model_dump(exclude={"passwordHash"})}


@router.get("/{username}")
def get_user(username: str, session: Session = Depends(get_session),
             _: dict = Depends(get_current_user)):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user": user.model_dump(exclude={"passwordHash"})}


@router.put("/{username}")
def update_user(username: str, body: UserUpdate, session: Session = Depends(get_session),
                current_user: dict = Depends(get_current_user)):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Only admins can update other users' roles/status
    if current_user.get("role") not in ("admin",) and current_user.get("username") != username:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"success": True, "user": user.model_dump(exclude={"passwordHash"})}


@router.delete("/{username}")
def delete_user(username: str, session: Session = Depends(get_session),
                current_user: dict = Depends(require_roles("admin"))):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role in ("admin", "accountant"):
        raise HTTPException(status_code=400, detail="Cannot delete admin or accountant users")
    session.delete(user)
    session.commit()
    return {"success": True, "message": f"User {username} deleted"}


@router.post("/{username}/profile-picture")
async def upload_profile_picture(username: str, file: UploadFile = File(...),
                                  session: Session = Depends(get_session),
                                  _: dict = Depends(get_current_user)):
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    ext = os.path.splitext(file.filename)[1]
    filename = f"{username}_profile{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    user.profilePicture = f"/profiles/{filename}"
    session.add(user)
    session.commit()
    return {"success": True, "profilePicture": user.profilePicture}
