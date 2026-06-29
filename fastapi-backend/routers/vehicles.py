from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from datetime import datetime
import shutil, os, uuid

from ..models import Vehicle
from ..schemas import VehicleCreate, VehicleUpdate
from ..auth_utils import get_current_user, require_roles
from ..database import get_session

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "vehicles")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("")
def list_vehicles(available: bool = None, session: Session = Depends(get_session)):
    stmt = select(Vehicle)
    if available is not None:
        stmt = stmt.where(Vehicle.isAvailable == available)
    vehicles = session.exec(stmt.order_by(Vehicle.name)).all()
    return {"success": True, "data": vehicles}


@router.post("")
def create_vehicle(body: VehicleCreate, session: Session = Depends(get_session),
                   _: dict = Depends(require_roles("admin", "manager", "transport-officer"))):
    vehicle = Vehicle(**body.model_dump())
    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    return {"success": True, "data": vehicle}


@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: int, session: Session = Depends(get_session)):
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"success": True, "data": vehicle}


@router.put("/{vehicle_id}")
def update_vehicle(vehicle_id: int, body: VehicleUpdate, session: Session = Depends(get_session),
                   _: dict = Depends(require_roles("admin", "manager", "transport-officer"))):
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(vehicle, field, value)
    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    return {"success": True, "data": vehicle}


@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int, session: Session = Depends(get_session),
                   _: dict = Depends(require_roles("admin", "manager"))):
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    session.delete(vehicle)
    session.commit()
    return {"success": True, "message": "Vehicle deleted"}


@router.post("/{vehicle_id}/upload-image")
async def upload_vehicle_image(vehicle_id: int, file: UploadFile = File(...),
                                session: Session = Depends(get_session),
                                _: dict = Depends(require_roles("admin", "manager", "transport-officer"))):
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    ext = os.path.splitext(file.filename)[1]
    filename = f"vehicle_{vehicle_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    vehicle.image = f"/vehicles/{filename}"
    session.add(vehicle)
    session.commit()
    return {"success": True, "image": vehicle.image}
