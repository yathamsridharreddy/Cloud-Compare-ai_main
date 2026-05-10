from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

@app.get("/")
def read_root():
    return {"message": "CloudCompare AI API is running. Go to /docs for Swagger UI."}
