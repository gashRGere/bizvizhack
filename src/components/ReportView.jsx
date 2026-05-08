import { Download, ArrowLeft, ExternalLink, Check, X, TrendingUp, Users, Calendar, MapPin, Tag, Zap } from 'lucide-react'
import ScoreRing from './ScoreRing'
import { exportReportPDF } from '../utils/pdf'

function Section({ title, children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-6 ${className}`}>
      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-5">{title}</h3>
      {children}
    </div>
  )
}

function MetaBadge({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon size={14} className="text-text-dim flex-shrink-0" />
      <span className="text-text-dim">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  )
}

const INTENT_LABELS = {
  investment: { label: 'Investment Analysis', color: 'bg-emerald/15 text-emerald border-emerald/30' },
  partnership: { label: 'Partnership Analysis', color: 'bg-accent/15 text-accent border-accent/30' },
  competitive_research: { label: 'Competitive Research', color: 'bg-rose/15 text-rose border-rose/30' },
  general: { label: 'General Overview', color: 'bg-surface text-text-secondary border-border' },
}

export default function ReportView({ report, onBack }) {
  const { company: c, products: p, strategic_analysis: sa, recent_developments: rd, key_people } = report
  const intentMeta = INTENT_LABELS[report.intent] || INTENT_LABELS.general
  const score = sa.strategic_fit_score

  return (
    <div className="animate-fade-up space-y-4" id="report-content">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={onBack} className="btn-ghost text-sm">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-center gap-3">
          <span className={`tag border ${intentMeta.color}`}>{intentMeta.label}</span>
          <button
            onClick={() => exportReportPDF(report)}
            className="btn-primary text-sm py-2.5"
          >
            <Download size={15} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Hero header card */}
      <div className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-text-primary">{c.name}</h1>
              {report.raw_sources?.[0] && (
                <a href={report.raw_sources[0]} target="_blank" rel="noreferrer"
                   className="text-text-dim hover:text-accent transition-colors">
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            {c.tagline && <p className="text-text-secondary text-base mb-4">{c.tagline}</p>}
            <p className="text-text-secondary leading-relaxed">{c.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-5">
              <MetaBadge icon={Tag} label="Industry" value={c.industry} />
              <MetaBadge icon={Users} label="Size" value={c.size} />
              <MetaBadge icon={Calendar} label="Founded" value={c.founded} />
              <MetaBadge icon={MapPin} label="HQ" value={c.headquarters} />
            </div>
          </div>

          {/* Score ring */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <ScoreRing score={score} size={110} />
            <span className="text-xs text-text-dim">Strategic Fit</span>
          </div>
        </div>

        {/* Strategic headline */}
        <div className="mt-6 border-t border-border pt-5">
          <div className="flex items-start gap-3">
            <Zap size={16} className="text-accent mt-0.5 flex-shrink-0" />
            <p className="text-text-primary font-medium leading-relaxed">{sa.headline}</p>
          </div>
          <p className="mt-3 text-sm text-text-secondary ml-7 leading-relaxed">{sa.reasoning}</p>
        </div>
      </div>

      {/* 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Opportunities */}
        <Section title="Opportunities">
          <ul className="space-y-3">
            {sa.opportunities.map((o, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-emerald" />
                </span>
                <span className="text-sm text-text-secondary leading-relaxed">{o}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Risks */}
        <Section title="Risks & Concerns">
          <ul className="space-y-3">
            {sa.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X size={11} className="text-rose" />
                </span>
                <span className="text-sm text-text-secondary leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Products */}
      <Section title="Products & Services">
        <div className="space-y-5">
          {/* Product pills */}
          <div className="flex flex-wrap gap-2">
            {p.products.map((prod, i) => (
              <span key={i} className="tag bg-accent/10 text-accent border border-accent/20">
                {prod}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {p.target_customers && (
              <div>
                <p className="text-xs font-bold text-text-dim uppercase tracking-wider mb-2">Target Customers</p>
                <p className="text-sm text-text-secondary leading-relaxed">{p.target_customers}</p>
              </div>
            )}
            {p.pricing_model && (
              <div>
                <p className="text-xs font-bold text-text-dim uppercase tracking-wider mb-2">Pricing Model</p>
                <p className="text-sm text-text-secondary leading-relaxed">{p.pricing_model}</p>
              </div>
            )}
          </div>

          {p.key_differentiators?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-text-dim uppercase tracking-wider mb-3">Key Differentiators</p>
              <ul className="space-y-2">
                {p.key_differentiators.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-accent mt-0.5">→</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* Recent developments */}
      {(rd?.items?.length > 0 || rd?.growth_signals?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rd.items?.length > 0 && (
            <Section title="Recent Developments">
              <ul className="space-y-2.5">
                {rd.items.map((item, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2 leading-relaxed">
                    <span className="text-text-dim mt-1">·</span> {item}
                  </li>
                ))}
              </ul>
              {rd.funding_mentions && (
                <div className="mt-4 flex items-center gap-2.5 p-3 rounded-xl bg-emerald/10 border border-emerald/20">
                  <TrendingUp size={14} className="text-emerald flex-shrink-0" />
                  <span className="text-sm text-emerald">{rd.funding_mentions}</span>
                </div>
              )}
            </Section>
          )}
          {rd.growth_signals?.length > 0 && (
            <Section title="Growth Signals">
              <ul className="space-y-2.5">
                {rd.growth_signals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <TrendingUp size={13} className="text-emerald mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary leading-relaxed">{g}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}

      {/* Key people */}
      {key_people?.length > 0 && (
        <Section title="Key People">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {key_people.map((person, i) => {
              const [name, ...rest] = person.split('—')
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold flex-shrink-0">
                    {(name.trim()[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary leading-tight">{name.trim()}</p>
                    {rest.length > 0 && <p className="text-xs text-text-dim">{rest.join('—').trim()}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Sources */}
      {report.raw_sources?.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-4">
          <span className="text-xs text-text-dim">Sources:</span>
          {report.raw_sources.map((s, i) => (
            <a key={i} href={s} target="_blank" rel="noreferrer"
               className="text-xs text-text-dim hover:text-accent transition-colors underline underline-offset-2">
              {s}
            </a>
          ))}
          <span className="text-xs text-text-dim ml-auto">
            Generated {new Date(report.generated_at).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
}
