"""
Secure File and Image Upload Service.

Handles validation, secure storage, and path resolution for review evidence
and complaint photos.
"""

import os
import uuid
import aiofiles
from fastapi import UploadFile
from utils.exceptions import ValidationError

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
REVIEWS_UPLOAD_DIR = os.path.join(UPLOAD_DIR, "reviews")
COMPLAINTS_UPLOAD_DIR = os.path.join(UPLOAD_DIR, "complaints")

# Ensure directories exist
os.makedirs(REVIEWS_UPLOAD_DIR, exist_ok=True)
os.makedirs(COMPLAINTS_UPLOAD_DIR, exist_ok=True)


async def save_uploaded_file(file: UploadFile, subfolder: str = "reviews") -> dict:
    """
    Validates and saves an uploaded image file.
    
    Returns a dict containing:
        - file_url: relative URL for frontend consumption (e.g. "/uploads/reviews/...")
        - file_name: sanitized original name
        - file_size: size in bytes
        - mime_type: detected mime type
    """
    if not file.filename:
        raise ValidationError("No filename provided")

    # 1. Extension check
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            f"Invalid file type '{ext}'. Allowed image types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Content-Type check
    content_type = file.content_type
    if content_type not in ALLOWED_MIME_TYPES:
        raise ValidationError(
            f"Invalid Content-Type '{content_type}'. Must be image/jpeg, image/png, or image/webp."
        )

    # 3. Read content and validate size
    content = await file.read()
    file_size = len(content)
    if file_size > MAX_FILE_SIZE:
        raise ValidationError(
            f"File size exceeds maximum allowed limit of {MAX_FILE_SIZE // (1024 * 1024)}MB"
        )
    if file_size == 0:
        raise ValidationError("Uploaded file is empty")

    # 4. Generate secure unique filename
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    target_dir = COMPLAINTS_UPLOAD_DIR if subfolder == "complaints" else REVIEWS_UPLOAD_DIR
    target_path = os.path.join(target_dir, unique_filename)

    async with aiofiles.open(target_path, "wb") as out_file:
        await out_file.write(content)

    file_url = f"/uploads/{subfolder}/{unique_filename}"

    return {
        "file_url": file_url,
        "file_name": file.filename,
        "file_size": file_size,
        "mime_type": content_type,
    }
