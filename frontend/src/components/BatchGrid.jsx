import { useState } from 'react'
import { Download, ChevronDown, ChevronUp, AlertCircle, ExternalLink } from 'lucide-react'
import ScoreRing from './ScoreRing'
import ReportView from './ReportView'
import { exportReportPDF } from '../utils/pdf'

function ScoreBar({ score }) {
  const color =
    score >= 8 ? 'bg-emerald' :
    score >= 5 ? 'bg-accent' : 'bg-rose'
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
      <span className={`text-sm font-bold tabular-nums
        ${score >= 8 ? 'text-emerald' : score >= 5 ? 'text-accent' : 'text-rose'}`}>
        {score}/10
      </span>
    </div>
  )
}

function CompanyCard({ report, rank, onViewFull }) {
  const [expanded, setExpanded] = useState(false)

  if (report._error) {
    return (
      <div className="bg-card border border-rose/20 rounded-2xl p-5 flex items-center gap-3">
        <AlertCircle size={16} className="text-rose flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-text-primary">{report._url}</p>
          <p className="text-xs text-rose mt-0.5">{report._error}</p>
        </div>
      </div>
    )
  }

  const c = report.company
  const sa = report.strategic_analysis

  return (
    <div className={`bg-card border rounded-2xl overflow-hidden card-glow transition-all duration-200
      ${expanded ? 'border-accent/40' : 'border-border'}`}>
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank */}
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center
                          text-xs font-bold text-text-dim flex-shrink-0">
            {rank}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-text-primary truncate">{c.name}</h3>
              <a href={report._url || report.raw_sources?.[0]} target="_blank" rel="noreferrer"
                 className="text-text-dim hover:text-accent transition-colors flex-shrink-0">
                <ExternalLink size={13} />
              </a>
            </div>
            <p className="text-xs text-text-dim mb-3">{c.industry}</p>
            <ScoreBar score={sa.strategic_fit_score} />
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => exportReportPDF(report)}
              className="p-2 rounded-lg border border-border text-text-dim hover:text-accent hover:border-accent
                         transition-all duration-200"
              title="Export PDF"
            >
              <Download size={14} />
            </button>
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-2 rounded-lg border border-border text-text-dim hover:text-accent hover:border-accent
                         transition-all duration-200"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Headline always visible */}
        <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-2 ml-12">
          {sa.headline}
        </p>
      </div>

      {/* Expanded full report */}
      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-1">
          <ReportView report={report} onBack={() => setExpanded(false)} />
        </div>
      )}
    </div>
  )
}

export default function BatchGrid({ reports, onBack }) {
  const sorted = [...reports].sort(
    (a, b) => (b.strategic_analysis?.strategic_fit_score ?? 0) - (a.strategic_analysis?.strategic_fit_score ?? 0)
  )

  const avgScore = reports
    .filter(r => r.strategic_analysis)
    .reduce((acc, r) => acc + r.strategic_analysis.strategic_fit_score, 0) / reports.length

  return (
    <div className="animate-fade-up space-y-5">
      {/* Summary bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Batch Results
            <span className="ml-3 text-sm font-normal text-text-secondary">
              {reports.length} companies analysed
            </span>
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Sorted by strategic fit score · Avg score: <strong className="text-accent">{avgScore.toFixed(1)}/10</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => sorted.filter(r => !r._error).forEach(r => exportReportPDF(r))}
            className="btn-ghost text-sm"
          >
            <Download size={15} />
            Export All PDFs
          </button>
          <button onClick={onBack} className="btn-ghost text-sm">
            New Analysis
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Strong Fit (8–10)', value: reports.filter(r => r.strategic_analysis?.strategic_fit_score >= 8).length, color: 'text-emerald' },
          { label: 'Moderate (5–7)', value: reports.filter(r => { const s = r.strategic_analysis?.strategic_fit_score; return s >= 5 && s < 8 }).length, color: 'text-accent' },
          { label: 'Low Fit (1–4)', value: reports.filter(r => r.strategic_analysis?.strategic_fit_score < 5).length, color: 'text-rose' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-text-dim mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {sorted.map((report, i) => (
          <CompanyCard key={i} report={report} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
