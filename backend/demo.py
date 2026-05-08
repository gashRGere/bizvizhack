"""
Quick CLI demo — run without starting the server.
Usage:
    python demo.py stripe.com investment "I'm a Series B VC focused on fintech infrastructure"
    python demo.py notion.com partnership
    python demo.py hubspot.com competitive_research
"""
import asyncio
import json
import sys

from scraper import scrape_company
from intelligence import generate_intelligence_report


def print_report(report: dict) -> None:
    c = report["company"]
    p = report["products"]
    s = report["strategic_analysis"]
    r = report["recent_developments"]

    score = s["strategic_fit_score"]
    score_bar = "█" * score + "░" * (10 - score)

    print("\n" + "═" * 60)
    print(f"  SCOUTLY INTELLIGENCE REPORT")
    print("═" * 60)
    print(f"\n  {c['name'].upper()}")
    if c.get("tagline"):
        print(f"  \"{c['tagline']}\"")
    print(f"\n  {c['description']}")

    print(f"\n  Industry : {c['industry']}")
    if c.get("size"):
        print(f"  Size     : {c['size']}")
    if c.get("founded"):
        print(f"  Founded  : {c['founded']}")
    if c.get("headquarters"):
        print(f"  HQ       : {c['headquarters']}")

    print(f"\n{'─'*60}")
    print(f"  PRODUCTS & SERVICES")
    print(f"{'─'*60}")
    for product in p["products"]:
        print(f"  • {product}")
    if p.get("pricing_model"):
        print(f"\n  Pricing   : {p['pricing_model']}")
    print(f"  Customers : {p['target_customers']}")
    print("\n  Differentiators:")
    for d in p["key_differentiators"]:
        print(f"    → {d}")

    print(f"\n{'─'*60}")
    print(f"  STRATEGIC ANALYSIS  [{request_intent.upper()}]")
    print(f"{'─'*60}")
    print(f"\n  ⚡ {s['headline']}\n")
    print(f"  Strategic Fit: {score}/10  {score_bar}")
    print(f"  {s['reasoning']}")

    print("\n  Opportunities:")
    for o in s["opportunities"]:
        print(f"    ✓ {o}")

    print("\n  Risks:")
    for risk in s["risks"]:
        print(f"    ✗ {risk}")

    if r["items"]:
        print(f"\n{'─'*60}")
        print(f"  RECENT DEVELOPMENTS")
        print(f"{'─'*60}")
        for item in r["items"]:
            print(f"  • {item}")

    if r["growth_signals"]:
        print("\n  Growth Signals:")
        for g in r["growth_signals"]:
            print(f"    ↑ {g}")

    if r.get("funding_mentions"):
        print(f"\n  Funding: {r['funding_mentions']}")

    if report.get("key_people"):
        print(f"\n{'─'*60}")
        print(f"  KEY PEOPLE")
        print(f"{'─'*60}")
        for person in report["key_people"]:
            print(f"  • {person}")

    print(f"\n{'═'*60}")
    print(f"  Sources: {', '.join(report['raw_sources'])}")
    print(f"  Generated: {report['generated_at']}")
    print(f"{'═'*60}\n")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python demo.py <url> [intent] [user_context]")
        print("  intent: investment | partnership | competitive_research | general")
        sys.exit(1)

    url = sys.argv[1]
    request_intent = sys.argv[2] if len(sys.argv) > 2 else "general"
    user_context = sys.argv[3] if len(sys.argv) > 3 else ""

    print(f"\nScraping {url}...")
    scraped = asyncio.run(scrape_company(url))

    print("Generating intelligence report...")
    report = generate_intelligence_report(scraped, request_intent, user_context)

    print_report(report)

    # Also dump raw JSON
    with open("last_report.json", "w") as f:
        json.dump(report, f, indent=2)
    print("Raw JSON saved to last_report.json")
