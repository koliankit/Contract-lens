import sys
from pathlib import Path

# Add project root to Python module search path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.main import app

# Vercel serverless functions automatically recognize the ASGI/WSGI 'app' instance
