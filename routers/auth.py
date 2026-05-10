import re
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import SignupRequest, LoginRequest, ApiResponse, TokenResponse
from services.auth_service import get_password_hash, verify_password, create_access_token

logger = logging.getLogger(__name__)
router = APIRouter()

# Matches the frontend symbol check: !@#$%^&*(),.?":{}|<>
PASSWORD_PATTERN = re.compile(
    r"^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?\":{}|<>\[\]\\\/\-_+=~`';])(?=\S+$).{8,}$"
)

@router.post("/signup", response_model=ApiResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    try:
        # Check existing user
        existing_user = db.query(User).filter(User.email == req.email).first()
        if existing_user:
            return ApiResponse(success=False, error="An account with this email already exists. Please log in.")

        # Validate password complexity
        if not PASSWORD_PATTERN.match(req.password):
            return ApiResponse(success=False, error="Password must be at least 8 characters and include a letter, number, and symbol.")

        # Create user
        new_user = User(
            name=req.name,
            email=req.email,
            password=get_password_hash(req.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Generate token
        token = create_access_token({"sub": new_user.email})
        return ApiResponse(
            success=True,
            data=TokenResponse(
                token=token,
                user={"id": new_user.id, "name": new_user.name, "email": new_user.email}
            ).dict()
        )
    except Exception as e:
        logger.error(f"Signup error: {e}")
        db.rollback()
        return ApiResponse(success=False, error=f"Signup failed: {str(e)}")

@router.post("/login", response_model=ApiResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == req.email).first()
        if not user or not verify_password(req.password, user.password):
            return ApiResponse(success=False, error="Invalid email or password. Please try again.")

        token = create_access_token({"sub": user.email})
        return ApiResponse(
            success=True,
            data=TokenResponse(
                token=token,
                user={"id": user.id, "name": user.name, "email": user.email}
            ).dict()
        )
    except Exception as e:
        logger.error(f"Login error: {e}")
        return ApiResponse(success=False, error=f"Login failed: {str(e)}")

@router.post("/forgot-password", response_model=ApiResponse)
def forgot_password(db: Session = Depends(get_db)):
    # Placeholder - returns success to avoid leaking user existence
    return ApiResponse(success=True, data={"message": "If this email exists, a reset link will be sent."})
