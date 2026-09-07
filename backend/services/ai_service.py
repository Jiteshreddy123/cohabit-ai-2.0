import json
import logging
from ai.interview_bot import InterviewBot, get_system_prompt
from fastapi import HTTPException
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def get_or_create_interview(db: Session, student_id: int):
    """
    Checks if an interview exists for the student. If not, creates one
    and initiates the first AI message to begin the session.
    """
    from sqlalchemy import text

    result = db.execute(
        text("SELECT id, conversation FROM interview WHERE student_id = :sid"),
        {"sid": student_id}
    ).fetchone()

    if result:
        interview_id = result[0]
        conversation = json.loads(result[1])
        return interview_id, conversation

    # Create new interview — send initial greeting
    bot = InterviewBot(system_instruction=get_system_prompt())
    try:
        response = bot.send_message("Hi, I'm ready for the interview.")
        history = bot.get_history()
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            history = [
                {"role": "user", "text": "Hi, I'm ready for the interview."},
                {"role": "model", "text": "I'm getting too many requests right now. Please wait about a minute and try again!"}
            ]
        else:
            logger.error(f"AI Service error on interview start: {error_msg}")
            raise HTTPException(status_code=500, detail=f"AI Service Error: {error_msg}")

    history_json = json.dumps(history)

    insert_result = db.execute(
        text("INSERT INTO interview (student_id, conversation) VALUES (:sid, :conv) RETURNING id"),
        {"sid": student_id, "conv": history_json}
    )
    interview_id = insert_result.fetchone()[0]
    db.commit()

    return interview_id, history


def process_interview_message(db: Session, student_id: int, message: str):
    """
    Processes an incoming message from the student, sends it to the LLM,
    and saves the updated conversation history.

    Returns:
        Tuple of (response_text, updated_history, is_complete)
    """
    from sqlalchemy import text

    result = db.execute(
        text("SELECT id, conversation FROM interview WHERE student_id = :sid"),
        {"sid": student_id}
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Interview not found. Start an interview first.")

    interview_id = result[0]
    history = json.loads(result[1])

    bot = InterviewBot(system_instruction=get_system_prompt())
    bot.load_history(history)

    try:
        bot_response = bot.send_message(message)
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return (
                "I'm receiving too many messages right now. Please wait a minute and try again!",
                history,
                False
            )
        logger.error(f"AI Service error on message processing: {error_msg}")
        raise HTTPException(status_code=500, detail=f"AI Service Error: {error_msg}")

    updated_history = bot.get_history()

    db.execute(
        text("UPDATE interview SET conversation = :conv WHERE id = :id"),
        {"conv": json.dumps(updated_history), "id": interview_id}
    )
    db.commit()

    is_complete = "INTERVIEW_COMPLETE" in bot_response
    if is_complete:
        bot_response = bot_response.replace("INTERVIEW_COMPLETE", "").strip()

    return bot_response, updated_history, is_complete


def process_interview_end(db: Session, student_id: int):
    """
    Called when an interview is completed. Triggers AI trait extraction
    (including preferred_room_size) and saves all traits to the database.
    """
    from sqlalchemy import text
    from ai.trait_extractor import extract_traits

    result = db.execute(
        text("SELECT conversation FROM interview WHERE student_id = :sid"),
        {"sid": student_id}
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Interview not found.")

    history = json.loads(result[0])
    traits_data = extract_traits(history)

    insert_query = text("""
        INSERT INTO traits (
            student_id, sleep_time, wake_time, study_style, noise_tolerance,
            cleanliness, social_level, preferred_room_size,
            flexible_preferences, non_negotiable_preferences, personality_summary
        ) VALUES (
            :sid, :st, :wt, :ss, :nt, :cl, :sl, :prs, :fp, :nnp, :ps
        )
        ON CONFLICT (student_id) DO UPDATE SET
            sleep_time = EXCLUDED.sleep_time,
            wake_time = EXCLUDED.wake_time,
            study_style = EXCLUDED.study_style,
            noise_tolerance = EXCLUDED.noise_tolerance,
            cleanliness = EXCLUDED.cleanliness,
            social_level = EXCLUDED.social_level,
            preferred_room_size = EXCLUDED.preferred_room_size,
            flexible_preferences = EXCLUDED.flexible_preferences,
            non_negotiable_preferences = EXCLUDED.non_negotiable_preferences,
            personality_summary = EXCLUDED.personality_summary
    """)

    db.execute(insert_query, {
        "sid": student_id,
        "st": traits_data.get("sleep_time"),
        "wt": traits_data.get("wake_time"),
        "ss": traits_data.get("study_style"),
        "nt": traits_data.get("noise_tolerance", 0.5),
        "cl": traits_data.get("cleanliness", 0.5),
        "sl": traits_data.get("social_level", 0.5),
        "prs": traits_data.get("preferred_room_size", 2),
        "fp": traits_data.get("flexible_preferences"),
        "nnp": traits_data.get("non_negotiable_preferences"),
        "ps": traits_data.get("personality_summary")
    })
    
    db.execute(
        text("UPDATE student SET interview_status = 'Completed' WHERE id = :sid"),
        {"sid": student_id}
    )
    
    db.commit()
    return traits_data

