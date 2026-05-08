from pydantic import BaseModel
from typing import Optional
from enum import Enum


class UserIntent(str, Enum):
    INVESTMENT = "investment"
    PARTNERSHIP = "partnership"
    COMPETITIVE = "competitive_research"
    GENERAL = "general"


class IntelRequest(BaseModel):
    company_url: str
    intent: UserIntent = UserIntent.GENERAL
    # e.g. "I'm a Series A VC focused on B2B SaaS infrastructure"
    user_context: Optional[str] = None


class CrawledSection(BaseModel):
    url: str
    section_type: str
    content_markdown: str
    success: bool
    error: Optional[str] = None


class CompanyProfile(BaseModel):
    name: str
    tagline: Optional[str]
    description: str
    founded: Optional[str]
    size: Optional[str]
    industry: str
    headquarters: Optional[str]


class ProductSummary(BaseModel):
    products: list[str]
    pricing_model: Optional[str]
    target_customers: str
    key_differentiators: list[str]


class StrategicAnalysis(BaseModel):
    headline: str
    opportunities: list[str]
    risks: list[str]
    strategic_fit_score: int  # 1–10
    reasoning: str


class RecentDevelopments(BaseModel):
    items: list[str]
    growth_signals: list[str]
    funding_mentions: Optional[str]


class CompanyIntelReport(BaseModel):
    company: CompanyProfile
    products: ProductSummary
    strategic_analysis: StrategicAnalysis
    recent_developments: RecentDevelopments
    key_people: list[str]
    raw_sources: list[str]
    generated_at: str
    intent: str
