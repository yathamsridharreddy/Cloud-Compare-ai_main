import os
import hashlib
from datetime import datetime, timedelta, timezone

# pyrefly: ignore [missing-import]
from passlib.context import CryptContext
from jose import jwt, JWTError

# --- Configuration ---

SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET environment variable is not set. Add it to your .env or Render config.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- Password Hashing ---

def _prehash(password: str) -> str:
    """
    Pre-hash with SHA-256 before passing to bcrypt.
    Guarantees output is always a 64-char hex string,
    safely under bcrypt's 72-byte hard limit.
    """
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_prehash(plain_password), hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(_prehash(password))


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
