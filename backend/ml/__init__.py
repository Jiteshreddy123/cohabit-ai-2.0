"""
ML package for CoHabit-AI.

Exports:
    generate_compatibility_matrix - Scorer: generates pairwise student compatibility scores
    allocate_rooms                - Allocator: runs OR-Tools CP-SAT optimizer
"""

from ml.scorer import generate_compatibility_matrix
from ml.allocator import allocate_rooms

__all__ = ["generate_compatibility_matrix", "allocate_rooms"]
