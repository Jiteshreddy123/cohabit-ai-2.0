"""
Room Allocator for CoHabit-AI.

Uses Google OR-Tools CP-SAT solver to assign students to rooms,
maximizing overall compatibility scores.

Hard Constraints (MUST be satisfied):
1. preferred_room_size — each student goes only into rooms of their chosen capacity
2. Gender segregation — male and female students never share a room

Soft Objective:
- Maximize total pairwise compatibility scores for students in the same room

Algorithm:
1. Parse room_inventory from the session (e.g. {"2": 20, "3": 10})
2. Group students by preferred_room_size
3. Within each group, segregate by gender
4. For each (room_size, gender) sub-group, run OR-Tools CP-SAT
5. Save results to recommendations table
6. Report unallocated students (those whose preferred room type has no rooms left)
"""

import math
import logging
from typing import Dict, List, Optional

from ortools.sat.python import cp_model

logger = logging.getLogger(__name__)


# ── OR-Tools Solver ────────────────────────────────────────────────────────────

def _run_ortools(student_ids: List[int], room_capacity: int,
                 num_rooms: int, score_map: Dict) -> Dict[int, List[int]]:
    """
    Runs the CP-SAT solver to assign students to rooms of a given capacity.

    Args:
        student_ids: List of student IDs to assign
        room_capacity: Maximum students per room
        num_rooms: Number of rooms of this type available
        score_map: {(s1_id, s2_id): score} pairwise compatibility scores

    Returns:
        Dict mapping room_index → list of student_ids assigned to it
    """
    n = len(student_ids)
    if n == 0:
        return {}

    # If we have more rooms than needed, only use the minimum required
    needed_rooms = math.ceil(n / room_capacity)
    num_rooms = min(num_rooms, max(needed_rooms, 1))

    model = cp_model.CpModel()

    # x[s][r] = 1 if student s is assigned to room r
    x = {}
    for s in range(n):
        for r in range(num_rooms):
            x[(s, r)] = model.NewBoolVar(f'x_s{s}_r{r}')

    # ── Hard Constraints ──────────────────────────────────────────────────────

    # Each student must be assigned to exactly one room
    for s in range(n):
        model.AddExactlyOne([x[(s, r)] for r in range(num_rooms)])

    # No room exceeds its capacity
    for r in range(num_rooms):
        model.Add(sum(x[(s, r)] for s in range(n)) <= room_capacity)

    # Symmetry breaking: fill earlier rooms before later ones
    for r in range(1, num_rooms):
        model.Add(
            sum(x[(s, r)] for s in range(n)) <=
            sum(x[(s, r - 1)] for s in range(n))
        )

    # ── Objective: maximize pairwise compatibility ─────────────────────────────

    def get_score(i: int, j: int) -> float:
        """Lookup score by student ID, default to 50 if not found."""
        s1 = student_ids[i]
        s2 = student_ids[j]
        return score_map.get((s1, s2), score_map.get((s2, s1), 50.0))

    objective_terms = []
    for i in range(n):
        for j in range(i + 1, n):
            for r in range(num_rooms):
                # both_in_r = 1 iff x[i,r] = 1 AND x[j,r] = 1
                both_in_r = model.NewBoolVar(f'both_i{i}_j{j}_r{r}')
                # Linearization: both_in_r = x[i][r] AND x[j][r]
                model.Add(both_in_r <= x[(i, r)])
                model.Add(both_in_r <= x[(j, r)])
                model.Add(both_in_r >= x[(i, r)] + x[(j, r)] - 1)

                # Score coefficient (integer, multiplied by 100 for precision)
                score_int = int(get_score(i, j) * 100)
                objective_terms.append(score_int * both_in_r)

    model.Maximize(sum(objective_terms))

    # ── Solve ─────────────────────────────────────────────────────────────────

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0
    solver.parameters.num_search_workers = 4  # Parallel search
    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        logger.warning(f"OR-Tools solver returned status {solver.StatusName(status)} for {n} students.")
        return {}

    result = {}
    for r in range(num_rooms):
        occupants = [
            student_ids[s]
            for s in range(n)
            if solver.Value(x[(s, r)]) == 1
        ]
        if occupants:
            result[r] = occupants

    return result


# ── Main Allocator Entry Point ─────────────────────────────────────────────────

def allocate_rooms(db, session_id: int) -> dict:
    """
    Allocates students into rooms for a given allocation session.

    Hard constraints enforced:
    - Students are grouped by their preferred_room_size (from AI interview)
    - Gender segregation: males and females never share a room

    Soft objective:
    - Maximize total compatibility score within each room

    Returns a dict with status, rooms_allocated, and unallocated_count.
    """
    from sqlalchemy import text

    # ── 1. Load Session ────────────────────────────────────────────────────────
    session = db.execute(
        text("SELECT room_inventory FROM allocation_sessions WHERE id = :sid"),
        {"sid": session_id}
    ).fetchone()

    if not session:
        raise ValueError(f"Session {session_id} not found")

    room_inventory = session.room_inventory or {}
    if not room_inventory:
        logger.warning(f"Session {session_id} has no room inventory configured.")
        return {"status": "NO_ROOM_INVENTORY", "rooms_allocated": 0, "unallocated_count": 0}

    # Convert keys to int for easier math
    # e.g. {"2": 20, "3": 10} → {2: 20, 3: 10}
    available_rooms: Dict[int, int] = {}
    for k, v in room_inventory.items():
        try:
            available_rooms[int(k)] = int(v)
        except (ValueError, TypeError):
            logger.warning(f"Invalid room_inventory key/value: {k}={v}")

    # ── 2. Load Students with Traits ──────────────────────────────────────────
    students = db.execute(text("""
        SELECT s.id, s.name, s.gender,
               t.noise_tolerance, t.cleanliness, t.social_level,
               t.sleep_time, t.wake_time, t.study_style, t.preferred_room_size
        FROM student s
        JOIN traits t ON s.id = t.student_id
        WHERE s.allocation_session_id = :sid
    """), {"sid": session_id}).fetchall()

    if not students:
        return {"status": "NO_STUDENTS_WITH_TRAITS", "rooms_allocated": 0, "unallocated_count": 0}

    # ── 3. Load Compatibility Scores ──────────────────────────────────────────
    scores = db.execute(text("""
        SELECT student1_id, student2_id, compatibility_score
        FROM compatibility_score
        WHERE allocation_session_id = :sid
    """), {"sid": session_id}).fetchall()

    score_map: Dict = {}
    for row in scores:
        s1, s2, sc = row.student1_id, row.student2_id, float(row.compatibility_score)
        score_map[(s1, s2)] = sc
        score_map[(s2, s1)] = sc

    # ── 4. Group Students ──────────────────────────────────────────────────────
    # Group by (preferred_room_size, gender) — both are hard constraints
    groups: Dict[tuple, List] = {}
    unallocated = []

    for student in students:
        pref_size = student.preferred_room_size
        gender = student.gender

        if pref_size is None or pref_size not in available_rooms or available_rooms[pref_size] <= 0:
            # No rooms of this type available — will report as unallocated
            unallocated.append(student)
            continue

        key = (int(pref_size), gender)
        groups.setdefault(key, []).append(student)

    if not groups and not unallocated:
        return {"status": "NO_STUDENTS_WITH_TRAITS", "rooms_allocated": 0, "unallocated_count": 0}

    # ── 5. Clear Old Recommendations ──────────────────────────────────────────
    db.execute(
        text("DELETE FROM recommendations WHERE allocation_session_id = :sid"),
        {"sid": session_id}
    )

    # ── 6. Allocate Each Sub-Group ────────────────────────────────────────────
    rooms_allocated = 0
    global_room_number = 1

    for (room_size, gender), group_students in groups.items():
        student_ids = [s.id for s in group_students]
        rooms_available = available_rooms.get(room_size, 0)

        if rooms_available == 0:
            unallocated.extend(group_students)
            continue

        rooms_needed = math.ceil(len(student_ids) / room_size)
        actual_rooms = min(rooms_needed, rooms_available)

        if actual_rooms < rooms_needed:
            # Not enough rooms — some students will be unallocated
            can_fit = actual_rooms * room_size
            unallocated.extend(group_students[can_fit:])
            student_ids = student_ids[:can_fit]

        if not student_ids:
            continue

        logger.info(
            f"Session {session_id}: running solver for "
            f"{len(student_ids)} {gender} students in {room_size}-bed rooms "
            f"({actual_rooms} rooms available)"
        )

        assignments = _run_ortools(student_ids, room_size, actual_rooms, score_map)

        if not assignments:
            logger.warning(f"Solver found no solution for group ({room_size}-bed, {gender})")
            unallocated.extend(group_students)
            continue

        # Deduct rooms used from inventory
        available_rooms[room_size] = rooms_available - len(assignments)

        # ── 7. Persist Recommendations ────────────────────────────────────────
        for _, occupant_ids in assignments.items():
            if not occupant_ids:
                continue

            # Calculate average compatibility score for this room
            total_score = 0.0
            pairs = 0
            for ii in range(len(occupant_ids)):
                for jj in range(ii + 1, len(occupant_ids)):
                    total_score += score_map.get(
                        (occupant_ids[ii], occupant_ids[jj]),
                        score_map.get((occupant_ids[jj], occupant_ids[ii]), 50.0)
                    )
                    pairs += 1
            avg_score = (total_score / pairs) if pairs > 0 else 100.0

            room_label = f"{room_size}-Sharing Room {global_room_number}"
            reason = (
                f"Allocated to a {room_size}-person room as preferred. "
                f"All occupants share the same gender. "
                f"Compatibility score: {avg_score:.1f}/100."
            )

            res = db.execute(text("""
                INSERT INTO recommendations
                    (allocation_session_id, room_number, compatibility_score, reason)
                VALUES (:sid, :rn, :sc, :rs)
                RETURNING id
            """), {
                "sid": session_id,
                "rn": room_label,
                "sc": round(avg_score, 2),
                "rs": reason
            })
            rec_id = res.fetchone()[0]

            for student_id in occupant_ids:
                db.execute(
                    text("INSERT INTO recommendation_members (recommendation_id, student_id) VALUES (:rid, :sid)"),
                    {"rid": rec_id, "sid": student_id}
                )

            global_room_number += 1
            rooms_allocated += 1

    db.commit()

    logger.info(
        f"Session {session_id}: allocation complete — "
        f"{rooms_allocated} rooms allocated, {len(unallocated)} students unallocated."
    )

    return {
        "status": "SUCCESS" if rooms_allocated > 0 else "FAILED",
        "rooms_allocated": rooms_allocated,
        "unallocated_count": len(unallocated),
        "unallocated_student_ids": [s.id for s in unallocated]
    }

