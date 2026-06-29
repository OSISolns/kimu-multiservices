from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlmodel import Session, select
from passlib.hash import bcrypt
from datetime import datetime

from ..models import User, ActivityLog
from ..schemas import LoginRequest, PasswordResetRequest, ChangePasswordRequest, UserCreate
from ..auth_utils import create_access_token, get_current_user, require_roles
from ..database import get_session

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login(body: LoginRequest, response: Response, request: Request, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == body.username)).first()
    if not user or not bcrypt.verify(body.password, user.passwordHash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    user.lastLogin = datetime.utcnow()
    session.add(user)
    log = ActivityLog(userId=user.id, action="LOGIN",
                      details=f"{user.username} logged in",
                      ipAddress=request.client.host if request.client else None,
                      userAgent=request.headers.get("user-agent"))
    session.add(log)
    session.commit()

    token = create_access_token({"userId": str(user.id), "username": user.username, "role": user.role})
    response.set_cookie("token", token, httponly=True, max_age=28800, samesite="lax", secure=False)

    return {
        "success": True,
        "staff": {
            "id": user.id, "username": user.username, "role": user.role,
            "fullName": user.fullName, "email": user.email, "phone": user.phone,
            "department": user.department, "status": user.status,
            "profilePicture": user.profilePicture, "lastLogin": user.lastLogin,
            "emailNotifications": user.emailNotifications,
            "whatsappNotifications": user.whatsappNotifications,
        }
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("token")
    return {"success": True, "message": "Logged out"}


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.id == int(current_user["userId"]))).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "user": user}


@router.post("/reset-password")
def reset_password(body: PasswordResetRequest, session: Session = Depends(get_session),
                   _: dict = Depends(require_roles("admin", "accountant"))):
    user = session.exec(select(User).where(User.username == body.username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.passwordHash = bcrypt.hash(body.newPassword)
    session.add(user)
    session.commit()
    return {"success": True, "message": "Password reset successfully"}


@router.post("/change-password")
def change_password(body: ChangePasswordRequest, session: Session = Depends(get_session),
                    current_user: dict = Depends(get_current_user)):
    user = session.exec(select(User).where(User.id == int(current_user["userId"]))).first()
    if not user or not bcrypt.verify(body.currentPassword, user.passwordHash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.passwordHash = bcrypt.hash(body.newPassword)
    session.add(user)
    session.commit()
    return {"success": True, "message": "Password changed successfully"}
