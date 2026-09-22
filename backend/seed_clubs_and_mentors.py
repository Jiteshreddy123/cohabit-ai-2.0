"""
Seed script for Hos-Clubs (Hostel Clubs & Committees) and Academic Mentors.
"""

from datetime import datetime, timezone
from database import SessionLocal
from models.college import College
from models.student import Student
from models.club import HosClub, HosClubMembership, HosClubActivity
from models.mentorship import AcademicMentor, MonthlyCheckinCall


def seed_clubs_and_mentors():
    db = SessionLocal()
    try:
        print("Seeding Hos-Clubs and Academic Mentorship records...")

        colleges = db.query(College).all()
        if not colleges:
            print("No colleges found to seed clubs for.")
            return

        college = colleges[0]  # ACE Engineering College

        # ── 1. Seed Academic Mentors ──────────────────────────────
        mentors_data = [
            {
                "name": "Dr. Radhika Sharma",
                "email": "radhika.sharma@cohabit.demo",
                "department": "Computer Science & Engineering",
                "designation": "Professor & Senior Student Counselor",
                "phone": "+91 98490 12345",
                "office_location": "Academic Block A, Faculty Wing Room 304",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=faces",
                "bio": "Over 14 years of mentoring undergraduate students in balancing rigorous academics, living away from home, and maintaining holistic mental health.",
            },
            {
                "name": "Prof. K. V. Raman",
                "email": "kv.raman@cohabit.demo",
                "department": "Mechanical Engineering",
                "designation": "Dean of Student Welfare & Associate Professor",
                "phone": "+91 98490 67890",
                "office_location": "Hostel Affairs Administration Office, Ground Floor",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces",
                "bio": "Dedicated to student living standards, resolving hostel roommate friction, and ensuring inclusive campus peer culture.",
            },
            {
                "name": "Dr. Sunita Deshmukh",
                "email": "sunita.deshmukh@cohabit.demo",
                "department": "Electrical & Electronics Engineering",
                "designation": "Associate Professor & Faculty Advisor",
                "phone": "+91 98490 54321",
                "office_location": "Academic Block C, Room 212",
                "avatar_url": "https://images.unsplash.com/photo-1580894732479-715894b91223?w=300&h=300&fit=crop&crop=faces",
                "bio": "Mentoring young engineers in building emotional resilience, time management, and extracurricular excellence.",
            },
        ]

        created_mentors = []
        for m_data in mentors_data:
            existing = db.query(AcademicMentor).filter(AcademicMentor.email == m_data["email"]).first()
            if not existing:
                mentor = AcademicMentor(college_id=college.id, **m_data)
                db.add(mentor)
                db.commit()
                db.refresh(mentor)
                created_mentors.append(mentor)
            else:
                created_mentors.append(existing)

        # ── 2. Assign Mentors to Students & Create Calls ───────────
        students = db.query(Student).all()
        for i, s in enumerate(students):
            assigned_mentor = created_mentors[i % len(created_mentors)]
            s.mentor_id = assigned_mentor.id
            db.commit()

            # Seed a completed call for August 2026
            aug_call = db.query(MonthlyCheckinCall).filter(
                MonthlyCheckinCall.student_id == s.id,
                MonthlyCheckinCall.month_year == "August 2026"
            ).first()
            if not aug_call:
                aug_call = MonthlyCheckinCall(
                    student_id=s.id,
                    mentor_id=assigned_mentor.id,
                    month_year="August 2026",
                    scheduled_date="2026-08-20 15:00",
                    completed_date="2026-08-20 15:35",
                    status="Completed",
                    call_mode="Video Call",
                    meeting_link="https://meet.google.com/cohabit-aug-call",
                    student_pre_notes="Adjusting to the new hostel room and cafeteria timings. Sometimes finding it hard to sleep due to different corridor noise levels.",
                    mentor_notes="Student attended punctually. Discussed hostel wing rules and study timetable. Roommate dynamics appear healthy, with shared interests in tech.",
                    confidential_summary="Student shows great promise. Slight initial homesickness noted, advised joining at least one cultural/social club to build peer bonds.",
                    wellbeing_score=4,
                    flag_status="Normal",
                    action_items="1. Establish consistent 11 PM sleep routine with roommate. 2. Explore campus clubs during orientation week.",
                )
                db.add(aug_call)

            # Seed an active scheduled call for September 2026
            sep_call = db.query(MonthlyCheckinCall).filter(
                MonthlyCheckinCall.student_id == s.id,
                MonthlyCheckinCall.month_year == "September 2026"
            ).first()
            if not sep_call:
                sep_call = MonthlyCheckinCall(
                    student_id=s.id,
                    mentor_id=assigned_mentor.id,
                    month_year="September 2026",
                    scheduled_date="2026-09-28 16:00",
                    status="Scheduled",
                    call_mode="Video Call",
                    meeting_link="https://meet.google.com/cohabit-sep-pulse",
                    student_pre_notes="Mid-term exams coming up next week. Want to discuss time management between lab projects and hostel commitments.",
                    flag_status="Normal",
                )
                db.add(sep_call)

        db.commit()

        # ── 3. Seed Hos-Clubs ─────────────────────────────────────
        clubs_data = [
            {
                "name": "Nritya — The Campus Dance Crew",
                "category": "Cultural & Arts",
                "tagline": "Hip-hop, Freestyle, Contemporary & Classical Beats",
                "description": "Nritya brings hostel residents together through rhythm, choreo workshops, and inter-collegiate dance battles. Whether you are a beginner looking to de-stress after classes or an advanced b-boy, our dance floor is open every evening.",
                "image_url": "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&fit=crop",
                "faculty_advisor": "Prof. Ananya Roy",
                "student_lead": "Kavya Menon (4th Year CSE)",
                "meeting_schedule": "Tuesdays & Thursdays · 6:00 PM",
                "venue": "Student Activity Center (SAC) Studio 1",
                "is_mandatory_eligible": True,
            },
            {
                "name": "Crescendo — Vocals & Acoustic Music Society",
                "category": "Cultural & Arts",
                "tagline": "Hostel Jam Sessions, Bands & Open Mic Nights",
                "description": "Unplug from screen fatigue! Crescendo organizes hostel rooftop jam sessions, vocal harmonies, guitar circles, and the flagship annual Battle of the Bands. Music is our antidote to hostel isolation.",
                "image_url": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&fit=crop",
                "faculty_advisor": "Dr. Sunita Deshmukh",
                "student_lead": "Aarav Sharma (3rd Year CSE)",
                "meeting_schedule": "Wednesdays & Saturdays · 7:00 PM",
                "venue": "Hostel Amphitheatre & Music Room",
                "is_mandatory_eligible": True,
            },
            {
                "name": "BitByBit — Coding, AI & Hackathon Society",
                "category": "Academics & Tech",
                "tagline": "Building Scalable Systems, ML Models & Winning Hackathons",
                "description": "The premier tech brotherhood on campus. We run weekly code sprints, mock technical interviews, hackathons, and late-night hostel debug jams. All branches welcome.",
                "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&fit=crop",
                "faculty_advisor": "Dr. Radhika Sharma",
                "student_lead": "Rohan Mehta (3rd Year ME)",
                "meeting_schedule": "Mondays & Fridays · 5:30 PM",
                "venue": "Turing Tech Lab & Innovation Hub",
                "is_mandatory_eligible": True,
            },
            {
                "name": "Sankalp — NSS Social Service & Community Wing",
                "category": "Social Service",
                "tagline": "Empowering Local Communities, Blood Donation & Literacy Drives",
                "description": "Committed to societal welfare and grassroots outreach. We conduct weekend educational tutoring for village schools, emergency blood donation registries, and seasonal blanket distribution campaigns.",
                "image_url": "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&fit=crop",
                "faculty_advisor": "Prof. K. V. Raman",
                "student_lead": "Priya Patel (3rd Year EE)",
                "meeting_schedule": "Sundays · 9:30 AM",
                "venue": "NSS Office & Seminar Hall B",
                "is_mandatory_eligible": True,
            },
            {
                "name": "Prakriti — Green Campus & Sustainability Cell",
                "category": "Social Service",
                "tagline": "Zero-Waste Hostels, Energy Conservation & Urban Gardening",
                "description": "Dedicated to making our residential campus eco-positive. Projects include hostel food waste composting, solar energy awareness, and campus biodiversity gardening.",
                "image_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&fit=crop",
                "faculty_advisor": "Dr. Ramesh Chandra",
                "student_lead": "Neha Reddy (2nd Year Civil)",
                "meeting_schedule": "Saturdays · 4:00 PM",
                "venue": "Botanical Quad & Hostel Lawn",
                "is_mandatory_eligible": True,
            },
            {
                "name": "Strikers — Hostel Cricket & Football League",
                "category": "Sports & Fitness",
                "tagline": "High-Energy Inter-Wing Matches & Fitness Drills",
                "description": "Fuel your physical well-being. We host the prestigious annual Hostel Premier League (HPL), turf football tournaments, and evening badminton round-robins.",
                "image_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&fit=crop",
                "faculty_advisor": "Coach Vikram Singh",
                "student_lead": "Aditya Verma (4th Year Mech)",
                "meeting_schedule": "Daily Practice · 5:00 PM",
                "venue": "Main Sports Ground & Turf Complex",
                "is_mandatory_eligible": True,
            },
            {
                "name": "Hostel Mess & Food Quality Committee",
                "category": "Hostel Committees",
                "tagline": "Student-Governed Menu Planning, Hygiene Audits & Quality Control",
                "description": "The official student committee liaising between hostel dining operators and residents. We conduct weekly hygiene inspections, design balanced menus, and organize festival special feasts.",
                "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&fit=crop",
                "faculty_advisor": "Hostel Warden Office",
                "student_lead": "Siddharth Jain (3rd Year CSE)",
                "meeting_schedule": "Alternate Thursdays · 8:00 PM",
                "venue": "Central Dining Hall Committee Room",
                "is_mandatory_eligible": True,
            },
        ]

        created_clubs = []
        for c_data in clubs_data:
            existing = db.query(HosClub).filter(HosClub.name == c_data["name"]).first()
            if not existing:
                club = HosClub(college_id=college.id, **c_data)
                db.add(club)
                db.commit()
                db.refresh(club)
                created_clubs.append(club)
            else:
                created_clubs.append(existing)

        # ── 4. Seed Club Activities ───────────────────────────────
        activities_data = [
            (created_clubs[0].id, "Freshers Hip-Hop & Freestyle Workshop", "Learn groove foundations and freestyle footwork. Beginners warmly welcome!", "Friday, Oct 10 · 6:00 PM", "SAC Studio 1", "Workshop"),
            (created_clubs[1].id, "Hostel Rooftop Acoustic Night & Open Mic", "Bring your acoustic instruments or just come listen under the campus stars.", "Saturday, Oct 11 · 7:30 PM", "Hostel Block B Terrace", "Meetup"),
            (created_clubs[2].id, "HackSprint: 24-Hour Web & AI Challenge", "Form teams of 3 and build projects solving real hostel & campus friction.", "Friday, Oct 17 · 5:00 PM", "Turing Lab Room 102", "Competition"),
            (created_clubs[3].id, "Campus Blood Donation Camp & Health Screening", "In collaboration with Red Cross Society. Every donor receives refreshments & certificate.", "Sunday, Oct 19 · 10:00 AM", "Student Center Ground Floor", "Outreach"),
            (created_clubs[5].id, "Inter-Wing 7-a-side Football Derby", "Hostel Block A vs Block B championship kickoff.", "Saturday, Oct 18 · 5:30 PM", "Main Turf Ground", "Competition"),
        ]

        for club_id, title, desc, date, venue, event_type in activities_data:
            act_exists = db.query(HosClubActivity).filter(HosClubActivity.title == title).first()
            if not act_exists:
                act = HosClubActivity(
                    club_id=club_id,
                    title=title,
                    description=desc,
                    event_date=date,
                    venue=venue,
                    event_type=event_type,
                    rsvp_count=18,
                )
                db.add(act)

        # ── 5. Seed Memberships for Demo Students ─────────────────
        if students:
            aarav = students[0]
            # Enroll Aarav in Crescendo & BitByBit
            for c_name, role in [("Crescendo — Vocals & Acoustic Music Society", "Lead"), ("BitByBit — Coding, AI & Hackathon Society", "Member")]:
                cl = next((c for c in created_clubs if c.name == c_name), None)
                if cl:
                    mem_exists = db.query(HosClubMembership).filter(
                        HosClubMembership.student_id == aarav.id,
                        HosClubMembership.club_id == cl.id
                    ).first()
                    if not mem_exists:
                        db.add(HosClubMembership(club_id=cl.id, student_id=aarav.id, role=role))

            if len(students) > 1:
                rohan = students[1]
                cl = next((c for c in created_clubs if "Strikers" in c.name), None)
                if cl:
                    db.add(HosClubMembership(club_id=cl.id, student_id=rohan.id, role="Member"))

            if len(students) > 2:
                priya = students[2]
                cl = next((c for c in created_clubs if "Sankalp" in c.name), None)
                if cl:
                    db.add(HosClubMembership(club_id=cl.id, student_id=priya.id, role="Lead"))

        db.commit()
        print("Success! Hos-Clubs and Academic Mentorship records seeded successfully.")

    except Exception as e:
        print(f"Error seeding clubs and mentors: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_clubs_and_mentors()
