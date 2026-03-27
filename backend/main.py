"""
Entry point for Render deployment.
This file exists to satisfy Render's auto-detection of Python apps.
It imports and exposes the FastAPI app from app.main
"""
from app.main import app

if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
