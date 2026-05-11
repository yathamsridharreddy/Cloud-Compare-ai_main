PROVIDER_META = {
    "AWS": {"logo": "AWS", "color": "#ff9900"},
    "Azure": {"logo": "AZ", "color": "#0078d4"},
    "GCP": {"logo": "GCP", "color": "#4285f4"},
    "OCI": {"logo": "OCI", "color": "#f80000"},
    "Alibaba": {"logo": "ALI", "color": "#ff6a00"},
}

CATEGORY_ICONS = {
    "Compute": "🖥️",
    "Storage": "🗄️",
    "Database": "🛢️",
    "Kubernetes": "☸️",
    "Networking": "🌐",
    "AI/ML": "🧠",
    "Serverless": "⚡",
}

CLOUD_SERVICES = [
    {"provider": "AWS", "service": "EC2", "category": "Compute", "pricing": "$0.046/hr", "price_per_hour": 0.046, "performance": 9.2, "popularity": 98, "regions": 32, "regionTags": ["US", "EU", "APAC"], "icon": "🖥️", "desc": "Elastic Compute Cloud virtual machines with broad instance families and mature autoscaling."},
    {"provider": "Azure", "service": "Virtual Machines", "category": "Compute", "pricing": "$0.052/hr", "price_per_hour": 0.052, "performance": 8.9, "popularity": 95, "regions": 60, "regionTags": ["US", "EU", "Asia"], "icon": "🖥️", "desc": "Enterprise VMs with strong Windows, Active Directory, and hybrid cloud integration."},
    {"provider": "GCP", "service": "Compute Engine", "category": "Compute", "pricing": "$0.043/hr", "price_per_hour": 0.043, "performance": 9.0, "popularity": 88, "regions": 40, "regionTags": ["Global"], "icon": "🖥️", "desc": "Flexible Google Cloud VMs with custom machine types and strong sustained-use pricing."},
    {"provider": "OCI", "service": "Compute", "category": "Compute", "pricing": "$0.025/hr", "price_per_hour": 0.025, "performance": 9.4, "popularity": 72, "regions": 48, "regionTags": ["US", "EU", "Asia"], "icon": "🖥️", "desc": "High-performance virtual machines and bare metal instances with aggressive pricing."},
    {"provider": "Alibaba", "service": "ECS", "category": "Compute", "pricing": "$0.031/hr", "price_per_hour": 0.031, "performance": 8.5, "popularity": 76, "regions": 28, "regionTags": ["Asia", "EU"], "icon": "🖥️", "desc": "Elastic Compute Service for Asia-Pacific workloads, especially China and Southeast Asia."},

    {"provider": "AWS", "service": "Lambda", "category": "Serverless", "pricing": "$0.20/1M req", "price_per_hour": 0.0, "performance": 9.2, "popularity": 97, "regions": 32, "regionTags": ["Global"], "icon": "⚡", "desc": "Event-driven functions with deep AWS integrations and broad runtime support."},
    {"provider": "Azure", "service": "Functions", "category": "Serverless", "pricing": "$0.20/1M req", "price_per_hour": 0.0, "performance": 8.8, "popularity": 89, "regions": 60, "regionTags": ["Global"], "icon": "⚡", "desc": "Serverless functions for event workloads with strong Microsoft ecosystem support."},
    {"provider": "GCP", "service": "Cloud Functions", "category": "Serverless", "pricing": "$0.40/1M req", "price_per_hour": 0.0, "performance": 8.7, "popularity": 84, "regions": 40, "regionTags": ["Global"], "icon": "⚡", "desc": "Lightweight Google Cloud functions for events, APIs, and background processing."},

    {"provider": "AWS", "service": "S3", "category": "Storage", "pricing": "$0.023/GB", "price_per_gb": 0.023, "performance": 9.5, "popularity": 99, "regions": 32, "regionTags": ["Global"], "icon": "🗄️", "desc": "The reference object storage service with extreme durability and ecosystem support."},
    {"provider": "Azure", "service": "Blob Storage", "category": "Storage", "pricing": "$0.018/GB", "price_per_gb": 0.018, "performance": 9.0, "popularity": 92, "regions": 60, "regionTags": ["Global"], "icon": "🗄️", "desc": "Scalable object storage with hot, cool, archive, and geo-redundant tiers."},
    {"provider": "GCP", "service": "Cloud Storage", "category": "Storage", "pricing": "$0.020/GB", "price_per_gb": 0.020, "performance": 9.2, "popularity": 87, "regions": 40, "regionTags": ["Global"], "icon": "🗄️", "desc": "Strongly consistent object storage with multi-region and analytics-friendly options."},
    {"provider": "OCI", "service": "Object Storage", "category": "Storage", "pricing": "$0.0255/GB", "price_per_gb": 0.0255, "performance": 8.7, "popularity": 70, "regions": 48, "regionTags": ["US", "EU", "Asia"], "icon": "🗄️", "desc": "Durable object storage tuned for OCI workloads and enterprise backup use cases."},
    {"provider": "Alibaba", "service": "OSS", "category": "Storage", "pricing": "$0.017/GB", "price_per_gb": 0.017, "performance": 8.4, "popularity": 74, "regions": 28, "regionTags": ["Asia", "EU"], "icon": "🗄️", "desc": "Object Storage Service for massive unstructured data across Alibaba Cloud regions."},

    {"provider": "AWS", "service": "RDS", "category": "Database", "pricing": "$0.017/hr", "price_per_hour": 0.017, "performance": 9.1, "popularity": 96, "regions": 32, "regionTags": ["Global"], "icon": "🛢️", "desc": "Managed relational databases for PostgreSQL, MySQL, MariaDB, Oracle, and SQL Server."},
    {"provider": "Azure", "service": "Azure SQL", "category": "Database", "pricing": "$0.021/hr", "price_per_hour": 0.021, "performance": 8.9, "popularity": 92, "regions": 60, "regionTags": ["Global"], "icon": "🛢️", "desc": "Managed SQL database platform with strong governance and Microsoft tooling."},
    {"provider": "GCP", "service": "Cloud SQL", "category": "Database", "pricing": "$0.018/hr", "price_per_hour": 0.018, "performance": 8.8, "popularity": 86, "regions": 40, "regionTags": ["Global"], "icon": "🛢️", "desc": "Managed MySQL, PostgreSQL, and SQL Server with simple operations on Google Cloud."},
    {"provider": "AWS", "service": "DynamoDB", "category": "Database", "pricing": "$1.25/M writes", "price_per_hour": 0.0, "performance": 9.4, "popularity": 93, "regions": 32, "regionTags": ["Global"], "icon": "🛢️", "desc": "Serverless key-value and document database for very high-scale applications."},

    {"provider": "AWS", "service": "EKS", "category": "Kubernetes", "pricing": "$0.10/hr", "price_per_hour": 0.10, "performance": 9.1, "popularity": 95, "regions": 32, "regionTags": ["Global"], "icon": "☸️", "desc": "Managed Kubernetes with deep AWS networking, IAM, and autoscaling integration."},
    {"provider": "Azure", "service": "AKS", "category": "Kubernetes", "pricing": "Free mgmt", "price_per_hour": 0.0, "performance": 8.8, "popularity": 89, "regions": 60, "regionTags": ["Global"], "icon": "☸️", "desc": "Managed Kubernetes with Microsoft identity, policy, and DevOps integrations."},
    {"provider": "GCP", "service": "GKE", "category": "Kubernetes", "pricing": "$0.10/hr", "price_per_hour": 0.10, "performance": 9.6, "popularity": 91, "regions": 40, "regionTags": ["Global"], "icon": "☸️", "desc": "Highly mature managed Kubernetes from the original Kubernetes creators."},
    {"provider": "OCI", "service": "OKE", "category": "Kubernetes", "pricing": "Free mgmt", "price_per_hour": 0.0, "performance": 8.5, "popularity": 68, "regions": 48, "regionTags": ["US", "EU", "Asia"], "icon": "☸️", "desc": "Managed Kubernetes on OCI compute and networking with competitive pricing."},

    {"provider": "AWS", "service": "VPC", "category": "Networking", "pricing": "Usage based", "price_per_hour": 0.0, "performance": 9.0, "popularity": 98, "regions": 32, "regionTags": ["Global"], "icon": "🌐", "desc": "Foundational virtual networking for subnets, routing, gateways, and private access."},
    {"provider": "Azure", "service": "Virtual Network", "category": "Networking", "pricing": "Usage based", "price_per_hour": 0.0, "performance": 8.9, "popularity": 94, "regions": 60, "regionTags": ["Global"], "icon": "🌐", "desc": "Azure network isolation, peering, private endpoints, and hybrid connectivity."},
    {"provider": "GCP", "service": "VPC Network", "category": "Networking", "pricing": "Usage based", "price_per_hour": 0.0, "performance": 9.1, "popularity": 86, "regions": 40, "regionTags": ["Global"], "icon": "🌐", "desc": "Global VPC design with strong load balancing and private service connectivity."},

    {"provider": "AWS", "service": "SageMaker", "category": "AI/ML", "pricing": "$0.065/hr", "price_per_hour": 0.065, "performance": 9.3, "popularity": 94, "regions": 32, "regionTags": ["Global"], "icon": "🧠", "desc": "End-to-end ML platform for training, deployment, MLOps, and model monitoring."},
    {"provider": "Azure", "service": "Azure AI Foundry", "category": "AI/ML", "pricing": "Usage based", "price_per_hour": 0.0, "performance": 9.0, "popularity": 90, "regions": 60, "regionTags": ["Global"], "icon": "🧠", "desc": "Microsoft platform for building and managing enterprise AI apps and models."},
    {"provider": "GCP", "service": "Vertex AI", "category": "AI/ML", "pricing": "Usage based", "price_per_hour": 0.0, "performance": 9.4, "popularity": 89, "regions": 40, "regionTags": ["Global"], "icon": "🧠", "desc": "Google's unified ML and generative AI platform with strong model operations."},
    {"provider": "OCI", "service": "OCI Data Science", "category": "AI/ML", "pricing": "Usage based", "price_per_hour": 0.0, "performance": 8.3, "popularity": 63, "regions": 48, "regionTags": ["US", "EU", "Asia"], "icon": "🧠", "desc": "Notebook-based data science and model deployment inside Oracle Cloud."},
]


def _normalize(value: str) -> str:
    return (value or "").lower().replace(" ", "").replace("-", "")


def with_provider_meta(service: dict) -> dict:
    provider_meta = PROVIDER_META.get(service["provider"], {})
    enriched = dict(service)
    enriched["logo"] = provider_meta.get("logo", service["provider"][:3].upper())
    enriched["providerColor"] = provider_meta.get("color", "#38bdf8")
    enriched["categoryIcon"] = CATEGORY_ICONS.get(service.get("category"), "☁️")
    return enriched


def get_cloud_services() -> list:
    return [with_provider_meta(service) for service in CLOUD_SERVICES]


def find_cloud_service(provider: str, service_name: str = "") -> dict | None:
    provider_key = _normalize(provider)
    service_key = _normalize(service_name)
    for service in CLOUD_SERVICES:
        if _normalize(service["provider"]) != provider_key:
            continue
        if not service_key or service_key in _normalize(service["service"]) or _normalize(service["service"]) in service_key:
            return with_provider_meta(service)
    return None
