"""
Trait Extractor module.

Takes the AI interview transcript and uses Gemini to extract structured
personality traits and preferences for use in the roommate compatibility scorer.

Uses the google.genai SDK (new client API) for consistency with interview_bot.py.
"""

import json
import logging
from google import genai
from pydantic import BaseModel, Field
from config import settings
from typing import Optional

logger = logging.getLogger(__name__)

# Initialize the genai client
client = genai.Client(api_key=settings.GEMINI_API_KEY)


class TraitSchema(BaseModel):
    """Structured trait profile extracted from an AI interview."""
    sleep_time: str = Field(description="Student's typical sleep time, e.g. '23:00' or '11pm'")
    wake_time: str = Field(description="Student's typical wake time, e.g. '06:30' or '7am'")
    study_style: str = Field(description="Study habits, e.g. 'alone in silence', 'with background music', 'group study'")
    noise_tolerance: float = Field(description="Noise tolerance score: 0.0 = hates any noise, 1.0 = fully tolerant of noise")
    cleanliness: float = Field(description="Cleanliness score: 0.0 = very messy, 1.0 = extremely neat/organized")
    social_level: float = Field(description="Social level: 0.0 = extreme introvert, 1.0 = extreme extrovert")
    preferred_room_size: int = Field(
        description="Student's preferred room type expressed as capacity: 1=single, 2=double, 3=triple, 4=quad. Default to 2 if not mentioned."
    )
    flexible_preferences: str = Field(description="Preferences the student is willing to compromise on")
    non_negotiable_preferences: str = Field(description="Preferences the student absolutely cannot compromise on")
    personality_summary: str = Field(description="A 2-3 sentence summary of the student's personality and lifestyle")


def extract_traits(conversation_history: list) -> dict:
    """
    Takes the full interview conversation history and uses Gemini to extract
    a structured trait profile.

    Args:
        conversation_history: List of dicts with 'role' and 'text' keys.

    Returns:
        A dict matching TraitSchema fields.
    """
    # Convert history to a readable transcript
    transcript = ""
    for msg in conversation_history:
        role = "Interviewer" if msg.get("role") == "model" else "Student"
        text = msg.get("text", "")
        transcript += f"{role}: {text}\n\n"

    prompt = f"""You are an expert behavioral analyst specializing in student lifestyle profiling.

Read the following interview transcript between a CoHabit-AI interviewer and a college student.
Extract the student's personality traits and lifestyle preferences matching the JSON schema below.

IMPORTANT EXTRACTION RULES:
- noise_tolerance, cleanliness, social_level MUST be floats between 0.0 and 1.0
- preferred_room_size MUST be an integer: 1 (single), 2 (double), 3 (triple), or 4 (quad)
  - Look for the student's answer to the room type question. If the student says "double", return 2. "triple" = 3, etc.
  - If NOT mentioned or unclear, default to 2
- sleep_time and wake_time: return in 24h format if possible (e.g. "23:00"), otherwise as stated
- For any missing information, make a reasonable inference from their overall responses
- non_negotiable_preferences should be a clear, comma-separated list of hard requirements

Transcript:
{transcript}

Return ONLY valid JSON matching this exact structure (no markdown, no extra text):
{{
  "sleep_time": "string",
  "wake_time": "string",
  "study_style": "string",
  "noise_tolerance": 0.0,
  "cleanliness": 0.0,
  "social_level": 0.0,
  "preferred_room_size": 2,
  "flexible_preferences": "string",
  "non_negotiable_preferences": "string",
  "personality_summary": "string"
}}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        response_text = response.text.strip()

        # Strip markdown code fences if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        traits_dict = json.loads(response_text)

        # Validate and clamp numeric fields
        for float_field in ("noise_tolerance", "cleanliness", "social_level"):
            val = traits_dict.get(float_field, 0.5)
            traits_dict[float_field] = max(0.0, min(1.0, float(val)))

        pref_size = traits_dict.get("preferred_room_size", 2)
        try:
            pref_size = int(pref_size)
        except (TypeError, ValueError):
            pref_size = 2
        traits_dict["preferred_room_size"] = max(1, min(4, pref_size))

        return traits_dict

    except Exception as e:
        logger.warning(f"Gemini trait extraction encountered issue: {e}. Running local heuristic extraction...")
        # Local heuristic extraction from transcript
        t_lower = transcript.lower()
        
        # Room size heuristic
        pref_size = 2
        if "single" in t_lower or "1" in t_lower:
            pref_size = 1
        elif "triple" in t_lower or "3" in t_lower:
            pref_size = 3
        elif "quad" in t_lower or "4" in t_lower:
            pref_size = 4
            
        # Sleep & wake time heuristic
        sleep_time = "23:30"
        if "12" in t_lower or "1:00" in t_lower or "1am" in t_lower or "late" in t_lower or "night owl" in t_lower:
            sleep_time = "01:00"
        elif "10" in t_lower or "11" in t_lower:
            sleep_time = "23:00"

        wake_time = "07:30"
        if "6" in t_lower or "early" in t_lower or "morning" in t_lower:
            wake_time = "06:30"
        elif "8" in t_lower or "9" in t_lower:
            wake_time = "08:30"

        # Noise & Cleanliness
        noise_val = 0.7 if ("music" in t_lower or "group" in t_lower or "chat" in t_lower or "ambient" in t_lower) else 0.4
        clean_val = 0.85 if ("clean" in t_lower or "tidy" in t_lower or "spotless" in t_lower or "neat" in t_lower) else 0.6
        social_val = 0.8 if ("friends" in t_lower or "extrovert" in t_lower or "chat" in t_lower or "together" in t_lower) else 0.5
        study_val = "Collaborative study with discussion" if "group" in t_lower or "music" in t_lower else "Focused quiet study"

        return {
            "sleep_time": sleep_time,
            "wake_time": wake_time,
            "study_style": study_val,
            "noise_tolerance": noise_val,
            "cleanliness": clean_val,
            "social_level": social_val,
            "preferred_room_size": pref_size,
            "flexible_preferences": "Open to sharing study resources and snacks",
            "non_negotiable_preferences": "Respecting sleep schedules and personal workspace",
            "personality_summary": f"Self-motivated student who prefers a {pref_size}-sharing room with compatible sleep and study routines."
        }

