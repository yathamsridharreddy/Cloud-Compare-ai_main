from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from schemas import CompareRequest, AiCompareRequest, ApiResponse
from services.metadata_service import get_service_types, get_default_service_type, get_regions
from services.grok_client import fetch_comparison_from_grok, fetch_ai_tools_comparison
from services.ranking_service import build_response

router = APIRouter()

@router.get("/test", response_model=ApiResponse)
async def health_check():
    return ApiResponse(
        success=True,
        data={
            "status": "ok",
            "message": "CloudCompare AI Engine is active (FastAPI)."
        }
    )

@router.post("/compare", response_model=ApiResponse)
async def compare(req: CompareRequest):
    category = req.category
    svc_type = req.serviceType if req.serviceType and req.serviceType != "all" else get_default_service_type(category)
    
    try:
        grok_results = await fetch_comparison_from_grok(category, svc_type)
        response_data = build_response(
            grok_results=grok_results,
            category=category,
            service_type=svc_type,
            hours=req.hours,
            region=req.region,
            cpu=req.cpu,
            ram=req.ram,
            storage=req.storage,
            priority=req.priority
        )
        return ApiResponse(success=True, data=response_data)
    except Exception as e:
        error_msg = str(e)
        if "YOUR_GROQ_API_KEYS_HERE" in error_msg:
            error_msg = "AI Engine Configuration Missing. Please set the GROK_API_KEYS environment variable to enable live analysis."
        return ApiResponse(success=False, error=error_msg)

@router.get("/service-types/{category}", response_model=ApiResponse)
async def service_types(category: str):
    return ApiResponse(success=True, data=get_service_types(category))

@router.get("/regions", response_model=ApiResponse)
async def regions():
    return ApiResponse(success=True, data=get_regions())

@router.post("/ai-compare", response_model=ApiResponse)
async def compare_ai_tools(req: AiCompareRequest):
    purpose = req.purpose
    try:
        grok_results = await fetch_ai_tools_comparison(purpose)
        
        # Sort by score descending and assign rank
        grok_results.sort(key=lambda x: x.get("score", 0), reverse=True)
        for i, tool in enumerate(grok_results):
            tool["rank"] = i + 1
            
        return ApiResponse(success=True, data={
            "purpose": purpose,
            "totalResults": len(grok_results),
            "tools": grok_results
        })
    except Exception as e:
        return ApiResponse(success=False, error=f"AI Analysis failed: {str(e)}")
