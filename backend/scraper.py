"""
Three-crawler strategy:
  1. About Crawler  → mission, team, leadership
  2. Product Crawler → features, pricing, ICP
  3. Press Crawler  → recent news, growth signals, funding
"""
import asyncio
import re
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

SECTION_PATHS: dict[str, list[str]] = {
    "about": [
        "/about", "/about-us", "/company", "/who-we-are",
        "/our-story", "/team", "/mission",
    ],
    "products": [
        "/products", "/services", "/solutions", "/platform",
        "/pricing", "/features", "/what-we-do",
    ],
    "press": [
        "/news", "/press", "/newsroom", "/blog",
        "/media", "/investors", "/announcements",
    ],
}

NOISE_SELECTORS = [
    "script", "style", "nav", "footer", "header",
    "aside", "noscript", "iframe", "form",
]

NOISE_CLASSES = re.compile(
    r"cookie|popup|modal|banner|overlay|gdpr|subscribe|newsletter|chat",
    re.IGNORECASE,
)

REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
}

MAX_CHARS_PER_SECTION = 6_000
MAX_CHARS_HOMEPAGE = 3_000


def html_to_markdown(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")

    for tag in soup.find_all(NOISE_SELECTORS):
        tag.decompose()

    for tag in soup.find_all(class_=NOISE_CLASSES):
        tag.decompose()

    lines: list[str] = []
    seen: set[str] = set()

    for el in soup.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
        text = el.get_text(" ", strip=True)
        if not text or len(text) < 8 or text in seen:
            continue
        seen.add(text)

        if el.name == "h1":
            lines.append(f"# {text}")
        elif el.name == "h2":
            lines.append(f"## {text}")
        elif el.name in ("h3", "h4"):
            lines.append(f"### {text}")
        elif el.name == "li":
            lines.append(f"- {text}")
        elif el.name == "p" and len(text) > 20:
            lines.append(text)

    return "\n\n".join(lines)


async def _fetch(client: httpx.AsyncClient, url: str) -> str | None:
    try:
        r = await client.get(url, timeout=12.0, follow_redirects=True)
        if r.status_code == 200 and "text/html" in r.headers.get("content-type", ""):
            return r.text
    except Exception:
        pass
    return None


async def _crawl_section(
    client: httpx.AsyncClient, base_url: str, section_type: str
) -> dict:
    for path in SECTION_PATHS[section_type]:
        url = urljoin(base_url, path)
        html = await _fetch(client, url)
        if html:
            md = html_to_markdown(html)
            if len(md) > 300:
                return {
                    "url": url,
                    "section_type": section_type,
                    "content_markdown": md[:MAX_CHARS_PER_SECTION],
                    "success": True,
                    "error": None,
                }

    return {
        "url": base_url,
        "section_type": section_type,
        "content_markdown": "",
        "success": False,
        "error": f"No dedicated {section_type} page found.",
    }


async def scrape_company(company_url: str) -> dict:
    if not company_url.startswith("http"):
        company_url = f"https://{company_url}"

    parsed = urlparse(company_url)
    base_url = f"{parsed.scheme}://{parsed.netloc}"

    async with httpx.AsyncClient(headers=REQUEST_HEADERS, verify=False) as client:
        homepage_html, about, products, press = await asyncio.gather(
            _fetch(client, base_url),
            _crawl_section(client, base_url, "about"),
            _crawl_section(client, base_url, "products"),
            _crawl_section(client, base_url, "press"),
        )

    homepage_md = html_to_markdown(homepage_html or "")[:MAX_CHARS_HOMEPAGE]

    return {
        "base_url": base_url,
        "homepage": homepage_md,
        "sections": [about, products, press],
    }
