from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

DIST_DIR = Path(__file__).resolve().parent.parent / "dist"

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

# Mount static assets if dist exists
if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

# Mount Routers with /api prefix
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

# Also mount routers without /api prefix for flexible serverless rewrites
app.include_router(contracts_router)
app.include_router(obligations_router)
app.include_router(deadlines_router)
app.include_router(reviews_router)
app.include_router(changes_router)
app.include_router(graph_router)
app.include_router(query_router)
app.include_router(analytics_router)
app.include_router(documents_router)
app.include_router(audit_router)

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "tagline": settings.TAGLINE
    }

@app.get("/")
def serve_root():
    index_file = DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"status": "ContractLens Enterprise Agent Ready"}

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    file_path = DIST_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)
    index_file = DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"detail": "Not Found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

