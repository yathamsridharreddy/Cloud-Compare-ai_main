import os
import httpx
import json
import logging
from tenacity import retry, wait_fixed, stop_after_attempt, retry_if_exception_type

logger = logging.getLogger(__name__)

GROK_API_KEYS = os.getenv("GROK_API_KEYS", "")
GROK_ENDPOINT = os.getenv("GROK_ENDPOINT", "https://api.groq.com/openai/v1/chat/completions")
GROK_MODEL = os.getenv("GROK_MODEL", "llama-3.1-8b-instant")
GROK_TIMEOUT = int(os.getenv("GROK_TIMEOUT", "20000")) / 1000.0

key_index = 0

def get_api_keys():
    if not GROK_API_KEYS:
        return []
    return [k.strip() for k in GROK_API_KEYS.split(",") if k.strip()]

def get_next_api_key():
    global key_index
    keys = get_api_keys()
    if not keys:
        return "YOUR_GROQ_API_KEYS_HERE"
    
    key = keys[key_index % len(keys)]
    key_index += 1
    return key

def extract_json(raw_text: str) -> str:
    start_bracket = raw_text.find('[')
    start_brace = raw_text.find('{')
    
    start = -1
    if start_bracket != -1 and (start_brace == -1 or start_bracket < start_brace):
        start = start_bracket
    elif start_brace != -1:
        start = start_brace
        
    if start == -1:
        return raw_text

    end_bracket = raw_text.rfind(']')
    end_brace = raw_text.rfind('}')
    end = max(end_bracket, end_brace)
    
    if end == -1 or end <= start:
        return raw_text
        
    return raw_text[start:end+1]

def get_mock_comparison(service_type: str):
    return [
        {"provider": "AWS", "service_name": f"AWS {service_type}", "performance_score": 8, "popularity_score": 9, "price_per_hour": 0.05, "price_per_gb": 0.02, "cpu": 2, "ram": 4, "storage": 20, "region": "us-east-1", "description": "Mock AWS"},
        {"provider": "GCP", "service_name": f"GCP {service_type}", "performance_score": 8.5, "popularity_score": 8, "price_per_hour": 0.045, "price_per_gb": 0.015, "cpu": 2, "ram": 4, "storage": 20, "region": "us-central1", "description": "Mock GCP"},
        {"provider": "Azure", "service_name": f"Azure {service_type}", "performance_score": 7.5, "popularity_score": 8.5, "price_per_hour": 0.055, "price_per_gb": 0.022, "cpu": 2, "ram": 4, "storage": 20, "region": "eastus", "description": "Mock Azure"},
        {"provider": "OCI", "service_name": f"OCI {service_type}", "performance_score": 9, "popularity_score": 5, "price_per_hour": 0.03, "price_per_gb": 0.01, "cpu": 2, "ram": 4, "storage": 20, "region": "us-ashburn-1", "description": "Mock OCI"},
        {"provider": "Alibaba", "service_name": f"Alibaba {service_type}", "performance_score": 7, "popularity_score": 6, "price_per_hour": 0.035, "price_per_gb": 0.018, "cpu": 2, "ram": 4, "storage": 20, "region": "ap-southeast-1", "description": "Mock Alibaba"}
    ]

def get_mock_ai_tools():
    return [
        {"tool_name": "ChatGPT", "provider": "OpenAI", "model_number": "GPT-4", "score": 9.5, "pricing": "$20/mo", "description": "Leading conversational AI"},
        {"tool_name": "Claude", "provider": "Anthropic", "model_number": "Claude 3 Opus", "score": 9.3, "pricing": "$20/mo", "description": "Advanced reasoning AI"},
        {"tool_name": "Gemini", "provider": "Google", "model_number": "Gemini Ultra", "score": 9.0, "pricing": "$20/mo", "description": "Multimodal AI"},
        {"tool_name": "Llama 3", "provider": "Meta", "model_number": "70B", "score": 8.8, "pricing": "Open Source", "description": "Top open-source model"},
        {"tool_name": "Mistral Large", "provider": "Mistral AI", "model_number": "Large", "score": 8.5, "pricing": "Pay-per-token", "description": "Efficient European AI"}
    ]

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2), retry=retry_if_exception_type(Exception))
async def call_groq_api(prompt: str) -> str:
    api_key = get_next_api_key()
    if api_key == "YOUR_GROQ_API_KEYS_HERE" or not api_key:
        raise ValueError("Mock fallback triggered due to missing API key")

    payload = {
        "model": GROK_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens": 2000
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=GROK_TIMEOUT) as client:
        response = await client.post(GROK_ENDPOINT, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

async def fetch_comparison_from_grok(category: str, service_type: str) -> list:
    try:
        prompt = (f"You are an expert cloud infrastructure analyst. Compare the \"{service_type}\" "
                  f"services offered by AWS, Google Cloud (GCP), Microsoft Azure, Oracle Cloud (OCI), and Alibaba Cloud under the \"{category}\" category.\n\n"
                  "Return a JSON array with EXACTLY 5 objects (one per provider). Each object must have:\n"
                  "{\n"
                  "  \"provider\": \"<AWS|GCP|Azure|OCI|Alibaba>\",\n"
                  "  \"service_name\": \"<official product name>\",\n"
                  "  \"performance_score\": <1-10 numerical value>,\n"
                  "  \"popularity_score\": <1-10 numerical value>,\n"
                  "  \"price_per_hour\": <RAW NUMBER ONLY, e.g. 0.045, no symbols>,\n"
                  "  \"price_per_gb\": <RAW NUMBER ONLY, e.g. 0.02, no symbols>,\n"
                  "  \"cpu\": <RAW NUMBER ONLY, number of vCPUs>,\n"
                  "  \"ram\": <RAW NUMBER ONLY, GB of RAM>,\n"
                  "  \"storage\": <RAW NUMBER ONLY, GB of storage>,\n"
                  "  \"region\": \"<code-e.g.-us-east-1>\",\n"
                  "  \"description\": \"<text>\"\n"
                  "}\n\n"
                  "IMPORTANT: Return ONLY raw numbers for cost, cpu, ram, and scores. Do NOT include currency symbols or units in the values.\n"
                  "Output ONLY the raw JSON array.")
        
        raw = await call_groq_api(prompt)
        cleaned = extract_json(raw)
        return json.loads(cleaned)
    except Exception as e:
        logger.warning(f"Groq API failed. Falling back to mock data. Error: {e}")
        return get_mock_comparison(service_type)

async def fetch_ai_tools_comparison(purpose: str) -> list:
    try:
        prompt = (f"Recommend top 5 AI tools for: \"{purpose}\".\n\n"
                  "Return a JSON array with EXACTLY 5 objects:\n"
                  "{\n"
                  "  \"tool_name\": \"<name>\",\n"
                  "  \"provider\": \"<company>\",\n"
                  "  \"model_number\": \"<model>\",\n"
                  "  \"score\": <1-10>,\n"
                  "  \"pricing\": \"<text>\",\n"
                  "  \"description\": \"<text>\"\n"
                  "}\n\n"
                  "Output ONLY raw JSON.")
        
        raw = await call_groq_api(prompt)
        cleaned = extract_json(raw)
        return json.loads(cleaned)
    except Exception as e:
        logger.warning(f"Groq API failed for AI tools. Falling back to mock data. Error: {e}")
        return get_mock_ai_tools()
