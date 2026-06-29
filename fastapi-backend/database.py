"""
Turso / libSQL database connection for KIMU FastAPI backend.
Connects to the remote Turso DB that the Next.js app uses —
ensuring zero data loss during migration.
"""

import os
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import event

# Read from .env (same file as the Next.js app)
TURSO_DATABASE_URL = os.environ.get("TURSO_DATABASE_URL", "")
TURSO_AUTH_TOKEN = os.environ.get("TURSO_AUTH_TOKEN", "")
DATABASE_URL = os.environ.get("DATABASE_URL", "file:./prisma/dev.db")

def build_engine():
    """
    Build SQLAlchemy engine.
    - If Turso credentials are present: connect to remote libSQL via HTTP.
    - Otherwise: fall back to local SQLite (prisma/dev.db).
    """
    if TURSO_DATABASE_URL and TURSO_AUTH_TOKEN:
        # libsqlalchemy driver for Turso
        # Connection string: libsql+https://<host>?authToken=<token>
        host = TURSO_DATABASE_URL.replace("libsql://", "")
        db_url = f"sqlite+libsql://{host}?authToken={TURSO_AUTH_TOKEN}&secure=true"
        return create_engine(db_url, connect_args={}, echo=False)
    else:
        # Local SQLite fallback
        local_path = DATABASE_URL.replace("file:", "").replace("./", "")
        if not local_path.startswith("/"):
            local_path = os.path.join(os.path.dirname(__file__), "..", local_path)
        db_url = f"sqlite:///{os.path.abspath(local_path)}"
        engine = create_engine(db_url, connect_args={"check_same_thread": False}, echo=False)
        return engine


engine = build_engine()


def get_session():
    """FastAPI dependency: yields a database session."""
    with Session(engine) as session:
        yield session


def init_db():
    """Create tables if they don't exist (no-op on Turso — Prisma manages schema)."""
    pass  # Tables are managed by Prisma migrations; we only read/write
