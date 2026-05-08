import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Real API calls ───────────────────────────────────────────────────────────

export async function analyzeCompany({ company_url, intent, user_context }) {
  const { data } = await axios.post(`${BASE}/analyze`, {
    company_url,
    intent,
    user_context: user_context || undefined,
  })
  return data.report
}

// ─── Mock data (used when VITE_USE_MOCK=true or API is unreachable) ───────────

export const MOCK_REPORT = {
  company: {
    name: 'Stripe',
    tagline: 'Financial infrastructure for the internet',
    description:
      'Stripe builds payment and treasury infrastructure that powers businesses of every size — from startups to Fortune 500 companies. Their core product enables online and in-person payment acceptance, but the real value lies in their developer-first ecosystem: APIs, fraud tooling, and financial products that replace entire banking workflows.',
    founded: '2010',
    size: '8,000+ employees',
    industry: 'Financial Technology / Payments Infrastructure',
    headquarters: 'San Francisco, CA',
  },
  products: {
    products: ['Stripe Payments', 'Stripe Connect', 'Stripe Billing', 'Stripe Treasury', 'Stripe Radar', 'Stripe Atlas', 'Stripe Issuing'],
    pricing_model: 'Usage-based (2.9% + 30¢ per transaction for standard); enterprise custom pricing',
    target_customers: 'Developers and CTOs at high-growth startups through to enterprise finance teams needing embedded payment and banking infrastructure',
    key_differentiators: [
      'Developer experience — best-in-class API documentation and SDKs',
      'Global coverage: 135+ currencies, 50+ payment methods',
      'Radar ML fraud detection trained on billions of transactions',
      'Treasury product enables companies to embed financial services without a banking license',
    ],
  },
  strategic_analysis: {
    headline: 'Stripe is quietly becoming the AWS of fintech — a platform layer that other fintechs are built on top of, creating compounding switching costs and a data moat that compounds with every new customer.',
    opportunities: [
      'Strategic integration: Stripe Connect fits any platform-model SaaS — could replace your current payment stack with zero custom dev',
      'Treasury API enables revenue diversification by offering financial services to your own customers',
      'Atlas is a wedge into early-stage founder relationships — strong partnership co-marketing angle',
    ],
    risks: [
      'Stripe competes with partners: they are building products (Stripe Capital, Issuing) that overlap with fintech startups in adjacent verticals',
      'Enterprise sales motion is still maturing — SLAs and support tiers lag behind incumbents like Adyen',
      'Regulatory exposure growing as they expand into banking and lending products',
    ],
    strategic_fit_score: 9,
    reasoning:
      'Exceptional infrastructure layer with compounding network effects. The data moat from transaction volume makes them nearly irreplaceable for mature platforms. Score docked one point due to increasing competitive overlap with partner ecosystem.',
  },
  recent_developments: {
    items: [
      'Launched Stripe Financial Connections for bank account verification',
      'Announced Stripe Data Pipeline for direct data sync to Snowflake/Redshift',
      'Expanded Stripe Terminal to support Tap to Pay on iPhone',
      'Released Stripe Checkout with Link for one-click checkout',
    ],
    growth_signals: [
      'Processing volume reported at ~$1T+ annually',
      'Expanding into SMB banking with Stripe Treasury',
      'Recent engineering blog shows 6 major infrastructure launches in Q1 2025',
    ],
    funding_mentions: 'Last known valuation $65B (2023 secondary market). Profitable as of 2023.',
  },
  key_people: [
    'Patrick Collison — CEO & Co-founder',
    'John Collison — President & Co-founder',
    'Dhivya Suryadevara — CFO',
    'Claire Hughes Johnson — COO (former)',
  ],
  raw_sources: ['https://stripe.com/about', 'https://stripe.com/products', 'https://stripe.com/newsroom'],
  generated_at: new Date().toISOString(),
  intent: 'investment',
}

// Use mock if explicitly set, or if no backend URL is configured
export const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_URL

export async function analyzeCompanySafe(params) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 2200))
    return { ...MOCK_REPORT, intent: params.intent }
  }
  return analyzeCompany(params)
}

export async function analyzeBatch(urls, intent, user_context) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 800))
    return urls.map((url, i) => ({
      ...MOCK_REPORT,
      company: { ...MOCK_REPORT.company, name: url.replace(/https?:\/\/(www\.)?/, '').split('/')[0] },
      strategic_analysis: {
        ...MOCK_REPORT.strategic_analysis,
        strategic_fit_score: Math.floor(Math.random() * 4) + 6,
      },
      intent,
      _url: url,
      _index: i,
    }))
  }

  const results = await Promise.allSettled(
    urls.map(url => analyzeCompany({ company_url: url, intent, user_context }))
  )
  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? { ...r.value, _url: urls[i] }
      : { _url: urls[i], _error: r.reason?.message || 'Failed' }
  )
}
