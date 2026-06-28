from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Since DATABASE_URL might have postgresql+psycopg as the scheme (which is valid),
# we configure the engine. We'll use sync engine here for simplicity and safety.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
