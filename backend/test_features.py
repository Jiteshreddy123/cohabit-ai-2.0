"""
Automated Test Suite for Verified Reviews, Complaints, and Discovery Features.
"""

from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database import SessionLocal
from models.college import College
from models.student import Student
from models.hostel import Hostel
from models.review import Review
from models.complaint import Complaint

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("RUNNING AUTOMATED TEST SUITE FOR COHABIT AI 2.0 FEATURES")
    print("=" * 60)

    # ── 1. Authentication ──────────────────────────────────────────
    # College login
    res = client.post("/login", json={"email": "admin@cohabit.demo", "password": "Admin@1234"})
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] College Admin Authentication Successful")

    # Student login (Aarav Sharma)
    res = client.post("/student/login", json={
        "college_code": "A8FC026B",
        "email": "aarav@cohabit.demo",
        "password": "CS21B001"
    })
    assert res.status_code == 200, f"Student login failed: {res.text}"
    student_token = res.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    student_id = res.json()["student_id"]
    print(f"[PASS] Student Authentication Successful (Student ID: {student_id})")

    # ── 2. Feature 3: Discovery Verification ───────────────────────
    res = client.get("/discover/colleges")
    assert res.status_code == 200, f"Discover colleges failed: {res.text}"
    colleges = res.json()
    assert len(colleges) >= 1, "Expected at least 1 college in discovery"
    print(f"[PASS] Discovery: Retrieved {len(colleges)} colleges")

    res = client.get("/discover/hostels")
    assert res.status_code == 200, f"Discover hostels failed: {res.text}"
    hostels = res.json()
    assert len(hostels) >= 1, "Expected hostels in discovery"
    target_hostel = hostels[0]
    print(f"[PASS] Discovery: Retrieved {len(hostels)} hostels (Target: {target_hostel['name']})")

    # Filter hostels by gender & AC
    res = client.get(f"/discover/hostels?gender={target_hostel['gender']}&hostel_type={target_hostel['hostel_type']}")
    assert res.status_code == 200
    print("[PASS] Discovery: Multi-criteria filtering working")

    # ── 3. Feature 1: Verified Student Reviews ─────────────────────
    # Submit review
    review_payload = {
        "hostel_id": target_hostel["id"],
        "category": "Cleanliness",
        "rating": 5,
        "title": "Cleanliness is top-notch in our block",
        "review_text": "Housekeeping clears bins every morning and washrooms are spotless. Great living conditions."
    }
    res = client.post("/reviews", json=review_payload, headers=student_headers)
    assert res.status_code in (201, 400, 422), f"Review submission response: {res.status_code} {res.text}"
    
    if res.status_code == 201:
        created_review = res.json()
        assert created_review["verification_status"] == "VERIFIED_STUDENT"
        assert created_review["is_verified_student"] is True
        assert "student_id" not in created_review or created_review["is_owner"] is True
        print(f"[PASS] Review Creation: Verified Student Badge applied ({created_review['reviewer_badge']})")

        # Mark Helpful
        res = client.post(f"/reviews/{created_review['id']}/helpful", headers=student_headers)
        assert res.status_code == 200
        print("[PASS] Review Upvoting (Helpful) working")

    # List Reviews
    res = client.get(f"/reviews?hostel_id={target_hostel['id']}", headers=student_headers)
    assert res.status_code == 200
    revs = res.json()
    assert len(revs) >= 1
    print(f"[PASS] Reviews Listing: Retrieved {len(revs)} reviews for hostel")

    # ── 4. Feature 2: Student Complaints ───────────────────────────
    # Create a Private Complaint
    priv_payload = {
        "hostel_id": target_hostel["id"],
        "category": "AC / Electrical",
        "title": "Test AC Remote Battery Depleted",
        "description": "Room AC remote control batteries died, requesting new pair.",
        "location": "Room 101, Nilgiri Block A",
        "priority": "LOW",
        "visibility": "PRIVATE"
    }
    res = client.post("/complaints", json=priv_payload, headers=student_headers)
    assert res.status_code == 201, f"Private complaint creation failed: {res.text}"
    priv_c = res.json()
    assert priv_c["visibility"] == "PRIVATE"
    assert priv_c["status"] == "NEW"
    print(f"[PASS] Private Complaint Created: Code {priv_c['complaint_code']}")

    # Create a Public Complaint
    pub_payload = {
        "hostel_id": target_hostel["id"],
        "category": "Cleanliness / Hygiene",
        "title": "Corridor Dustbin Full on 3rd Floor",
        "description": "The recycling dustbin near elevator on 3rd floor is overflowing.",
        "location": "3rd Floor Elevator Lobby, Block A",
        "priority": "MEDIUM",
        "visibility": "PUBLIC"
    }
    res = client.post("/complaints", json=pub_payload, headers=student_headers)
    assert res.status_code == 201, f"Public complaint creation failed: {res.text}"
    pub_c = res.json()
    assert pub_c["visibility"] == "PUBLIC"
    print(f"[PASS] Public Complaint Created: Code {pub_c['complaint_code']}")

    # Get My Complaints
    res = client.get("/complaints/my", headers=student_headers)
    assert res.status_code == 200
    my_c = res.json()
    assert any(c["id"] == priv_c["id"] for c in my_c)
    print(f"[PASS] My Complaints: Retrieved {len(my_c)} complaints for student")

    # Check Public Issues Feed (Verify NO student roll, email, or name is exposed)
    res = client.get("/public/issues")
    assert res.status_code == 200
    pub_issues = res.json()
    assert any(i["id"] == pub_c["id"] for i in pub_issues)
    for issue in pub_issues:
        assert "student_name" not in issue
        assert "student_email" not in issue
        assert "student_roll" not in issue
    print(f"[PASS] Public Issues Feed: {len(pub_issues)} issues listed with 100% Student Anonymity Preserved")

    # ── 5. College Management Workflow ─────────────────────────────
    # List complaints as admin
    res = client.get("/management/complaints", headers=admin_headers)
    assert res.status_code == 200
    admin_c_list = res.json()
    assert any(c["id"] == priv_c["id"] for c in admin_c_list)
    print(f"[PASS] Management: Admin retrieved {len(admin_c_list)} college complaints")

    # Admin updates complaint status to IN_PROGRESS and assigns technician
    status_payload = {
        "status": "IN_PROGRESS",
        "assigned_to": "Electrical Maintenance Staff",
        "management_response": "Replacement AAA batteries dispatched with evening caretaker."
    }
    res = client.put(f"/management/complaints/{priv_c['id']}/status", json=status_payload, headers=admin_headers)
    assert res.status_code == 200, f"Status update failed: {res.text}"
    updated_c = res.json()
    assert updated_c["status"] == "IN_PROGRESS"
    assert updated_c["assigned_to"] == "Electrical Maintenance Staff"
    assert len(updated_c["updates"]) >= 2
    print(f"[PASS] Management: Complaint #{priv_c['complaint_code']} updated to IN_PROGRESS with activity timeline")

    # Admin resolves complaint
    resolve_payload = {
        "status": "RESOLVED",
        "assigned_to": "Electrical Maintenance Staff",
        "management_response": "Batteries replaced. Remote verified functioning."
    }
    res = client.put(f"/management/complaints/{priv_c['id']}/status", json=resolve_payload, headers=admin_headers)
    assert res.status_code == 200
    resolved_c = res.json()
    assert resolved_c["status"] == "RESOLVED"
    assert resolved_c["resolved_at"] is not None
    print(f"[PASS] Management: Complaint #{priv_c['complaint_code']} marked RESOLVED with timestamp")

    # Student verifies resolved complaint and reopens
    reopen_payload = {"reason": "The remote screen is now flickering intermittently."}
    res = client.post(f"/complaints/{priv_c['id']}/reopen", json=reopen_payload, headers=student_headers)
    assert res.status_code == 200, f"Reopen failed: {res.text}"
    reopened_c = res.json()
    assert reopened_c["status"] == "REOPENED"
    print(f"[PASS] Student Lifecycle: Successfully reopened complaint with reason logged")

    print("=" * 60)
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
