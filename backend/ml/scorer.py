"""
Compatibility Scorer for CoHabit-AI.

Calculates a pairwise compatibility score (0–100) between two students
based on their extracted lifestyle traits.

Key design decisions:
- Gender mismatch returns None (incompatible — hard constraint, not a score)
- Sleep/wake times are normalized before comparison to handle "10pm" == "22:00"
- All numeric trait scores are weighted and summed
"""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)


# ── Time Normalization ────────────────────────────────────────────────────────

def _normalize_time_to_minutes(time_str: str) -> Optional[int]:
    """
    Converts a time string to minutes since midnight (0–1439).
    Handles formats like: "10pm", "22:00", "10:30 PM", "7am", "07:30"
    Returns None if the string cannot be parsed.
    """
    if not time_str:
        return None

    s = time_str.strip().lower()

    # Match "HH:MM am/pm" or "HH:MM"
    match_hhmm = re.match(r'^(\d{1,2}):(\d{2})\s*(am|pm)?$', s)
    if match_hhmm:
        hour = int(match_hhmm.group(1))
        minute = int(match_hhmm.group(2))
        meridiem = match_hhmm.group(3)
        if meridiem == "pm" and hour != 12:
            hour += 12
        elif meridiem == "am" and hour == 12:
            hour = 0
        return hour * 60 + minute

    # Match "10pm" or "10am"
    match_hm = re.match(r'^(\d{1,2})\s*(am|pm)$', s)
    if match_hm:
        hour = int(match_hm.group(1))
        meridiem = match_hm.group(2)
        if meridiem == "pm" and hour != 12:
            hour += 12
        elif meridiem == "am" and hour == 12:
            hour = 0
        return hour * 60

    # Match bare hour like "23"
    match_bare = re.match(r'^(\d{1,2})$', s)
    if match_bare:
        hour = int(match_bare.group(1))
        if 0 <= hour <= 23:
            return hour * 60

    return None


def _time_difference_score(time1: str, time2: str, max_penalty: float) -> float:
    """
    Returns a penalty (0 to max_penalty) based on the difference between
    two time strings. Returns 0 penalty (no deduction) if times match,
    scales linearly up to max_penalty for ≥3 hour difference.
    """
    t1 = _normalize_time_to_minutes(time1)
    t2 = _normalize_time_to_minutes(time2)

    if t1 is None or t2 is None:
        # Cannot compare — apply half penalty (benefit of the doubt)
        return max_penalty * 0.5

    diff_minutes = abs(t1 - t2)
    # Handle midnight wrap-around (e.g., 11pm vs 1am = 2h, not 22h)
    diff_minutes = min(diff_minutes, 1440 - diff_minutes)

    # Scale: 0 minutes diff = 0 penalty; 180+ minutes (3h) = full penalty
    ratio = min(diff_minutes / 180.0, 1.0)
    return ratio * max_penalty


# ── Main Compatibility Function ───────────────────────────────────────────────

def calculate_compatibility(traits1: dict, traits2: dict) -> Optional[float]:
    """
    Calculates a compatibility score (0.0–100.0) between two students.

    Returns None if the students are fundamentally incompatible (gender mismatch).
    This signals a hard constraint violation to the allocator.

    Scoring weights (total = 100):
        Noise tolerance:    20 pts
        Cleanliness:        20 pts
        Social level:       10 pts
        Sleep time:         15 pts
        Wake time:          15 pts
        Study style:        20 pts
    """
    score = 100.0

    # ── Noise Tolerance (Weight: 20%) ─────────────────────────────────────────
    noise_diff = abs(traits1.get("noise_tolerance", 0.5) - traits2.get("noise_tolerance", 0.5))
    score -= noise_diff * 20.0

    # ── Cleanliness (Weight: 20%) ─────────────────────────────────────────────
    clean_diff = abs(traits1.get("cleanliness", 0.5) - traits2.get("cleanliness", 0.5))
    score -= clean_diff * 20.0

    # ── Social Level (Weight: 10%) ────────────────────────────────────────────
    social_diff = abs(traits1.get("social_level", 0.5) - traits2.get("social_level", 0.5))
    score -= social_diff * 10.0

    # ── Sleep Time (Weight: 15%) — with time normalization ────────────────────
    score -= _time_difference_score(
        traits1.get("sleep_time", ""), traits2.get("sleep_time", ""), max_penalty=15.0
    )

    # ── Wake Time (Weight: 15%) — with time normalization ─────────────────────
    score -= _time_difference_score(
        traits1.get("wake_time", ""), traits2.get("wake_time", ""), max_penalty=15.0
    )

    # ── Study Style (Weight: 20%) — keyword-based similarity ─────────────────
    ss1 = str(traits1.get("study_style", "")).lower().strip()
    ss2 = str(traits2.get("study_style", "")).lower().strip()
    if ss1 and ss2:
        # Define compatible clusters
        silent_keywords = {"silence", "silent", "quiet", "alone", "by myself", "no noise"}
        noisy_keywords = {"music", "background", "group", "noise", "with others", "together"}

        def get_cluster(s):
            if any(k in s for k in silent_keywords):
                return "silent"
            if any(k in s for k in noisy_keywords):
                return "noisy"
            return "neutral"

        c1, c2 = get_cluster(ss1), get_cluster(ss2)
        if c1 != "neutral" and c2 != "neutral" and c1 != c2:
            # Opposite clusters — full penalty
            score -= 20.0
        elif c1 == c2 and c1 != "neutral":
            # Same cluster — no penalty
            pass
        else:
            # One or both neutral — half penalty
            score -= 10.0

    return max(0.0, min(100.0, score))


# ── Batch Matrix Generation ───────────────────────────────────────────────────

def generate_compatibility_matrix(db, session_id: int) -> int:
    """
    Fetches all students with traits for a session, calculates pairwise
    compatibility scores, and saves them to the compatibility_score table.

    Cross-gender pairs are skipped (hard constraint — handled by the allocator).

    Returns:
        Number of compatibility pairs inserted.
    """
    from sqlalchemy import text

    query = text("""
        SELECT s.id, s.gender, t.noise_tolerance, t.cleanliness, t.social_level,
               t.sleep_time, t.wake_time, t.study_style, t.preferred_room_size
        FROM student s
        JOIN traits t ON s.id = t.student_id
        WHERE s.allocation_session_id = :session_id
    """)
    students = db.execute(query, {"session_id": session_id}).fetchall()

    if len(students) < 2:
        logger.info(f"Session {session_id}: fewer than 2 students with traits — skipping matrix.")
        return 0

    # Clear existing scores for this session
    db.execute(
        text("DELETE FROM compatibility_score WHERE allocation_session_id = :session_id"),
        {"session_id": session_id}
    )

    insert_query = text("""
        INSERT INTO compatibility_score (allocation_session_id, student1_id, student2_id, compatibility_score)
        VALUES (:session_id, :s1, :s2, :score)
    """)

    count = 0
    for i in range(len(students)):
        for j in range(i + 1, len(students)):
            s1 = students[i]
            s2 = students[j]

            # Skip cross-gender pairs — gender segregation is a hard constraint
            if s1.gender != s2.gender:
                continue

            t1 = dict(s1._mapping)
            t2 = dict(s2._mapping)
            score = calculate_compatibility(t1, t2)

            if score is None:
                continue

            db.execute(insert_query, {
                "session_id": session_id,
                "s1": s1.id,
                "s2": s2.id,
                "score": score
            })
            count += 1

    db.commit()
    logger.info(f"Session {session_id}: generated {count} compatibility scores.")
    return count

