"""
Seed Script for Hostels, Verified Student Reviews, and Complaints.

Populates realistic colleges, hostel blocks, genuine reviews with ratings and badges,
and private/public complaints across different statuses for demonstration.
"""

from datetime import datetime, timedelta, timezone
from database import SessionLocal
from models.college import College
from models.student import Student
from models.hostel import Hostel
from models.review import Review, ReviewImage
from models.complaint import Complaint, ComplaintUpdate
from services.auth_service import hash_password


def seed_discovery_and_complaint_data():
    db = SessionLocal()
    try:
        print("Seeding Colleges, Hostels, Reviews, and Complaints...")

        # ── 1. College Setup ──────────────────────────────────────────
        college = db.query(College).filter(College.email == "admin@cohabit.demo").first()
        if not college:
            college = College(
                name="ACE Engineering College",
                email="admin@cohabit.demo",
                password=hash_password("Admin@1234"),
                college_code="ACE2026",
                location="Ankushapur, Ghatkesar",
                city="Hyderabad",
                state="Telangana",
                description="Premier autonomous engineering institute affiliated with JNTUH and accredited NAAC A+, featuring advanced tech labs, high-speed optical fiber, and modern residential campuses.",
                image_url="https://dfhe5ze0n4pxu.cloudfront.net/College/Image/Image-1766845804828.jpeg"
            )
            db.add(college)
            db.commit()
            db.refresh(college)
        else:
            college.name = "ACE Engineering College"
            college.college_code = "ACE2026"
            college.location = "Ankushapur, Ghatkesar"
            college.city = "Hyderabad"
            college.state = "Telangana"
            college.description = "Premier autonomous engineering institute affiliated with JNTUH and accredited NAAC A+, featuring advanced tech labs, high-speed optical fiber, and modern residential campuses."
            college.image_url = "https://dfhe5ze0n4pxu.cloudfront.net/College/Image/Image-1766845804828.jpeg"
            db.commit()

        # College 2: Chaitanya Bharathi Institute of Technology (CBIT)
        col2 = db.query(College).filter((College.email == "admin@cbit.demo") | (College.email == "admin@apex.demo")).first()
        if not col2:
            col2 = College(
                name="Chaitanya Bharathi Institute of Technology (CBIT)",
                email="admin@cbit.demo",
                password=hash_password("Admin@1234"),
                college_code="CBIT2026",
                location="Gandipet, Kokapet",
                city="Hyderabad",
                state="Telangana",
                description="Premier autonomous engineering institute established in 1979 in Gandipet, Hyderabad, accredited NAAC A++ with world-class residential dorms, coding centers, and innovation hubs.",
                image_url="https://www.cbit.ac.in/wp-content/themes/CBIT/images/placeholder.jpg"
            )
            db.add(col2)
            db.commit()
            db.refresh(col2)
        else:
            col2.name = "Chaitanya Bharathi Institute of Technology (CBIT)"
            col2.email = "admin@cbit.demo"
            col2.college_code = "CBIT2026"
            col2.location = "Gandipet, Kokapet"
            col2.city = "Hyderabad"
            col2.state = "Telangana"
            col2.description = "Premier autonomous engineering institute established in 1979 in Gandipet, Hyderabad, accredited NAAC A++ with world-class residential dorms, coding centers, and innovation hubs."
            col2.image_url = "https://www.cbit.ac.in/wp-content/themes/CBIT/images/placeholder.jpg"
            db.commit()

        # College 3: Sreenidhi Institute of Science and Technology (SNIST)
        col3 = db.query(College).filter((College.email == "admin@snist.demo") | (College.email == "admin@nidt.demo")).first()
        if not col3:
            col3 = College(
                name="Sreenidhi Institute of Science and Technology (SNIST)",
                email="admin@snist.demo",
                password=hash_password("Admin@1234"),
                college_code="SNIST2026",
                location="Yamnampet, Ghatkesar",
                city="Hyderabad",
                state="Telangana",
                description="Leading autonomous engineering and research institution in Yamnampet, Ghatkesar, Hyderabad with modern studio suites, sports arenas, biometric access, and active student innovation spaces.",
                image_url="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf1XoE3J7LKUTR3Q_f6bMyS4dEoYK9GMVYm6XYg5rDEtnL_Etm1V61Egg&s=10"
            )
            db.add(col3)
            db.commit()
            db.refresh(col3)
        else:
            col3.name = "Sreenidhi Institute of Science and Technology (SNIST)"
            col3.email = "admin@snist.demo"
            col3.college_code = "SNIST2026"
            col3.location = "Yamnampet, Ghatkesar"
            col3.city = "Hyderabad"
            col3.state = "Telangana"
            col3.description = "Leading autonomous engineering and research institution in Yamnampet, Ghatkesar, Hyderabad with modern studio suites, sports arenas, biometric access, and active student innovation spaces."
            col3.image_url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf1XoE3J7LKUTR3Q_f6bMyS4dEoYK9GMVYm6XYg5rDEtnL_Etm1V61Egg&s=10"
            db.commit()

        # ── 2. Hostels Setup ──────────────────────────────────────────
        hostels_data = [
            {
                "college_id": college.id,
                "name": "ACE Boys Hostel (Block A - Godavari)",
                "gender": "Male",
                "hostel_type": "Both",
                "room_types": ["Single", "Double", "Triple"],
                "facilities": ["Wi-Fi", "Mess", "24/7 Power Backup", "Gym", "Study Room", "Water Purifier", "Security", "Laundry"],
                "fee_structure": "₹85,000 - ₹1,10,000 / year",
                "total_capacity": 240,
                "description": "Modern multi-storey hostel with dedicated high-speed optical fiber, ergonomic study desks, air-conditioned study rooms, and hygienic buffet mess.",
                "image_url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80"
            },
            {
                "college_id": college.id,
                "name": "ACE Girls Hostel (Block B - Krishna)",
                "gender": "Female",
                "hostel_type": "Both",
                "room_types": ["Single", "Double"],
                "facilities": ["Wi-Fi", "Mess", "24/7 Security", "Attached Washrooms", "Study Room", "Water Purifier", "Laundry", "Gym"],
                "fee_structure": "₹90,000 - ₹1,20,000 / year",
                "total_capacity": 180,
                "description": "Peaceful residential complex equipped with top-tier security surveillance, manicured garden courtyards, quiet study wings, and wholesome dietary catering.",
                "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"
            },
            {
                "college_id": college.id,
                "name": "ACE Executive Residency (Block C - Kaveri)",
                "gender": "Co-ed",
                "hostel_type": "AC",
                "room_types": ["Single", "Double"],
                "facilities": ["Central AC", "Wi-Fi", "Gourmet Mess", "Elevator Access", "Study Room", "24/7 Power Backup", "Gym", "Security"],
                "fee_structure": "₹1,30,000 - ₹1,65,000 / year",
                "total_capacity": 120,
                "description": "Premium executive residency tailored for students seeking quiet, air-conditioned suites with private amenities and daily housekeeping.",
                "image_url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80"
            },
            {
                "college_id": col2.id,
                "name": "CBIT Gandipet Boys Hostel (Block 1)",
                "gender": "Male",
                "hostel_type": "Both",
                "room_types": ["Single", "Double", "Triple"],
                "facilities": ["High-Speed Wi-Fi", "Mess", "Gym", "Sports Ground", "Study Lounge", "Security", "Solar Hot Water"],
                "fee_structure": "₹85,000 - ₹1,15,000 / year",
                "total_capacity": 250,
                "description": "Well-furnished boys hostel located inside the tranquil Gandipet campus with full sports grounds, reading rooms, and balanced South & North dining.",
                "image_url": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&auto=format&fit=crop&q=80"
            },
            {
                "college_id": col2.id,
                "name": "CBIT Emerald Girls Residency (Block 2)",
                "gender": "Female",
                "hostel_type": "AC",
                "room_types": ["Single", "Double"],
                "facilities": ["Central AC", "Wi-Fi", "24/7 Biometric Security", "Gym", "Organic Dining", "Laundry"],
                "fee_structure": "₹95,000 - ₹1,30,000 / year",
                "total_capacity": 200,
                "description": "Modern air-conditioned residence for women engineers featuring biometric turnstiles, laundry support, and manicured lawns.",
                "image_url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"
            },
            {
                "college_id": col3.id,
                "name": "SNIST Scholars Boys Wing (Block A)",
                "gender": "Male",
                "hostel_type": "Both",
                "room_types": ["Single", "Double", "Triple"],
                "facilities": ["Wi-Fi", "Mess", "Innovation Lab Access", "Recreation Room", "Gym", "Security"],
                "fee_structure": "₹80,000 - ₹1,05,000 / year",
                "total_capacity": 220,
                "description": "Dynamic hostel wing near Yamnampet academic blocks with round-the-clock power backup, student coding cells, and buffet mess.",
                "image_url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80"
            },
            {
                "college_id": col3.id,
                "name": "SNIST Priyadarshini Girls Hostel (Block B)",
                "gender": "Female",
                "hostel_type": "Both",
                "room_types": ["Single", "Double"],
                "facilities": ["Wi-Fi", "Hygienic Mess", "24/7 Security & Wardens", "Study Pods", "Indoor Games", "Solar Water"],
                "fee_structure": "₹85,000 - ₹1,10,000 / year",
                "total_capacity": 180,
                "description": "Safe, serene residential hall for girl students offering spacious well-ventilated rooms, nutritious food, and round-the-clock warden support.",
                "image_url": "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=800&auto=format&fit=crop&q=80"
            },
        ]

        hostel_map = {}
        for h_data in hostels_data:
            existing = db.query(Hostel).filter(
                Hostel.name == h_data["name"],
                Hostel.college_id == h_data["college_id"]
            ).first()
            if not existing:
                h = Hostel(**h_data)
                db.add(h)
                db.commit()
                db.refresh(h)
                hostel_map[h.name] = h
            else:
                existing.description = h_data["description"]
                existing.facilities = h_data["facilities"]
                existing.fee_structure = h_data["fee_structure"]
                existing.image_url = h_data["image_url"]
                db.commit()
                hostel_map[existing.name] = existing

        # ── 3. Students Fetch ──────────────────────────────────────────
        aarav = db.query(Student).filter(Student.email == "aarav@cohabit.demo").first()
        rohan = db.query(Student).filter(Student.email == "rohan@cohabit.demo").first()
        priya = db.query(Student).filter(Student.email == "priya@cohabit.demo").first()
        ananya = db.query(Student).filter(Student.email == "ananya@cohabit.demo").first()

        nilgiri = hostel_map.get("ACE Boys Hostel (Block A - Godavari)")
        shivalik = hostel_map.get("ACE Girls Hostel (Block B - Krishna)")
        ganga = hostel_map.get("ACE Executive Residency (Block C - Kaveri)")

        # ── 4. Seed Verified Reviews ───────────────────────────────────
        if aarav and nilgiri:
            if not db.query(Review).filter(Review.student_id == aarav.id, Review.title.like("%Wi-Fi%")).first():
                r1 = Review(
                    student_id=aarav.id,
                    college_id=college.id,
                    hostel_id=nilgiri.id,
                    category="Wi-Fi & Internet",
                    rating=5,
                    title="Superb Wi-Fi speeds for coding & coursework",
                    review_text="The gigabit optical fiber connection in Nilgiri Block A has been rock solid. Latency is under 10ms which is great for remote coding competitions and lectures. Study lounge on 3rd floor is quiet during exam weeks.",
                    verification_status="VERIFIED_STUDENT",
                    moderation_status="APPROVED",
                    helpful_count=14,
                )
                db.add(r1)
                db.commit()

        if priya and shivalik:
            if not db.query(Review).filter(Review.student_id == priya.id, Review.title.like("%Cleanliness%")).first():
                r2 = Review(
                    student_id=priya.id,
                    college_id=college.id,
                    hostel_id=shivalik.id,
                    category="Cleanliness",
                    rating=5,
                    title="Spotless corridors and sanitized washrooms daily",
                    review_text="Housekeeping staff cleans the common washrooms and corridors twice every day. Solar water heaters work reliably early in the morning. Very disciplined and quiet atmosphere.",
                    verification_status="VERIFIED_STUDENT",
                    moderation_status="APPROVED",
                    helpful_count=19,
                )
                db.add(r2)
                db.commit()

        if rohan and nilgiri:
            if not db.query(Review).filter(Review.student_id == rohan.id, Review.title.like("%Mess%")).first():
                r3 = Review(
                    student_id=rohan.id,
                    college_id=college.id,
                    hostel_id=nilgiri.id,
                    category="Mess / Food",
                    rating=4,
                    title="Mess food is hygienic with good variety",
                    review_text="Breakfast menu is varied with south and north Indian options. Dinner is balanced. On Sunday special dinners are served. Water purifiers on every floor have TDS indicators.",
                    verification_status="VERIFIED_STUDENT",
                    moderation_status="APPROVED",
                    helpful_count=8,
                )
                db.add(r3)
                db.commit()

        if ananya and shivalik:
            if not db.query(Review).filter(Review.student_id == ananya.id, Review.title.like("%Security%")).first():
                r4 = Review(
                    student_id=ananya.id,
                    college_id=college.id,
                    hostel_id=shivalik.id,
                    category="Security",
                    rating=4,
                    title="Strict biometric access and helpful wardens",
                    review_text="Entry is guarded with 24/7 security and biometric logging. The wardens are approachable and maintenance requests for plumbing/electrical get addressed within 24 hours.",
                    verification_status="VERIFIED_STUDENT",
                    moderation_status="APPROVED",
                    helpful_count=11,
                )
                db.add(r4)
                db.commit()

        # ── 5. Seed Complaints ─────────────────────────────────────────
        if aarav and nilgiri:
            if not db.query(Complaint).filter(Complaint.complaint_code == "CMP-2026-001").first():
                c1 = Complaint(
                    complaint_code="CMP-2026-001",
                    student_id=aarav.id,
                    college_id=college.id,
                    hostel_id=nilgiri.id,
                    category="Plumbing / Water",
                    title="Water leakage in 2nd Floor common washroom tap",
                    description="Tap #3 in the 2nd floor Nilgiri Block A washroom has a loose seal causing continuous dripping.",
                    location="Nilgiri Block A, 2nd Floor Washroom",
                    priority="MEDIUM",
                    visibility="PUBLIC",
                    status="RESOLVED",
                    assigned_to="Plumbing Maintenance Team 1",
                    management_response="Washer replaced and pipe pressure calibrated. Issue resolved.",
                    resolved_at=datetime.now(timezone.utc) - timedelta(days=1),
                )
                db.add(c1)
                db.commit()
                db.refresh(c1)

                u1 = ComplaintUpdate(
                    complaint_id=c1.id,
                    author_role="student",
                    author_name=aarav.name,
                    old_status=None,
                    new_status="NEW",
                    note="Complaint submitted and dispatched to facilities management.",
                )
                u2 = ComplaintUpdate(
                    complaint_id=c1.id,
                    author_role="admin",
                    author_name="Demo University",
                    old_status="IN_PROGRESS",
                    new_status="RESOLVED",
                    note="Plumber replaced the internal washer. Water flow tested normal.",
                )
                db.add_all([u1, u2])
                db.commit()

        if rohan and nilgiri:
            if not db.query(Complaint).filter(Complaint.complaint_code == "CMP-2026-002").first():
                c2 = Complaint(
                    complaint_code="CMP-2026-002",
                    student_id=rohan.id,
                    college_id=college.id,
                    hostel_id=nilgiri.id,
                    category="AC / Electrical",
                    title="Study Room AC Unit #2 compressor vibrating",
                    description="The split AC on the west wall of 3rd floor study lounge is vibrating loudly during operation.",
                    location="Nilgiri Block A, 3rd Floor Study Lounge",
                    priority="HIGH",
                    visibility="PUBLIC",
                    status="IN_PROGRESS",
                    assigned_to="HVAC Tech Solutions",
                    management_response="Technician diagnosed faulty bearing. Part arriving tomorrow for replacement.",
                )
                db.add(c2)
                db.commit()
                db.refresh(c2)

                u1 = ComplaintUpdate(
                    complaint_id=c2.id,
                    author_role="student",
                    author_name=rohan.name,
                    old_status=None,
                    new_status="NEW",
                    note="Reported AC noise in study area.",
                )
                u2 = ComplaintUpdate(
                    complaint_id=c2.id,
                    author_role="admin",
                    author_name="Demo University",
                    old_status="NEW",
                    new_status="IN_PROGRESS",
                    note="Assigned to HVAC Tech Solutions. Inspection completed, parts replacement scheduled.",
                )
                db.add_all([u1, u2])
                db.commit()

        if priya and shivalik:
            if not db.query(Complaint).filter(Complaint.complaint_code == "CMP-2026-003").first():
                c3 = Complaint(
                    complaint_code="CMP-2026-003",
                    student_id=priya.id,
                    college_id=college.id,
                    hostel_id=shivalik.id,
                    category="Furniture / Infrastructure",
                    title="Desk study chair wheel replacement",
                    description="One of the wheels on my assigned room study chair cracked. Requesting a replacement chair.",
                    location="Shivalik Block B, Room 204",
                    priority="LOW",
                    visibility="PRIVATE",
                    status="ASSIGNED",
                    assigned_to="Hostel Carpentry Staff",
                    management_response="Replacement ergonomic chair allocated. Will be delivered during evening hours.",
                )
                db.add(c3)
                db.commit()
                db.refresh(c3)

                u1 = ComplaintUpdate(
                    complaint_id=c3.id,
                    author_role="student",
                    author_name=priya.name,
                    old_status=None,
                    new_status="NEW",
                    note="Private room maintenance request filed.",
                )
                u2 = ComplaintUpdate(
                    complaint_id=c3.id,
                    author_role="admin",
                    author_name="Demo University",
                    old_status="NEW",
                    new_status="ASSIGNED",
                    note="Assigned to Hostel Carpentry Staff for evening replacement.",
                )
                db.add_all([u1, u2])
                db.commit()

        if ananya and shivalik:
            if not db.query(Complaint).filter(Complaint.complaint_code == "CMP-2026-004").first():
                c4 = Complaint(
                    complaint_code="CMP-2026-004",
                    student_id=ananya.id,
                    college_id=college.id,
                    hostel_id=shivalik.id,
                    category="Wi-Fi / Network",
                    title="Wi-Fi Access Point 4B intermittent drop",
                    description="AP on 4th floor wing B occasionally disconnects for 2-3 minutes around 10 PM.",
                    location="Shivalik Block B, 4th Floor Corridor",
                    priority="HIGH",
                    visibility="PUBLIC",
                    status="NEW",
                )
                db.add(c4)
                db.commit()
                db.refresh(c4)

                u1 = ComplaintUpdate(
                    complaint_id=c4.id,
                    author_role="student",
                    author_name=ananya.name,
                    old_status=None,
                    new_status="NEW",
                    note="Public issue logged for network latency and drops.",
                )
                db.add(u1)
                db.commit()

        print("Discovery hostels, verified student reviews, and complaints seeded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_discovery_and_complaint_data()
