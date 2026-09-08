import sys
import os
from sqlalchemy import text

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
import models  # Imports all models to register them on Base.metadata

def init_db():
    print("Connecting to the database to create tables and apply migrations...")
    try:
        # Create all tables defined in models if they don't exist
        Base.metadata.create_all(bind=engine)

        # Apply non-destructive column additions to existing tables if needed
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE college ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT 'Main Campus';"))
            conn.execute(text("ALTER TABLE college ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Bengaluru';"))
            conn.execute(text("ALTER TABLE college ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Karnataka';"))
            conn.execute(text("ALTER TABLE college ADD COLUMN IF NOT EXISTS description VARCHAR(1000) DEFAULT 'Premier institution offering modern campus and residential living facilities.';"))
            conn.execute(text("ALTER TABLE college ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);"))

        print("Success! All tables and columns created or already exist.")
    except Exception as e:
        print(f"Error occurred during database initialization: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
