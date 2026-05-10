import re
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import SignupRequest, LoginRequest, ApiResponse, TokenResponse
from services.auth_service import get_password_hash, verify_password, create_access_token

router = APIRouter()

PASSWORD_PATTERN = re.compile(r"^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$")

@router.post("/signup", response_model=ApiResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        return ApiResponse(success=False, error="Oops! You already have an account.\nSign in to continue.")
        
    if not PASSWORD_PATTERN.match(req.password):
        return ApiResponse(success=False, error="SECURITY ALERT: Password does not meet the vault-grade complexity requirements.")
        
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

@router.post("/login", response_model=ApiResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password):
        return ApiResponse(success=False, error="Invalid email or password")
        
    token = create_access_token({"sub": user.email})
    return ApiResponse(
        success=True,
        data=TokenResponse(
            token=token,
            user={"id": user.id, "name": user.name, "email": user.email}
        ).dict()
    )
