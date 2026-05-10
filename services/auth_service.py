import os
# pyrefly: ignore [missing-import]
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = os.getenv("JWT_SECRET", "my-super-secret-key-that-is-at-least-32-bytes-long")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

import hashlib

def _prehash(password: str) -> str:
    # Pre-hashing with SHA-256 gives a 64-character hex string.
    # This solves the bcrypt 72-byte limit safely while preserving entropy.
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(_prehash(plain_password), hashed_password)

def get_password_hash(password):
    return pwd_context.hash(_prehash(password))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
