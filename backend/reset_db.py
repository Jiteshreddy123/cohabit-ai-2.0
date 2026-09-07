import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
import models

from sqlalchemy import text

def reset_db():
    print("Dropping schema public cascade...")
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.commit()
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset successful!")

if __name__ == "__main__":
    reset_db()
