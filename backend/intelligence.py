"""
Intelligence layer: turns raw scraped markdown into a structured analyst report.

Design choices:
- System prompt is cached (ephemeral) — saves tokens on repeated calls
- Intent lenses shift Claude's analytical frame without changing the schema
- Output is always strict JSON — no markdown wrapping
"""
import json
import re
from datetime import datetime, timezone

import os
import anthropic

_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Cached once per session — 1024+ tokens qualifies for prompt caching
_SYSTEM_PROMPT = """You are a senior business intelligence analyst specialising in B2B company research.

Your job: turn raw website content into an actionable intelligence report that a decision-maker
can act on in under 60 seconds.

Rules:
1. Be INFERENTIAL, not just extractive. Don't say "they offer cloud security." Say "their recent
   pivot to AI-native cloud security signals a repositioning toward enterprise mid-market."
2. Cut marketing fluff. If a company says "we empower teams," translate that to what they actually do.
3. Strategic Fit Score (1–10): 1 = irrelevant / red flags, 10 = exceptional match. Be honest.
4. Every opportunity and risk must be SPECIFIC. No generic "market competition" risks.
5. Output ONLY valid JSON — no preamble, no code fences, no explanation."""

_INTENT_LENSES = {
    "investment": (
        "INVESTOR LENS: Focus on growth signals, revenue model clarity, team indicators, "
        "competitive moat, burn rate signals, and exit potential. Flag any signs of stagnation."
    ),
    "partnership": (
        "PARTNERSHIP LENS: Focus on product/service complementarity, shared customer segments, "
        "integration feasibility, their existing partner ecosystem, and deal-making appetite signals."
    ),
    "competitive_research": (
        "COMPETITIVE LENS: Focus on product capabilities vs. market alternatives, pricing strategy, "
        "go-to-market motion, target ICP, differentiation claims (real vs. marketing), and weaknesses."
    ),
    "general": (
        "GENERAL LENS: Balanced overview covering what they do, who they serve, recent momentum, "
        "and strategic outlook."
    ),
}

_OUTPUT_SCHEMA = """{
    "company": {
        "name": "string",
        "tagline": "string or null",
        "description": "2–3 sentences on what they actually do (no marketing language)",
        "founded": "string or null",
        "size": "string or null  e.g. '50–200 employees'",
        "industry": "string",
        "headquarters": "string or null"
    },
    "products": {
        "products": ["list of specific product or service names"],
        "pricing_model": "string describing pricing approach or null",
        "target_customers": "who buys this — be specific about company size, role, industry",
        "key_differentiators": ["real differentiators only — skip generic claims"]
    },
    "strategic_analysis": {
        "headline": "ONE sentence capturing the single most important strategic insight",
        "opportunities": ["specific opportunities for the user given their stated intent"],
        "risks": ["specific risks or concerns — be honest"],
        "strategic_fit_score": 7,
        "reasoning": "2–3 sentences justifying the score"
    },
    "recent_developments": {
        "items": ["recent launches, pivots, hires, partnerships mentioned on the site"],
        "growth_signals": ["signals pointing to growth trajectory"],
        "funding_mentions": "string or null"
    },
    "key_people": ["Name — Title (only if found on the site)"]
}"""


def _build_prompt(scraped: dict, intent: str, user_context: str) -> str:
    lens = _INTENT_LENSES.get(intent, _INTENT_LENSES["general"])
    ctx_line = f"\nUser context: {user_context}" if user_context else ""

    sections_md = ""
    for s in scraped["sections"]:
        if s["success"]:
            sections_md += (
                f"\n\n=== {s['section_type'].upper()} PAGE ({s['url']}) ===\n"
                + s["content_markdown"]
            )

    return (
        f"{lens}{ctx_line}\n\n"
        f"Company URL: {scraped['base_url']}\n\n"
        f"=== HOMEPAGE ===\n{scraped['homepage']}"
        f"{sections_md}\n\n"
        f"Produce a JSON report matching this schema exactly:\n{_OUTPUT_SCHEMA}"
    )


def _parse_json(raw: str) -> dict:
    # Strip accidental code fences if present
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```[a-z]*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)
    # Remove trailing commas before } or ] (common LLM mistake)
    raw = re.sub(r",\s*([}\]])", r"\1", raw)
    return json.loads(raw)


def generate_intelligence_report(
    scraped: dict,
    intent: str,
    user_context: str = "",
) -> dict:
    prompt = _build_prompt(scraped, intent, user_context)

    message = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=[
            {
                "type": "text",
                "text": _SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},  # cached across requests
            }
        ],
        messages=[{"role": "user", "content": prompt}],
    )

    report = _parse_json(message.content[0].text)
    report["generated_at"] = datetime.now(timezone.utc).isoformat()
    report["intent"] = intent
    report["raw_sources"] = [s["url"] for s in scraped["sections"] if s["success"]]

    return report
