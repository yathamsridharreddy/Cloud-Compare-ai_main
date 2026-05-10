from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from schemas import CompareRequest, AiCompareRequest, ApiResponse
from services.metadata_service import get_service_types, get_default_service_type, get_regions
from services.grok_client import fetch_comparison_from_grok, fetch_ai_tools_comparison
from services.ranking_service import build_response
from services.ai_tools_service import get_popular_tools, get_categories, get_tools_by_category
from services.chat_service import chat as groq_chat

router = APIRouter()

# ── Health check ─────────────────────────────────────────────────────────────
@router.get("/test", response_model=ApiResponse)
async def health_check():
    return ApiResponse(success=True, data={"status": "ok", "message": "CloudCompare AI Engine is active."})

# ── Cloud compare (existing) ──────────────────────────────────────────────────
@router.post("/compare", response_model=ApiResponse)
async def compare(req: CompareRequest):
    category = req.category
    svc_type = req.serviceType if req.serviceType and req.serviceType != "all" else get_default_service_type(category)
    try:
        grok_results = await fetch_comparison_from_grok(category, svc_type, req.selected_services)
        
        # If they specifically selected services, we override the expected ALL_PROVIDERS logic in ranking_service
        # For now, ranking_service gracefully handles missing providers, but let's pass it down.
        response_data = build_response(
            grok_results=grok_results, category=category, service_type=svc_type,
            hours=req.hours, region=req.region, cpu=req.cpu,
            ram=req.ram, storage=req.storage, priority=req.priority,
            selected_services=req.selected_services
        )
        return ApiResponse(success=True, data=response_data)
    except Exception as e:
        error_msg = str(e)
        if "YOUR_GROQ_API_KEYS_HERE" in error_msg:
            error_msg = "AI Engine Configuration Missing."
        return ApiResponse(success=False, error=error_msg)

@router.get("/service-types/{category}", response_model=ApiResponse)
async def service_types(category: str):
    return ApiResponse(success=True, data=get_service_types(category))

@router.get("/regions", response_model=ApiResponse)
async def regions():
    return ApiResponse(success=True, data=get_regions())

@router.post("/ai-compare", response_model=ApiResponse)
async def compare_ai_tools(req: AiCompareRequest):
    try:
        grok_results = await fetch_ai_tools_comparison(req.purpose, req.selected_tools)
        grok_results.sort(key=lambda x: x.get("score", 0), reverse=True)
        for i, t in enumerate(grok_results):
            t["rank"] = i + 1
        return ApiResponse(success=True, data={"purpose": req.purpose, "selected_tools": req.selected_tools, "totalResults": len(grok_results), "tools": grok_results})
    except Exception as e:
        return ApiResponse(success=False, error=f"AI Analysis failed: {str(e)}")

# ── AI Tools endpoints (new) ──────────────────────────────────────────────────
@router.get("/ai-tools/popular", response_model=ApiResponse)
async def ai_tools_popular():
    return ApiResponse(success=True, data=get_popular_tools())

@router.get("/ai-tools/categories", response_model=ApiResponse)
async def ai_tools_categories():
    return ApiResponse(success=True, data=get_categories())

@router.get("/ai-tools/by-category/{category}", response_model=ApiResponse)
async def ai_tools_by_category(category: str):
    tools = get_tools_by_category(category)
    return ApiResponse(success=True, data=tools)

# ── Cloud popular services (new) ──────────────────────────────────────────────
@router.get("/cloud/popular", response_model=ApiResponse)
async def cloud_popular():
    services = [
        {"provider": "AWS",     "service": "EC2",              "category": "Compute",  "pricing": "$0.046/hr", "performance": 9.2, "popularity": 98, "regions": 32, "logo": "☁️",  "desc": "Industry-leading virtual machines with unlimited scale and 32 global regions."},
        {"provider": "Azure",   "service": "Virtual Machines", "category": "Compute",  "pricing": "$0.052/hr", "performance": 8.9, "popularity": 95, "regions": 60, "logo": "🔷", "desc": "Enterprise-grade VMs with seamless Active Directory and Office 365 integration."},
        {"provider": "GCP",     "service": "Compute Engine",   "category": "Compute",  "pricing": "$0.043/hr", "performance": 9.0, "popularity": 88, "regions": 40, "logo": "🌐", "desc": "Google-powered VMs running on the same infra as Gmail and YouTube."},
        {"provider": "OCI",     "service": "Compute",          "category": "Compute",  "pricing": "$0.025/hr", "performance": 9.4, "popularity": 72, "regions": 48, "logo": "🔴", "desc": "Highest bare-metal performance at the lowest price with always-free tier."},
        {"provider": "Alibaba", "service": "ECS",              "category": "Compute",  "pricing": "$0.031/hr", "performance": 8.5, "popularity": 76, "regions": 28, "logo": "🟠", "desc": "Dominant Asia-Pacific cloud with unmatched coverage across China and SEA."},
        {"provider": "AWS",     "service": "S3",               "category": "Storage",  "pricing": "$0.023/GB", "performance": 9.5, "popularity": 99, "regions": 32, "logo": "☁️",  "desc": "World's most popular object storage with 99.999999999% durability."},
        {"provider": "Azure",   "service": "Blob Storage",     "category": "Storage",  "pricing": "$0.018/GB", "performance": 9.0, "popularity": 92, "regions": 60, "logo": "🔷", "desc": "Massively scalable Azure storage with tiered pricing and geo-redundancy."},
        {"provider": "GCP",     "service": "Cloud Storage",    "category": "Storage",  "pricing": "$0.020/GB", "performance": 9.2, "popularity": 87, "regions": 40, "logo": "🌐", "desc": "Unified Google object storage with strong consistency and multi-region options."},
        {"provider": "AWS",     "service": "EKS",              "category": "Kubernetes","pricing": "$0.10/hr",  "performance": 9.1, "popularity": 95, "regions": 32, "logo": "☁️",  "desc": "Managed Kubernetes with deep AWS ecosystem integration and auto-scaling."},
        {"provider": "GCP",     "service": "GKE",              "category": "Kubernetes","pricing": "$0.10/hr",  "performance": 9.6, "popularity": 91, "regions": 40, "logo": "🌐", "desc": "Kubernetes invented by Google — the most mature managed K8s service."},
        {"provider": "Azure",   "service": "AKS",              "category": "Kubernetes","pricing": "Free mgmt", "performance": 8.8, "popularity": 89, "regions": 60, "logo": "🔷", "desc": "Free managed Kubernetes control plane with enterprise Active Directory auth."},
        {"provider": "AWS",     "service": "SageMaker",        "category": "AI/ML",    "pricing": "$0.065/hr", "performance": 9.3, "popularity": 94, "regions": 32, "logo": "☁️",  "desc": "End-to-end ML platform for training, deploying and monitoring AI models at scale."},
    ]
    return ApiResponse(success=True, data=services)

# ── Chatbot (new) ─────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    chat_type: str = "cloud"   # "cloud" | "ai_tools"
    history: Optional[List[dict]] = []

@router.post("/chat", response_model=ApiResponse)
async def chatbot(req: ChatRequest):
    try:
        reply = await groq_chat(req.message, req.chat_type, req.history)
        return ApiResponse(success=True, data={"reply": reply})
    except Exception as e:
        return ApiResponse(success=False, error=str(e))
