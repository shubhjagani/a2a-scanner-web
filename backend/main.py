from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, HttpUrl
import os
from dotenv import load_dotenv
import requests
import json
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Env
load_dotenv()

app = FastAPI(title="A2A Security Scanner")

# Config
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ENABLE_AI_SCAN = os.getenv("ENABLE_AI_SCAN", "false").lower() == "true"

if not OPENAI_API_KEY and ENABLE_AI_SCAN:
    logger.warning("OPENAI_API_KEY is missing, but AI Scan is enabled. Disabling AI features.")
    ENABLE_AI_SCAN = False

class ScanRequest(BaseModel):
    url: HttpUrl = None
    json_payload: dict = None

class EndpointScanRequest(BaseModel):
    url: HttpUrl

@app.get("/health")
def health():
    return {
        "status": "ok",
        "ai_enabled": ENABLE_AI_SCAN,
        "openai_key_present": bool(OPENAI_API_KEY)
    }

@app.post("/scan/card")
async def scan_card(request: ScanRequest = Body(...)):
    """
    Scans an Agent Card URL or JSON payload for security risks.
    """
    try:
        agent_card = {}
        
        # 1. Fetch Agent Card
        if request.url:
            try:
                resp = requests.get(str(request.url), timeout=10)
                resp.raise_for_status()
                agent_card = resp.json()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to fetch card from URL: {str(e)}")
        elif request.json_payload:
            agent_card = request.json_payload
        else:
            raise HTTPException(status_code=400, detail="Either 'url' or 'json_payload' is required.")

        # 2. Static Analysis (YARA/Heuristics Simulation)
        risks = []
        score = 100

        # Check for auth
        if "auth" not in agent_card and "authentication" not in agent_card:
            risks.append({"severity": "high", "message": "Missing authentication configuration."})
            score -= 30

        # Check for capabilities/permissions
        if "permissions" in agent_card:
            perms = agent_card["permissions"]
            if "exec" in perms or "shell" in perms:
                 risks.append({"severity": "critical", "message": "Agent requests shell execution permissions."})
                 score -= 50
        
        # Check for exposed endpoints
        if "endpoints" in agent_card:
            for ep in agent_card["endpoints"]:
                if not str(ep.get("url", "")).startswith("https"):
                     risks.append({"severity": "medium", "message": f"Insecure endpoint detected: {ep.get('url')}"})
                     score -= 10

        # 3. AI Analysis (if enabled)
        ai_analysis = None
        if ENABLE_AI_SCAN:
            # Placeholder for OpenAI Call
            # TODO: Integrate OpenAI call here using `a2a-scanner` lib or direct call
            ai_analysis = "AI Analysis simulated: No hidden malicious intent detected in description fields."

        return {
            "score": max(0, score),
            "risks": risks,
            "ai_analysis": ai_analysis,
            "card_summary": {
                "name": agent_card.get("name", "Unknown"),
                "version": agent_card.get("version", "Unknown")
            }
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Scan failed: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during scan.")

@app.post("/scan/endpoint")
async def scan_endpoint(request: EndpointScanRequest = Body(...)):
    """
    Checks a live Agent API endpoint for security configurations.
    """
    url_str = str(request.url)
    risks = []
    score = 100
    details = {}

    try:
        # 1. Check HTTPS
        if not url_str.startswith("https"):
            risks.append({"severity": "high", "message": "Endpoint is not using HTTPS."})
            score -= 40
        
        # 2. Check Headers (Security)
        try:
            resp = requests.head(url_str, timeout=5)
            headers = resp.headers
            details["status_code"] = resp.status_code
            
            if "Strict-Transport-Security" not in headers:
                risks.append({"severity": "medium", "message": "Missing HSTS header."})
                score -= 10
            
            if "Content-Security-Policy" not in headers:
                risks.append({"severity": "low", "message": "Missing CSP header."})
                score -= 5
                
        except Exception as e:
            risks.append({"severity": "high", "message": f"Endpoint unreachable: {str(e)}"})
            score = 0
            
        return {
            "score": max(0, score),
            "risks": risks,
            "details": details
        }

    except Exception as e:
        logger.error(f"Endpoint scan failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
