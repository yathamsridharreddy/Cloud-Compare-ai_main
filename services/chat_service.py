import os
import logging
import httpx
import json

logger = logging.getLogger(__name__)

GROK_ENDPOINT = os.getenv("GROK_ENDPOINT", "https://api.groq.com/openai/v1/chat/completions")
GROK_MODEL    = os.getenv("GROK_MODEL",    "llama-3.3-70b-versatile")
GROK_TIMEOUT  = int(os.getenv("GROK_TIMEOUT", "30000")) / 1000.0

CLOUD_SYSTEM = """You are CloudCompare AI, an expert cloud infrastructure analyst.
You help users compare AWS, Azure, GCP, Oracle Cloud (OCI) and Alibaba Cloud.
You provide concise, accurate, data-driven answers about pricing, performance, regions and best practices.
Format your responses with markdown — use **bold** for providers, bullet points for comparisons.
Keep answers focused and under 300 words unless a detailed breakdown is needed."""

AI_TOOLS_SYSTEM = """You are AITools Expert, a knowledgeable AI tools analyst.
You help users compare and choose the best AI tools across categories: coding, video, image, writing, music, research, chatbots.
Provide honest, up-to-date recommendations with pricing, pros/cons and use-case fit.
Format your responses with markdown — use **bold** for tool names, bullet points for comparisons.
Keep answers under 300 words and always suggest 2-3 specific tools with reasons."""

def get_api_key():
    raw = os.getenv("GROK_API_KEYS", "")
    keys = [k.strip() for k in raw.split(",") if k.strip()]
    if not keys:
        raise ValueError("No GROK_API_KEYS configured.")
    return keys[0]

async def chat(message: str, chat_type: str = "cloud", history: list = None) -> str:
    """
    chat_type: "cloud" | "ai_tools"
    history: list of {"role": "user"|"assistant", "content": str}
    """
    system_prompt = CLOUD_SYSTEM if chat_type == "cloud" else AI_TOOLS_SYSTEM
    api_key = get_api_key()

    messages = [{"role": "system", "content": system_prompt}]
    if history:
        messages.extend(history[-6:])  # keep last 3 turns for context
    messages.append({"role": "user", "content": message})

    payload = {
        "model": GROK_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1024,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=GROK_TIMEOUT) as client:
            resp = await client.post(GROK_ENDPOINT, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error(f"Chat API error: {e}")
        if chat_type == "cloud":
            return ("I'm having trouble connecting to the AI backend right now. "
                    "Try asking: **AWS vs GCP for compute**, **cheapest Kubernetes**, or **best cloud for startups**.")
        else:
            return ("I'm having trouble connecting right now. "
                    "Try asking: **best coding AI**, **ChatGPT vs Claude**, or **cheapest image AI**.")
