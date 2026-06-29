from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

from ..models import Lead, Quote, Campaign, Activity
from ..schemas import (LeadCreate, LeadUpdate, QuoteCreate, QuoteUpdate,
                        CampaignCreate, ActivityCreate)
from ..auth_utils import get_current_user, require_roles
from ..database import get_session

router = APIRouter(tags=["crm"])

# ─── Leads ───────────────────────────────────────────────────────────────────

@router.get("/api/leads")
def list_leads(stage: str = None, session: Session = Depends(get_session),
               _: dict = Depends(get_current_user)):
    stmt = select(Lead)
    if stage:
        stmt = stmt.where(Lead.stage == stage)
    return {"success": True, "leads": session.exec(stmt.order_by(Lead.createdAt.desc())).all()}


@router.post("/api/leads")
def create_lead(body: LeadCreate, session: Session = Depends(get_session),
                _: dict = Depends(get_current_user)):
    lead = Lead(**body.model_dump(), createdAt=datetime.utcnow(), updatedAt=datetime.utcnow())
    session.add(lead)
    session.commit()
    session.refresh(lead)
    return {"success": True, "lead": lead}


@router.put("/api/leads/{lead_id}")
def update_lead(lead_id: int, body: LeadUpdate, session: Session = Depends(get_session),
                _: dict = Depends(get_current_user)):
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(lead, field, value)
    lead.updatedAt = datetime.utcnow()
    session.add(lead)
    session.commit()
    session.refresh(lead)
    return {"success": True, "lead": lead}


@router.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: int, session: Session = Depends(get_session),
                _: dict = Depends(get_current_user)):
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    session.delete(lead)
    session.commit()
    return {"success": True}


# ─── Quotes ──────────────────────────────────────────────────────────────────

@router.get("/api/quotes")
def list_quotes(session: Session = Depends(get_session), _: dict = Depends(get_current_user)):
    quotes = session.exec(select(Quote).order_by(Quote.createdAt.desc())).all()
    return {"success": True, "data": {"quotes": quotes}}


@router.post("/api/quotes")
def create_quote(body: QuoteCreate, session: Session = Depends(get_session),
                 current_user: dict = Depends(get_current_user)):
    quote = Quote(**body.model_dump(), createdBy=int(current_user.get("userId", 0)),
                  createdAt=datetime.utcnow(), updatedAt=datetime.utcnow())
    session.add(quote)
    session.commit()
    session.refresh(quote)
    return {"success": True, "quote": quote}


@router.put("/api/quotes/{quote_id}")
def update_quote(quote_id: int, body: QuoteUpdate, session: Session = Depends(get_session),
                 _: dict = Depends(get_current_user)):
    quote = session.get(Quote, quote_id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(quote, field, value)
    quote.updatedAt = datetime.utcnow()
    session.add(quote)
    session.commit()
    return {"success": True, "quote": quote}


# ─── Campaigns ────────────────────────────────────────────────────────────────

@router.get("/api/campaigns")
def list_campaigns(session: Session = Depends(get_session), _: dict = Depends(get_current_user)):
    campaigns = session.exec(select(Campaign).order_by(Campaign.createdAt.desc())).all()
    return {"success": True, "campaigns": campaigns}


@router.post("/api/campaigns")
def create_campaign(body: CampaignCreate, session: Session = Depends(get_session),
                    _: dict = Depends(get_current_user)):
    data = body.model_dump()
    if not data.get("startDate"):
        data["startDate"] = datetime.utcnow()
    if not data.get("endDate"):
        data["endDate"] = datetime.utcnow()
    campaign = Campaign(**data, createdAt=datetime.utcnow(), updatedAt=datetime.utcnow())
    session.add(campaign)
    session.commit()
    session.refresh(campaign)
    return {"success": True, "campaign": campaign}


# ─── Activities ───────────────────────────────────────────────────────────────

@router.get("/api/activities")
def list_activities(session: Session = Depends(get_session), _: dict = Depends(get_current_user)):
    activities = session.exec(select(Activity).order_by(Activity.date.desc())).all()
    return {"success": True, "activities": activities}


@router.post("/api/activities")
def create_activity(body: ActivityCreate, session: Session = Depends(get_session),
                    _: dict = Depends(get_current_user)):
    data = body.model_dump()
    if not data.get("date"):
        data["date"] = datetime.utcnow()
    activity = Activity(**data, createdAt=datetime.utcnow())
    session.add(activity)
    session.commit()
    session.refresh(activity)
    return {"success": True, "activity": activity}
