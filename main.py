from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routers import api, auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CloudCompare AI",
    description="Multi-Cloud Service Recommendation System — FastAPI",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for now, in prod you should restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(api.router, prefix="/api", tags=["api"])

import os
from fastapi.responses import FileResponse

# Serve the old static files explicitly at /static path so login.html is accessible
app.mount("/static", StaticFiles(directory="static"), name="static")

# Expose explicit static pages
@app.get("/")
async def serve_landing():
    return FileResponse("static/index.html")

@app.get("/login.html")
async def serve_login():
    return FileResponse("static/login.html")

@app.get("/signup.html")
async def serve_signup():
    return FileResponse("static/signup.html")

# Serve React assets
dist_path = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.exists(dist_path):
    # Mount the assets directory from Vite build
    assets_path = os.path.join(dist_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    # Catch-all for SPA routing to serve React's index.html
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        index_file = os.path.join(dist_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "React frontend not built. Run 'npm run build' inside frontend/"}
else:
    # Fallback to the original static directory if React is not built
    app.mount("/", StaticFiles(directory="static", html=True), name="static")
