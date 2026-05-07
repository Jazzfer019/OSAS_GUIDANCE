import hashlib
from datetime import date
from dateutil import parser


# -------------------------
# PASSWORD VERIFICATION
# -------------------------
def verify_password(stored_password, input_password):
    """
    Supports both:
    - SHA256 hashed passwords (64 hex chars)
    - Plain text passwords (fallback for legacy data)
    """

    if not stored_password:
        return False

    stored_password = str(stored_password).strip()
    input_password = str(input_password).strip()

    # Detect SHA256 hash (64 hex chars)
    is_sha256 = (
        len(stored_password) == 64 and
        all(c in "0123456789abcdef" for c in stored_password.lower())
    )

    if is_sha256:
        hashed_input = hashlib.sha256(input_password.encode()).hexdigest()
        return hashed_input == stored_password

    # fallback: plain text comparison
    return stored_password == input_password


# -------------------------
# DATE PARSER (SAFE)
# -------------------------
def parse_date_flexible(date_str):
    """
    Converts string to date safely.
    Falls back to today() if invalid.
    """
    if not date_str:
        return date.today()

    try:
        return parser.parse(date_str).date()
    except Exception:
        return date.today()