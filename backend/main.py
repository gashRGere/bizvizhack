"""
Scoutly — B2B Company Intelligence Platform
MVP entry point: FastAPI REST API
"""
import asyncio
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from intelligence import generate_intelligence_report
from models import IntelRequest
from scraper import scrape_company

load_dotenv()

app = FastAPI(
    title="Scoutly",
    description="Turn any company website into actionable B2B intelligence.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "product": "Scoutly B2B Intelligence",
        "version": "0.1.0",
        "endpoints": {
            "POST /analyze": "Analyze a company URL",
            "GET /health": "Health check",
        },
    }


@app.post("/analyze")
async def analyze(request: IntelRequest):
    """
    Scrape a company website and return a structured intelligence report.

    - **company_url**: The company's website (e.g. stripe.com)
    - **intent**: investment | partnership | competitive_research | general
    - **user_context**: Optional — describe who you are for a sharper analysis
    """
    try:
        # Scrape in async, then run intelligence sync in threadpool
        scraped = await scrape_company(request.company_url)

        has_content = scraped["homepage"] or any(
            s["success"] for s in scraped["sections"]
        )
        if not has_content:
            raise HTTPException(
                status_code=422,
                detail="Could not extract meaningful content from this URL. "
                "The site may block bots or require JavaScript.",
            )

        # Run blocking Claude call in thread so we don't block the event loop
        loop = asyncio.get_event_loop()
        report = await loop.run_in_executor(
            None,
            generate_intelligence_report,
            scraped,
            request.intent.value,
            request.user_context or "",
        )

        return {"success": True, "report": report}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/health")
def health():
    return {"status": "healthy"}
