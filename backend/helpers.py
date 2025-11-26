import hashlib
from datetime import date
from dateutil import parser

def verify_password(stored_password, input_password):
    if len(stored_password) == 64 and all(c in "0123456789abcdef" for c in stored_password.lower()):
        return hashlib.sha256(input_password.encode()).hexdigest() == stored_password
    return stored_password == input_password


def parse_date_flexible(date_str):
    if not date_str:
        return date.today()
    try:
        return parser.parse(date_str).date()
    except Exception:
        return date.today()
