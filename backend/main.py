from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.core.config import settings
from backend.core.database import init_db
from backend.services.seed_data import seed_database_and_documents

from backend.api.contracts import router as contracts_router
from backend.api.obligations import router as obligations_router
from backend.api.deadlines import router as deadlines_router
from backend.api.reviews import router as reviews_router
from backend.api.changes import router as changes_router
from backend.api.graph import router as graph_router
from backend.api.query import router as query_router
from backend.api.analytics import router as analytics_router
from backend.api.documents import router as documents_router
from backend.api.audit import router as audit_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed deterministic demo contracts
    init_db()
    seed_database_and_documents()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise AI Contract Intelligence & Obligation Management Platform",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(contracts_router, prefix="/api")
app.include_router(obligations_router, prefix="/api")
app.include_router(deadlines_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(changes_router, prefix="/api")
app.include_router(graph_router, prefix="/api")
app.include_router(query_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(audit_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "tagline": settings.TAGLINE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
