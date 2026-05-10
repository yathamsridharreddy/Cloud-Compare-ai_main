from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=8)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: dict

class CompareRequest(BaseModel):
    category: str
    serviceType: str = "all"
    hours: int = 730
    region: str = "global"
    cpu: int = 0
    ram: int = 0
    storage: int = 0
    priority: str = "balanced"
    selected_services: Optional[List[str]] = None

class AiCompareRequest(BaseModel):
    purpose: Optional[str] = None
    selected_tools: Optional[List[str]] = None

class ServiceResult(BaseModel):
    id: int
    platform: str
    serviceName: str
    category: str
    cpu: int
    ram: int
    storage: int
    pricePerHour: float
    pricePerGb: float
    performanceScore: float
    popularityScore: float
    region: str
    description: str
    cost: float = 0.0
    costPerHour: float = 0.0
    costPerDay: float = 0.0
    costPerWeek: float = 0.0
    costPerMonth: float = 0.0
    score: float = 0.0
    rank: int = 0
    performanceLevel: str = ""
    costScore: float = 0.0
    reason: Optional[str] = None

class ProviderStat(BaseModel):
    provider: str
    avgCost: float
    avgPerformance: float
    serviceCount: int

class CompareResponse(BaseModel):
    category: str
    filters: dict
    totalResults: int
    services: List[ServiceResult]
    providerStats: List[ProviderStat]
    recommendation: Optional[ServiceResult] = None

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
