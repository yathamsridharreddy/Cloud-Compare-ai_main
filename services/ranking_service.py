from typing import List, Dict, Any

HOURS_IN_MONTH = 730
HOURS_IN_DAY = 24
DAYS_IN_WEEK = 7

ALL_PROVIDERS = ["AWS", "GCP", "Azure", "OCI", "Alibaba"]
REGION_DEFAULTS = {
    "AWS": "us-east-1",
    "GCP": "us-central1",
    "Azure": "eastus",
    "OCI": "us-ashburn-1",
    "Alibaba": "ap-southeast-1"
}

def determine_weights(priority: str):
    if priority == "cost":
        return 0.20, 0.15, 0.65
    elif priority == "performance":
        return 0.55, 0.20, 0.25
    return 0.40, 0.25, 0.35  # balanced

def get_performance_level(score: float) -> str:
    if score >= 9: return "High"
    if score >= 7.5: return "Medium"
    return "Low"

def get_recommendation_reason(category: str, level: str) -> str:
    reasons = {
        "compute": f"Best performance-to-cost ratio with {level.lower()} performance and excellent scalability",
        "storage": f"Optimal storage solution with {level.lower()} durability and competitive pricing",
        "database": f"Recommended for production workloads with excellent reliability and managed features",
        "ai": f"Top-rated AI service with {level.lower()} accuracy and strong ecosystem"
    }
    return reasons.get(category, "Best overall value for your requirements")

def safe_float(val: Any) -> float:
    if val is None: return 0.0
    try:
        return float(val)
    except:
        return 0.0

def safe_int(val: Any) -> int:
    if val is None: return 0
    try:
        return int(float(val))
    except:
        return 0

def build_response(grok_results: List[Dict[str, Any]], category: str, service_type: str,
                   hours: int, region: str, cpu: int, ram: int, storage: int, priority: str):
    merged = {}

    for g in grok_results:
        provider = g.get("provider", "Unknown")
        # Use snake_case keys to match the existing frontend (script.js)
        merged[provider] = {
            "id": 0,
            "platform": provider,
            "service_name": g.get("service_name", f"{provider} {service_type}"),
            "category": category,
            "cpu": safe_int(g.get("cpu")),
            "ram": safe_int(g.get("ram")),
            "storage": safe_int(g.get("storage")),
            "price_per_hour": safe_float(g.get("price_per_hour")),
            "price_per_gb": safe_float(g.get("price_per_gb")),
            "performance_score": safe_float(g.get("performance_score")) or 7.0,
            "popularity_score": safe_float(g.get("popularity_score")) or 7.0,
            "region": g.get("region", REGION_DEFAULTS.get(provider, "global")),
            "description": g.get("description", service_type)
        }

    for prov in ALL_PROVIDERS:
        if prov not in merged:
            merged[prov] = {
                "id": 0, "platform": prov, "service_name": f"{prov} {service_type}", "category": category,
                "cpu": 0, "ram": 0, "storage": 0, "price_per_hour": 0.0, "price_per_gb": 0.0,
                "performance_score": 5.0, "popularity_score": 5.0, "region": REGION_DEFAULTS.get(prov, "global"),
                "description": f"{service_type} (data pending)"
            }

    results = list(merged.values())

    perf_w, pop_w, cost_w = determine_weights(priority)

    cost_values = []
    for r in results:
        if category == "storage":
            cost_values.append(r["price_per_gb"] * (storage if storage > 0 else 1000))
        else:
            cost_values.append(r["price_per_hour"] * (hours if hours > 0 else 1))

    cost_min = min(cost_values) if cost_values else 0
    cost_max = max(cost_values) if cost_values else 0

    processed = []
    for s in results:
        cost_val = 0.0
        cost_per_hour = 0.0
        if category == "storage":
            msc = s["price_per_gb"] * (storage if storage > 0 else 1000)
            cost_per_hour = msc / HOURS_IN_MONTH
            cost_val = cost_per_hour * (hours if hours > 0 else HOURS_IN_MONTH)
        else:
            cost_per_hour = s["price_per_hour"]
            cost_val = cost_per_hour * (hours if hours > 0 else HOURS_IN_MONTH)

        cost_per_day = cost_per_hour * HOURS_IN_DAY
        cost_per_week = cost_per_day * DAYS_IN_WEEK
        cost_per_month = cost_per_hour * HOURS_IN_MONTH

        perf_norm = s["performance_score"] if s["performance_score"] > 0 else 5.0
        pop_norm = s["popularity_score"] if s["popularity_score"] > 0 else 5.0

        cost_score = 5.0
        if cost_max > cost_min and cost_val > 0:
            cost_score = 10 * (1 - (cost_val - cost_min) / (cost_max - cost_min))
        elif cost_val == cost_min and cost_val > 0:
            cost_score = 10.0

        score = (perf_norm * perf_w) + (pop_norm * pop_w) + (cost_score * cost_w)

        s["cost"] = round(cost_val, 2)
        s["cost_per_hour"] = round(cost_per_hour, 4)
        s["cost_per_day"] = round(cost_per_day, 2)
        s["cost_per_week"] = round(cost_per_week, 2)
        s["cost_per_month"] = round(cost_per_month, 2)
        s["score"] = round(score, 2)
        s["performance_level"] = get_performance_level(s["performance_score"])
        s["cost_score"] = round(cost_score, 2)
        # camelCase aliases for frontend compatibility
        s["performanceLevel"] = s["performance_level"]
        s["costPerHour"] = s["cost_per_hour"]
        s["costPerDay"] = s["cost_per_day"]
        s["costPerWeek"] = s["cost_per_week"]
        s["costPerMonth"] = s["cost_per_month"]

        processed.append(s)

    processed.sort(key=lambda x: x["score"], reverse=True)

    for i, s in enumerate(processed):
        s["rank"] = i + 1

    prov_map = {}
    for s in processed:
        p = s["platform"]
        if p not in prov_map:
            prov_map[p] = [0.0, 0.0, 0]
        prov_map[p][0] += s["cost"]
        prov_map[p][1] += s["performance_score"]
        prov_map[p][2] += 1

    provider_stats = [
        {
            "provider": k,
            "avgCost": round(v[0]/v[2], 2) if v[2] > 0 else 0,
            "avgPerformance": round(v[1]/v[2], 1) if v[2] > 0 else 0,
            "serviceCount": v[2]
        }
        for k, v in prov_map.items()
    ]

    recommendation = dict(processed[0]) if processed else None
    if recommendation:
        recommendation["reason"] = get_recommendation_reason(category, recommendation["performance_level"])

    return {
        "category": category,
        "filters": {
            "hours": hours,
            "region": region if region else "all",
            "cpu": 0,
            "ram": 0,
            "storage": storage if storage > 0 else 0
        },
        "totalResults": len(processed),
        "services": processed,
        "providerStats": provider_stats,
        "recommendation": recommendation
    }
