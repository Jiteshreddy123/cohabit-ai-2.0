class AppError(Exception):
    """Base application exception."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class DuplicateError(AppError):
    """Exception raised when a resource duplication is attempted (e.g. unique constraints)."""
    def __init__(self, message: str):
        super().__init__(message, status_code=409)

class NotFoundError(AppError):
    """Exception raised when a requested resource is not found."""
    def __init__(self, message: str):
        super().__init__(message, status_code=404)

class ValidationError(AppError):
    """Exception raised when custom input validation fails."""
    def __init__(self, message: str):
        super().__init__(message, status_code=422)

class AuthenticationError(AppError):
    """Exception raised when authentication fails."""
    def __init__(self, message: str):
        super().__init__(message, status_code=401)
