import os
import hashlib
import bcrypt as _bcrypt
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError

# --- Configuration ---

SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-key-change-in-production-min-32-chars-very-important-!!!")
if not os.getenv("JWT_SECRET"):
    print("⚠️  WARNING: JWT_SECRET not set. Using development default. Set JWT_SECRET env var for production.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day


# --- Password Hashing ---
# SHA-256 pre-hash produces a 64-char hex string — always within bcrypt's 72-byte limit.

def _prehash(password: str) -> bytes:
    """Return SHA-256 hex digest of password as UTF-8 bytes (64 bytes, under bcrypt's 72-byte cap)."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest().encode("utf-8")

def get_password_hash(password: str) -> str:
    hashed = _bcrypt.hashpw(_prehash(password), _bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _bcrypt.checkpw(_prehash(plain_password), hashed_password.encode("utf-8"))


# --- JWT Tokens ---

def create_access_token(data: dict) -> str:
    if "sub" not in data:
        raise ValueError("Token payload must include a 'sub' claim.")
    
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    """
    Decodes and validates a JWT.
    Raises ValueError if the token is invalid or expired.
    Use this in your FastAPI dependency to protect routes.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise ValueError("Token is missing 'sub' claim.")
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid or expired token: {e}")
