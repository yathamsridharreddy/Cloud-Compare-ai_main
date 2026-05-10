import os
import json
import logging
from services.grok_client import call_groq_api, extract_json

logger = logging.getLogger(__name__)

# ── Static category data (always shown as seed / fallback) ──────────────────
CATEGORY_DATA = {
    "coding": [
        {"name": "Cursor",          "provider": "Anysphere",   "category": "Coding AI",    "pricing": "Free / $20/mo",   "rating": 9.4, "popularity": 97, "website": "https://cursor.com",       "logo": "💻", "summary": "AI-first code editor with deep codebase understanding and multi-file edits."},
        {"name": "GitHub Copilot",  "provider": "Microsoft",   "category": "Coding AI",    "pricing": "$10/mo",          "rating": 9.1, "popularity": 96, "website": "https://github.com/copilot","logo": "🤖", "summary": "AI pair programmer integrated into VS Code, JetBrains and Neovim."},
        {"name": "Codeium",         "provider": "Exafunction",  "category": "Coding AI",   "pricing": "Free / $15/mo",   "rating": 8.7, "popularity": 87, "website": "https://codeium.com",      "logo": "⚡", "summary": "Fast AI code completion supporting 70+ languages, free for individuals."},
        {"name": "Replit AI",       "provider": "Replit",       "category": "Coding AI",   "pricing": "Free / $20/mo",   "rating": 8.5, "popularity": 85, "website": "https://replit.com",       "logo": "🔁", "summary": "In-browser IDE with AI assistant that can build, run and deploy apps."},
        {"name": "Tabnine",         "provider": "Tabnine",      "category": "Coding AI",   "pricing": "Free / $12/mo",   "rating": 8.2, "popularity": 82, "website": "https://tabnine.com",      "logo": "🗂️", "summary": "Privacy-focused AI completion trained on permissively licensed code."},
        {"name": "Amazon Q Dev",    "provider": "AWS",          "category": "Coding AI",   "pricing": "Free / $19/mo",   "rating": 8.4, "popularity": 83, "website": "https://aws.amazon.com/q", "logo": "☁️", "summary": "AWS-native AI assistant for generating, debugging and optimising cloud code."},
    ],
    "video": [
        {"name": "Runway",      "provider": "Runway",    "category": "Video AI",  "pricing": "$15/mo",      "rating": 9.3, "popularity": 95, "website": "https://runwayml.com",   "logo": "🎬", "summary": "Professional AI video generation and editing with Gen-3 Alpha model."},
        {"name": "Synthesia",   "provider": "Synthesia", "category": "Video AI",  "pricing": "$29/mo",      "rating": 8.9, "popularity": 88, "website": "https://synthesia.io",   "logo": "🎭", "summary": "Create AI avatar videos with text-to-speech in 120+ languages."},
        {"name": "Pika",        "provider": "Pika Labs", "category": "Video AI",  "pricing": "Free / $8/mo","rating": 8.7, "popularity": 86, "website": "https://pika.art",       "logo": "⚡", "summary": "Text and image to video with cinematic quality and fine motion control."},
        {"name": "Kling AI",    "provider": "Kuaishou",  "category": "Video AI",  "pricing": "Free / $10/mo","rating": 8.6, "popularity": 84, "website": "https://klingai.com",    "logo": "🎞️", "summary": "High-fidelity 5-second and 10-second video generation from text or image."},
        {"name": "HeyGen",      "provider": "HeyGen",    "category": "Video AI",  "pricing": "$29/mo",      "rating": 8.8, "popularity": 87, "website": "https://heygen.com",     "logo": "🎤", "summary": "AI avatar video platform used for marketing and personalised video outreach."},
        {"name": "Sora",        "provider": "OpenAI",    "category": "Video AI",  "pricing": "$20/mo",      "rating": 9.5, "popularity": 98, "website": "https://openai.com/sora","logo": "🌀", "summary": "OpenAI's frontier text-to-video model producing ultra-realistic HD clips."},
    ],
    "image": [
        {"name": "Midjourney",       "provider": "Midjourney",      "category": "Image AI",  "pricing": "$10/mo",          "rating": 9.5, "popularity": 98, "website": "https://midjourney.com",   "logo": "🎨", "summary": "Best aesthetic image generator for art and professional design work."},
        {"name": "Leonardo AI",      "provider": "Leonardo.AI",     "category": "Image AI",  "pricing": "Free / $10/mo",   "rating": 9.0, "popularity": 91, "website": "https://leonardo.ai",     "logo": "🖼️", "summary": "Game-asset and marketing visuals generator with fine-tuned custom models."},
        {"name": "Ideogram",         "provider": "Ideogram",        "category": "Image AI",  "pricing": "Free / $7/mo",    "rating": 8.8, "popularity": 87, "website": "https://ideogram.ai",     "logo": "✏️", "summary": "Best AI for text-in-image generation — logos, posters and typography."},
        {"name": "DALL·E 3",         "provider": "OpenAI",          "category": "Image AI",  "pricing": "$0.04/img",       "rating": 8.7, "popularity": 90, "website": "https://openai.com",      "logo": "🌟", "summary": "OpenAI's flagship image model with exceptional prompt adherence."},
        {"name": "Stable Diffusion", "provider": "Stability AI",    "category": "Image AI",  "pricing": "Open Source",     "rating": 8.5, "popularity": 88, "website": "https://stability.ai",    "logo": "⚗️", "summary": "Open-source image model runnable locally with limitless fine-tuning."},
        {"name": "Adobe Firefly",    "provider": "Adobe",           "category": "Image AI",  "pricing": "$4.99/mo",        "rating": 8.6, "popularity": 86, "website": "https://firefly.adobe.com","logo": "🔥", "summary": "Commercial-safe AI art trained on licensed Adobe Stock assets."},
    ],
    "writing": [
        {"name": "Jasper",        "provider": "Jasper",     "category": "Writing AI", "pricing": "$39/mo",         "rating": 8.8, "popularity": 87, "website": "https://jasper.ai",         "logo": "✍️", "summary": "Marketing-focused AI writer with brand-voice memory and team workflows."},
        {"name": "Copy.ai",       "provider": "Copy.ai",    "category": "Writing AI", "pricing": "Free / $36/mo",  "rating": 8.5, "popularity": 84, "website": "https://copy.ai",           "logo": "📝", "summary": "AI that generates ad copy, blog posts and emails with GTM workflows."},
        {"name": "Writesonic",    "provider": "Writesonic", "category": "Writing AI", "pricing": "$13/mo",         "rating": 8.4, "popularity": 82, "website": "https://writesonic.com",    "logo": "⚡", "summary": "SEO-optimised long-form content writer with Chatsonic AI chatbot."},
        {"name": "Grammarly",     "provider": "Grammarly",  "category": "Writing AI", "pricing": "Free / $12/mo",  "rating": 9.0, "popularity": 95, "website": "https://grammarly.com",    "logo": "✅", "summary": "AI grammar, tone and plagiarism checker for all writing surfaces."},
        {"name": "Notion AI",     "provider": "Notion",     "category": "Writing AI", "pricing": "$10/mo add-on",  "rating": 8.6, "popularity": 88, "website": "https://notion.so",        "logo": "📓", "summary": "AI writing assistant built into Notion for docs, wikis and notes."},
        {"name": "Perplexity",    "provider": "Perplexity", "category": "Writing AI", "pricing": "Free / $20/mo",  "rating": 9.1, "popularity": 93, "website": "https://perplexity.ai",    "logo": "🔍", "summary": "AI answer engine with real-time web citations for research writing."},
    ],
    "music": [
        {"name": "Suno",      "provider": "Suno",      "category": "Music AI", "pricing": "Free / $10/mo", "rating": 9.3, "popularity": 95, "website": "https://suno.com",        "logo": "🎵", "summary": "Full-song generator with vocals, instruments and production in any genre."},
        {"name": "Udio",      "provider": "Udio",      "category": "Music AI", "pricing": "Free / $10/mo", "rating": 9.0, "popularity": 91, "website": "https://udio.com",        "logo": "🎶", "summary": "High-fidelity AI music generator with multi-style mixing and stem separation."},
        {"name": "Soundraw",  "provider": "Soundraw",  "category": "Music AI", "pricing": "$19.99/mo",     "rating": 8.5, "popularity": 82, "website": "https://soundraw.io",     "logo": "🔊", "summary": "Royalty-free AI music creator for content creators and video producers."},
        {"name": "Mubert",    "provider": "Mubert",    "category": "Music AI", "pricing": "Free / $14/mo", "rating": 8.3, "popularity": 80, "website": "https://mubert.com",      "logo": "🎸", "summary": "AI ambient and background music generator for streams and apps."},
        {"name": "AIVA",      "provider": "AIVA",      "category": "Music AI", "pricing": "Free / $11/mo", "rating": 8.6, "popularity": 83, "website": "https://aiva.ai",         "logo": "🎹", "summary": "Orchestral and cinematic AI composer used in games and film scores."},
        {"name": "Boomy",     "provider": "Boomy",     "category": "Music AI", "pricing": "Free / $9.99/mo","rating": 8.0, "popularity": 79, "website": "https://boomy.com",       "logo": "🥁", "summary": "Instant AI song creator that lets anyone release music on streaming platforms."},
    ],
    "research": [
        {"name": "Perplexity AI",      "provider": "Perplexity",     "category": "Research AI", "pricing": "Free / $20/mo", "rating": 9.4, "popularity": 96, "website": "https://perplexity.ai",        "logo": "🔍", "summary": "Real-time AI search engine with cited answers and deep research mode."},
        {"name": "Elicit",             "provider": "Elicit",          "category": "Research AI", "pricing": "Free / $10/mo", "rating": 8.8, "popularity": 83, "website": "https://elicit.com",           "logo": "📚", "summary": "AI research assistant that extracts data from millions of papers."},
        {"name": "Consensus",          "provider": "Consensus",       "category": "Research AI", "pricing": "Free / $9.99/mo","rating": 8.6, "popularity": 80, "website": "https://consensus.app",       "logo": "🎓", "summary": "Scientific search engine that aggregates findings from academic literature."},
        {"name": "Semantic Scholar",   "provider": "Allen Institute", "category": "Research AI", "pricing": "Free",          "rating": 8.5, "popularity": 82, "website": "https://semanticscholar.org", "logo": "🧪", "summary": "Free AI-powered literature search across 200M+ academic papers."},
        {"name": "Scite",              "provider": "Scite",           "category": "Research AI", "pricing": "$12/mo",        "rating": 8.7, "popularity": 79, "website": "https://scite.ai",            "logo": "🔬", "summary": "AI that shows how papers have been cited — supporting or contrasting."},
        {"name": "SciSpace",           "provider": "SciSpace",        "category": "Research AI", "pricing": "Free / $20/mo", "rating": 8.9, "popularity": 85, "website": "https://typeset.io",          "logo": "🌐", "summary": "Chat with research papers, summarise PDFs and discover related work."},
    ],
    "chatbot": [
        {"name": "ChatGPT",   "provider": "OpenAI",     "category": "Chatbot AI", "pricing": "Free / $20/mo", "rating": 9.6, "popularity": 99, "website": "https://chat.openai.com",  "logo": "💬", "summary": "World's most popular AI assistant with GPT-4o, image and voice support."},
        {"name": "Claude",    "provider": "Anthropic",  "category": "Chatbot AI", "pricing": "Free / $20/mo", "rating": 9.4, "popularity": 94, "website": "https://claude.ai",        "logo": "🤖", "summary": "Best-in-class reasoning and coding AI with 200K context window."},
        {"name": "Gemini",    "provider": "Google",     "category": "Chatbot AI", "pricing": "Free / $20/mo", "rating": 9.2, "popularity": 93, "website": "https://gemini.google.com","logo": "✨", "summary": "Google's multimodal AI with Workspace integration and real-time search."},
        {"name": "Grok",      "provider": "xAI",        "category": "Chatbot AI", "pricing": "Free / $8/mo",  "rating": 8.9, "popularity": 88, "website": "https://grok.x.ai",       "logo": "🌀", "summary": "Real-time X/Twitter-connected AI with humour and unfiltered answers."},
        {"name": "Mistral",   "provider": "Mistral AI", "category": "Chatbot AI", "pricing": "Free / $9/mo",  "rating": 8.7, "popularity": 84, "website": "https://mistral.ai",      "logo": "⚡", "summary": "Fast European open-source AI with strong reasoning and multilingual support."},
        {"name": "Copilot",   "provider": "Microsoft",  "category": "Chatbot AI", "pricing": "Free / $20/mo", "rating": 8.8, "popularity": 90, "website": "https://copilot.microsoft.com","logo": "🪁", "summary": "Microsoft's AI assistant powered by GPT-4 with Bing search and Office integration."},
    ],
    "presentation": [
        {"name": "Gamma",         "provider": "Gamma",        "category": "Presentation AI", "pricing": "Free / $10/mo", "rating": 9.2, "popularity": 92, "website": "https://gamma.app",         "logo": "🎯", "summary": "AI presentation builder that creates beautiful decks from a single prompt."},
        {"name": "Beautiful.ai",  "provider": "Beautiful.ai", "category": "Presentation AI", "pricing": "$12/mo",        "rating": 8.7, "popularity": 85, "website": "https://beautiful.ai",      "logo": "💎", "summary": "Smart slide templates that auto-design as you type content."},
        {"name": "Tome",          "provider": "Tome",         "category": "Presentation AI", "pricing": "Free / $16/mo", "rating": 8.9, "popularity": 87, "website": "https://tome.app",          "logo": "📖", "summary": "Narrative-first AI presentation tool blending slides and documents."},
        {"name": "MagicSlides",   "provider": "MagicSlides",  "category": "Presentation AI", "pricing": "Free / $7/mo",  "rating": 8.4, "popularity": 81, "website": "https://magicslides.app",   "logo": "✨", "summary": "Instantly convert any text or URL into a complete presentation."},
        {"name": "Decktopus",     "provider": "Decktopus",    "category": "Presentation AI", "pricing": "$7.99/mo",      "rating": 8.2, "popularity": 78, "website": "https://decktopus.com",     "logo": "🦤", "summary": "AI questionnaire to slide deck in minutes with presenter notes."},
        {"name": "SlidesAI",      "provider": "SlidesAI",     "category": "Presentation AI", "pricing": "Free / $10/mo", "rating": 8.3, "popularity": 80, "website": "https://slidesai.io",       "logo": "📊", "summary": "Google Slides add-on that turns any text into a complete slide deck."},
    ],
}

POPULAR_TOOLS = [
    {"name": "ChatGPT",     "provider": "OpenAI",      "category": "Chatbot AI",    "pricing": "Free / $20/mo", "rating": 9.6, "popularity": 99, "website": "https://chat.openai.com",   "logo": "💬", "summary": "World's leading conversational AI powering millions of daily users."},
    {"name": "Claude",      "provider": "Anthropic",   "category": "Chatbot AI",    "pricing": "Free / $20/mo", "rating": 9.4, "popularity": 94, "website": "https://claude.ai",         "logo": "🤖", "summary": "Expert reasoning and 200K context window for complex professional tasks."},
    {"name": "Gemini",      "provider": "Google",      "category": "Chatbot AI",    "pricing": "Free / $20/mo", "rating": 9.2, "popularity": 93, "website": "https://gemini.google.com", "logo": "✨", "summary": "Google's multimodal powerhouse with Workspace and real-time search."},
    {"name": "Cursor",      "provider": "Anysphere",   "category": "Coding AI",     "pricing": "Free / $20/mo", "rating": 9.4, "popularity": 97, "website": "https://cursor.com",        "logo": "💻", "summary": "The AI-first code editor taking over software development."},
    {"name": "Midjourney",  "provider": "Midjourney",  "category": "Image AI",      "pricing": "$10/mo",        "rating": 9.5, "popularity": 98, "website": "https://midjourney.com",    "logo": "🎨", "summary": "Premium AI art generator for stunning visuals and concept design."},
    {"name": "Runway",      "provider": "Runway",      "category": "Video AI",      "pricing": "$15/mo",        "rating": 9.3, "popularity": 95, "website": "https://runwayml.com",      "logo": "🎬", "summary": "Professional AI video generation used by top studios worldwide."},
    {"name": "Perplexity",  "provider": "Perplexity",  "category": "Research AI",   "pricing": "Free / $20/mo", "rating": 9.4, "popularity": 96, "website": "https://perplexity.ai",    "logo": "🔍", "summary": "Real-time AI search with cited sources for deep research."},
    {"name": "Grok",        "provider": "xAI",         "category": "Chatbot AI",    "pricing": "Free / $8/mo",  "rating": 8.9, "popularity": 88, "website": "https://grok.x.ai",        "logo": "🌀", "summary": "Elon Musk's real-time X-connected AI with unfiltered answers."},
    {"name": "Copilot",     "provider": "Microsoft",   "category": "Coding AI",     "pricing": "Free / $10/mo", "rating": 9.1, "popularity": 96, "website": "https://github.com/copilot","logo": "🪁", "summary": "AI pair programmer trusted by 1M+ developers in VS Code and JetBrains."},
    {"name": "ElevenLabs",  "provider": "ElevenLabs",  "category": "Voice AI",      "pricing": "Free / $22/mo", "rating": 9.3, "popularity": 93, "website": "https://elevenlabs.io",    "logo": "🎙️", "summary": "Ultra-realistic AI voice cloning and text-to-speech in 29 languages."},
    {"name": "Suno",        "provider": "Suno",        "category": "Music AI",      "pricing": "Free / $10/mo", "rating": 9.3, "popularity": 95, "website": "https://suno.com",         "logo": "🎵", "summary": "Full song generator with vocals, instruments and lyrics from text."},
    {"name": "Leonardo AI", "provider": "Leonardo.AI", "category": "Image AI",      "pricing": "Free / $10/mo", "rating": 9.0, "popularity": 91, "website": "https://leonardo.ai",      "logo": "🖼️", "summary": "Game-asset and marketing visual generator with fine-tuned models."},
]

CATEGORIES = [
    {"id": "coding",       "name": "Coding AI",       "icon": "💻", "count": 6},
    {"id": "video",        "name": "Video AI",        "icon": "🎬", "count": 6},
    {"id": "image",        "name": "Image AI",        "icon": "🎨", "count": 6},
    {"id": "writing",      "name": "Writing AI",      "icon": "✍️",  "count": 6},
    {"id": "music",        "name": "Music AI",        "icon": "🎵", "count": 6},
    {"id": "research",     "name": "Research AI",     "icon": "🔍", "count": 6},
    {"id": "chatbot",      "name": "Chatbot AI",      "icon": "💬", "count": 6},
    {"id": "presentation", "name": "Presentation AI", "icon": "🎯", "count": 6},
]

def get_popular_tools() -> list:
    return POPULAR_TOOLS

def get_categories() -> list:
    return CATEGORIES

def get_tools_by_category(category: str) -> list:
    return CATEGORY_DATA.get(category.lower(), POPULAR_TOOLS[:6])
