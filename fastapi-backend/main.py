"""
KIMU Transport & Multiservices — FastAPI Main Application
Replaces the Next.js API layer completely.
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

# Load .env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from .routers import auth, users, vehicles, bookings, payments, crm, accounting, payroll, logs, finance

app = FastAPI(
    title="KIMU Transport & Multiservices — MIS API",
    description="Complete backend for KIMU MIS and public portal",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Legacy Next.js (during transition)
        "https://kimu.rw",
        "https://www.kimu.rw",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static Files (images, videos, logo) ─────────────────────────────────────

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "public")
if os.path.exists(PUBLIC_DIR):
    app.mount("/vehicles", StaticFiles(directory=os.path.join(PUBLIC_DIR, "vehicles")), name="vehicles")
    app.mount("/profiles", StaticFiles(directory=os.path.join(PUBLIC_DIR, "profiles")), name="profiles")
    app.mount("/static", StaticFiles(directory=PUBLIC_DIR), name="static")

# ─── Routers ─────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(vehicles.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(crm.router)
app.include_router(accounting.router)
app.include_router(payroll.router)
app.include_router(logs.router)
app.include_router(finance.router)

# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "KIMU MIS API", "version": "2.0.0"}


# ─── Root ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "KIMU Transport & Multiservices API — see /api/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("kimu_api.main:app", host="0.0.0.0", port=8000, reload=True)
