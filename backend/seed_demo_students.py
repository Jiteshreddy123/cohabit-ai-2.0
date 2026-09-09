import json
from database import SessionLocal
from models.college import College
from models.student import Student
from models.traits import Traits
from models.interview import Interview
from models.allocation_session import AllocationSession
from services.auth_service import hash_password
from ml.scorer import generate_compatibility_matrix
from ml.allocator import allocate_rooms

def seed_demo_students_and_interviews():
    db = SessionLocal()
    try:
        # Ensure Demo Admin college exists
        college = db.query(College).filter(College.email == "admin@cohabit.demo").first()
        if not college:
            college = College(
                name="ACE Engineering College",
                email="admin@cohabit.demo",
                password=hash_password("Admin@1234"),
                college_code="ACE2026"
            )
            db.add(college)
            db.commit()
            db.refresh(college)
            print(f"Created demo college: {college.name} (ID: {college.id})")
        else:
            college.name = "ACE Engineering College"
            college.college_code = "ACE2026"
            db.commit()

        college_id = college.id

        session = db.query(AllocationSession).filter(AllocationSession.college_id == college_id).first()
        if not session:
            print("No allocation session found! Creating one...")
            session = AllocationSession(
                college_id=college_id,
                title="Spring 2026 Allocation",
                academic_year="2025-2026",
                session_size=20,
                room_inventory={"2": 10},
                session_status="Active"
            )
            db.add(session)
            db.commit()
            db.refresh(session)
        
        session_id = session.id
        print(f"Using Allocation Session ID: {session_id}")

        demo_students_data = [
            {
                "name": "Aarav Sharma",
                "roll_number": "CS21B001",
                "email": "aarav@cohabit.demo",
                "branch": "Computer Science",
                "year_of_study": 3,
                "gender": "Male",
                "conversation": [
                    {"role": "model", "text": "Hi Aarav! Welcome to the CoHabit-AI Roommate Compatibility Interview. Let's start with your typical daily schedule: what time do you usually sleep and wake up?"},
                    {"role": "user", "text": "Hey! I usually sleep late, around 1:00 AM, and wake up around 8:30 or 9:00 AM."},
                    {"role": "model", "text": "Great! How would you describe your study habits and noise tolerance in the room?"},
                    {"role": "user", "text": "I like studying with ambient music or discussing code with friends. I don't mind moderate noise at all."},
                    {"role": "model", "text": "How strict are you with room cleanliness, and what room type do you prefer?"},
                    {"role": "user", "text": "I keep things reasonably tidy, around a 6/10. Definitely prefer a double room so I have a roommate to chat with."},
                    {"role": "model", "text": "Any non-negotiables?"},
                    {"role": "user", "text": "I need to be able to use my desk lamp for late-night coding. Other than that, I'm very chill."},
                    {"role": "model", "text": "Thank you Aarav! Your interview is complete. INTERVIEW_COMPLETE"}
                ],
                "traits": {
                    "sleep_time": "01:00",
                    "wake_time": "09:00",
                    "study_style": "Group study with ambient sound",
                    "noise_tolerance": 0.8,
                    "cleanliness": 0.6,
                    "social_level": 0.85,
                    "preferred_room_size": 2,
                    "flexible_preferences": "Open to sharing snacks and workspace",
                    "non_negotiable_preferences": "Must allow late night study with desk lamp",
                    "personality_summary": "Energetic CS junior who thrives on late-night problem solving and collaborative discussions."
                }
            },
            {
                "name": "Rohan Mehta",
                "roll_number": "ME21B003",
                "email": "rohan@cohabit.demo",
                "branch": "Mechanical Engineering",
                "year_of_study": 3,
                "gender": "Male",
                "conversation": [
                    {"role": "model", "text": "Hello Rohan! Welcome to CoHabit-AI. Could you tell me about your sleep and study routine?"},
                    {"role": "user", "text": "Hi! I usually sleep around 12:30 or 1:00 AM and wake up at 8:30 AM before morning lectures."},
                    {"role": "model", "text": "Nice! And how do you like your study environment?"},
                    {"role": "user", "text": "I love group discussions and working on CAD designs while listening to lo-fi music. Moderate noise is totally fine."},
                    {"role": "model", "text": "What about cleanliness and preferred room capacity?"},
                    {"role": "user", "text": "Cleanliness is normal, I tidy up my desk every weekend. I prefer a double room sharing with a fellow night owl."},
                    {"role": "model", "text": "Any dealbreakers?"},
                    {"role": "user", "text": "I just prefer someone who doesn't mind lights on till midnight."},
                    {"role": "model", "text": "Thanks Rohan, that's everything we need! INTERVIEW_COMPLETE"}
                ],
                "traits": {
                    "sleep_time": "00:30",
                    "wake_time": "08:30",
                    "study_style": "Discussion & collaborative problem solving",
                    "noise_tolerance": 0.75,
                    "cleanliness": 0.65,
                    "social_level": 0.75,
                    "preferred_room_size": 2,
                    "flexible_preferences": "Enjoys shared sports gear and study materials",
                    "non_negotiable_preferences": "Night owl friendly atmosphere",
                    "personality_summary": "Friendly mechanical engineering student who enjoys collaborative projects and relaxed hostel living."
                }
            },
            {
                "name": "Priya Patel",
                "roll_number": "EE21B002",
                "email": "priya@cohabit.demo",
                "branch": "Electrical Engineering",
                "year_of_study": 3,
                "gender": "Female",
                "conversation": [
                    {"role": "model", "text": "Hello Priya! Welcome to CoHabit-AI. What does your typical daily routine look like?"},
                    {"role": "user", "text": "Hello! I am strictly an early bird. I sleep at 10:30 PM and wake up at 6:00 AM for morning runs and study."},
                    {"role": "model", "text": "What are your expectations for noise and quiet hours in the room?"},
                    {"role": "user", "text": "I need silence when studying. Low noise tolerance. If listening to anything, headphones are a must."},
                    {"role": "model", "text": "How important is cleanliness to you, and what room type do you prefer?"},
                    {"role": "user", "text": "Very important, around 9/10. I like everything organized and swept. A double room works great as long as my roommate is respectful."},
                    {"role": "model", "text": "What are your non-negotiables?"},
                    {"role": "user", "text": "Lights out by 11:00 PM and clean desk surfaces."},
                    {"role": "model", "text": "Wonderful, thank you Priya! Your profile is all set. INTERVIEW_COMPLETE"}
                ],
                "traits": {
                    "sleep_time": "22:30",
                    "wake_time": "06:00",
                    "study_style": "Quiet solo library-style study",
                    "noise_tolerance": 0.2,
                    "cleanliness": 0.9,
                    "social_level": 0.4,
                    "preferred_room_size": 2,
                    "flexible_preferences": "Quiet music through headphones is welcome",
                    "non_negotiable_preferences": "Lights out by 11 PM and clean desk space",
                    "personality_summary": "Dedicated electrical engineering student with structured morning study habits and high hygiene standards."
                }
            },
            {
                "name": "Ananya Verma",
                "roll_number": "CS21B004",
                "email": "ananya@cohabit.demo",
                "branch": "Computer Science",
                "year_of_study": 2,
                "gender": "Female",
                "conversation": [
                    {"role": "model", "text": "Hi Ananya! Welcome to CoHabit-AI. What time do you usually sleep and wake up?"},
                    {"role": "user", "text": "Hi! I sleep around 11:00 PM and wake up at 6:30 AM to prepare for morning classes."},
                    {"role": "model", "text": "How do you prefer to study in your room?"},
                    {"role": "user", "text": "I like quiet study time with my laptop and notebook. I appreciate a peaceful room."},
                    {"role": "model", "text": "What are your cleanliness preferences and preferred room size?"},
                    {"role": "user", "text": "High cleanliness, around 8.5/10. No shoes on the rug, tidy closet. Double room is my top choice."},
                    {"role": "model", "text": "Any dealbreakers for roommates?"},
                    {"role": "user", "text": "Respecting quiet hours after 11 PM and keeping common areas tidy."},
                    {"role": "model", "text": "Thank you Ananya! Interview recorded successfully. INTERVIEW_COMPLETE"}
                ],
                "traits": {
                    "sleep_time": "23:00",
                    "wake_time": "06:30",
                    "study_style": "Focused solo study with notes",
                    "noise_tolerance": 0.3,
                    "cleanliness": 0.85,
                    "social_level": 0.5,
                    "preferred_room_size": 2,
                    "flexible_preferences": "Occasional daytime study sessions together",
                    "non_negotiable_preferences": "Quiet after 11 PM, tidy floor and desk",
                    "personality_summary": "Organized CS sophomore who values punctuality, peaceful sleep, and a tidy living environment."
                }
            }
        ]

        created_students = []
        for s_data in demo_students_data:
            student = db.query(Student).filter(Student.email == s_data["email"]).first()
            if not student:
                student = Student(
                    college_id=college_id,
                    allocation_session_id=session_id,
                    name=s_data["name"],
                    roll_number=s_data["roll_number"],
                    email=s_data["email"],
                    branch=s_data["branch"],
                    year_of_study=s_data["year_of_study"],
                    gender=s_data["gender"],
                    password=hash_password(s_data["roll_number"]),
                    interview_status="Completed"
                )
                db.add(student)
                db.commit()
                db.refresh(student)
                print(f"Created student {student.name} (ID: {student.id})")
            else:
                student.interview_status = "Completed"
                student.allocation_session_id = session_id
                db.commit()
                print(f"Found student {student.name} (ID: {student.id})")

            created_students.append(student)

            # Insert/Update interview conversation
            interview = db.query(Interview).filter(Interview.student_id == student.id).first()
            if not interview:
                interview = Interview(
                    student_id=student.id,
                    conversation=json.dumps(s_data["conversation"])
                )
                db.add(interview)
            else:
                interview.conversation = json.dumps(s_data["conversation"])
            db.commit()

            # Insert/Update traits
            t_data = s_data["traits"]
            traits = db.query(Traits).filter(Traits.student_id == student.id).first()
            if not traits:
                traits = Traits(
                    student_id=student.id,
                    sleep_time=t_data["sleep_time"],
                    wake_time=t_data["wake_time"],
                    study_style=t_data["study_style"],
                    noise_tolerance=t_data["noise_tolerance"],
                    cleanliness=t_data["cleanliness"],
                    social_level=t_data["social_level"],
                    preferred_room_size=t_data["preferred_room_size"],
                    flexible_preferences=t_data["flexible_preferences"],
                    non_negotiable_preferences=t_data["non_negotiable_preferences"],
                    personality_summary=t_data["personality_summary"]
                )
                db.add(traits)
            else:
                traits.sleep_time = t_data["sleep_time"]
                traits.wake_time = t_data["wake_time"]
                traits.study_style = t_data["study_style"]
                traits.noise_tolerance = t_data["noise_tolerance"]
                traits.cleanliness = t_data["cleanliness"]
                traits.social_level = t_data["social_level"]
                traits.preferred_room_size = t_data["preferred_room_size"]
                traits.flexible_preferences = t_data["flexible_preferences"]
                traits.non_negotiable_preferences = t_data["non_negotiable_preferences"]
                traits.personality_summary = t_data["personality_summary"]
            db.commit()
            print(f"Recorded completed interview and traits for {student.name}")

        # Now run compatibility matrix and room allocations!
        print("\nCalculating compatibility scores...")
        pairs_scored = generate_compatibility_matrix(db, session_id)
        print(f"Pairs scored: {pairs_scored}")

        print("Running OR-Tools room allocation optimizer...")
        alloc_res = allocate_rooms(db, session_id)
        print(f"Room allocation result: {alloc_res}")

        # Set session to published so students can see their room allocations!
        session.is_published = True
        session.session_status = "Completed"
        db.commit()
        print("Session published successfully!")

        print("\nAll 4 demo students seeded with completed interviews, traits, and room allocations!")
        for s in created_students:
            print(f" - {s.name}: Email={s.email}, Roll={s.roll_number}, Gender={s.gender}, Status={s.interview_status}")

    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_students_and_interviews()
