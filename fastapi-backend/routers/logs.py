from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

from ..models import Notification, ActivityLog, SystemLog
from ..schemas import NotificationCreate
from ..auth_utils import get_current_user, require_roles
from ..database import get_session

router = APIRouter(tags=["logs"])


# ─── Notifications ────────────────────────────────────────────────────────────

@router.get("/api/notifications")
def list_notifications(session: Session = Depends(get_session),
                       current_user: dict = Depends(get_current_user)):
    user_id = int(current_user.get("userId", 0))
    notifs = session.exec(
        select(Notification).where(
            (Notification.userId == user_id) | (Notification.userId == None)
        ).order_by(Notification.createdAt.desc())
    ).all()
    return notifs


@router.post("/api/notifications")
def create_notification(body: NotificationCreate, session: Session = Depends(get_session),
                         _: dict = Depends(require_roles("admin", "manager"))):
    notif = Notification(**body.model_dump(), createdAt=datetime.utcnow())
    session.add(notif)
    session.commit()
    session.refresh(notif)
    return {"success": True, "data": notif}


@router.put("/api/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, session: Session = Depends(get_session),
                             _: dict = Depends(get_current_user)):
    notif = session.get(Notification, notif_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    session.add(notif)
    session.commit()
    return {"success": True}


@router.put("/api/notifications/mark-all-read")
def mark_all_notifications_read(session: Session = Depends(get_session),
                                 current_user: dict = Depends(get_current_user)):
    user_id = int(current_user.get("userId", 0))
    notifs = session.exec(
        select(Notification).where(Notification.userId == user_id, Notification.read == False)
    ).all()
    for n in notifs:
        n.read = True
        session.add(n)
    session.commit()
    return {"success": True, "updated": len(notifs)}


# ─── Activity Logs ────────────────────────────────────────────────────────────

@router.get("/api/activity-log")
def list_activity_logs(page: int = 1, limit: int = 50, action: str = None,
                        session: Session = Depends(get_session),
                        _: dict = Depends(require_roles("admin"))):
    stmt = select(ActivityLog)
    if action:
        stmt = stmt.where(ActivityLog.action == action)
    total = len(session.exec(stmt).all())
    logs = session.exec(stmt.order_by(ActivityLog.createdAt.desc()).offset((page - 1) * limit).limit(limit)).all()
    return {
        "activityLogs": logs,
        "pagination": {"page": page, "limit": limit, "total": total, "totalPages": -(-total // limit)}
    }


# ─── System Logs ──────────────────────────────────────────────────────────────

@router.get("/api/system-logs")
def list_system_logs(session: Session = Depends(get_session),
                     _: dict = Depends(require_roles("admin"))):
    logs = session.exec(select(SystemLog).order_by(SystemLog.createdAt.desc()).limit(200)).all()
    return logs


@router.post("/api/system-logs")
def create_system_log(action: str, details: str = None,
                       session: Session = Depends(get_session),
                       current_user: dict = Depends(require_roles("admin"))):
    log = SystemLog(action=action, details=details,
                    createdBy=int(current_user.get("userId", 0)),
                    createdAt=datetime.utcnow())
    session.add(log)
    session.commit()
    return {"success": True}
