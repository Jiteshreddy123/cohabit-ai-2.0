import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
import models  # Imports all models to register them on Base.metadata

def init_db():
    print("Connecting to the database to create tables...")
    try:
        # Create all tables defined in models if they don't exist
        Base.metadata.create_all(bind=engine)
        print("Success! All tables created or already exist.")
    except Exception as e:
        print(f"Error occurred during database initialization: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
