def get_service_types(category: str) -> list:
    services = {
        "compute": [
            {"id": "vm", "name": "Virtual Machines", "description": "General purpose compute instances"},
            {"id": "kubernetes", "name": "Managed Kubernetes", "description": "Container orchestration"},
            {"id": "serverless", "name": "Serverless Functions", "description": "Event-driven compute"}
        ],
        "storage": [
            {"id": "object", "name": "Object Storage", "description": "Scalable unstructured data storage"},
            {"id": "block", "name": "Block Storage", "description": "High-performance disk storage"},
            {"id": "file", "name": "File Storage", "description": "Managed file systems"}
        ],
        "database": [
            {"id": "relational", "name": "Relational (SQL)", "description": "Managed SQL databases"},
            {"id": "nosql", "name": "NoSQL", "description": "Document and key-value stores"},
            {"id": "warehouse", "name": "Data Warehouse", "description": "Analytics databases"}
        ],
        "ai": [
            {"id": "llm", "name": "Large Language Models", "description": "Text generation and processing"},
            {"id": "vision", "name": "Computer Vision", "description": "Image analysis and OCR"},
            {"id": "ml", "name": "ML Platforms", "description": "End-to-end ML training and deployment"}
        ]
    }
    return services.get(category, [])

def get_default_service_type(category: str) -> str:
    defaults = {
        "compute": "vm",
        "storage": "object",
        "database": "relational",
        "ai": "llm"
    }
    return defaults.get(category, "all")

def get_regions() -> list:
    return [
        {"id": "us-east", "name": "US East (N. Virginia)", "continent": "North America"},
        {"id": "us-west", "name": "US West (Oregon)", "continent": "North America"},
        {"id": "eu-west", "name": "Europe (Ireland)", "continent": "Europe"},
        {"id": "eu-central", "name": "Europe (Frankfurt)", "continent": "Europe"},
        {"id": "ap-southeast", "name": "Asia Pacific (Singapore)", "continent": "Asia"}
    ]
