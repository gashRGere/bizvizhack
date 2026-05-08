import { useState } from 'react'
import { GitBranch, Layers, FileSearch } from 'lucide-react'
import Logo from './components/Logo'
import AnalysisForm from './components/AnalysisForm'
import BatchForm from './components/BatchForm'
import ReportView from './components/ReportView'
import BatchGrid from './components/BatchGrid'
import LoadingState from './components/LoadingState'
import { analyzeCompanySafe, analyzeBatch } from './utils/api'

const MODE_SINGLE = 'single'
const MODE_BATCH  = 'batch'

const VIEW_HOME   = 'home'
const VIEW_LOAD   = 'loading'
const VIEW_REPORT = 'report'
const VIEW_BATCH  = 'batch_results'

export default function App() {
  const [mode, setMode]             = useState(MODE_SINGLE)
  const [view, setView]             = useState(VIEW_HOME)
  const [report, setReport]         = useState(null)
  const [batchReports, setBatchReports] = useState([])
  const [currentUrl, setCurrentUrl] = useState('')
  const [error, setError]           = useState(null)

  const handleSingleSubmit = async (params) => {
    setError(null)
    setCurrentUrl(params.company_url)
    setView(VIEW_LOAD)
    try {
      const result = await analyzeCompanySafe(params)
      setReport(result)
      setView(VIEW_REPORT)
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Analysis failed. Check the URL and try again.')
      setView(VIEW_HOME)
    }
  }

  const handleBatchSubmit = async ({ urls, intent, user_context }) => {
    setError(null)
    setCurrentUrl(`${urls.length} companies`)
    setView(VIEW_LOAD)
    try {
      const results = await analyzeBatch(urls, intent, user_context)
      setBatchReports(results)
      setView(VIEW_BATCH)
    } catch (e) {
      setError(e.message || 'Batch analysis failed.')
      setView(VIEW_HOME)
    }
  }

  const handleBack = () => {
    setView(VIEW_HOME)
    setReport(null)
    setBatchReports([])
    setError(null)
  }

  return (
    <div className="min-h-screen bg-bg grid-bg">
      {/* Nav */}
      <nav className="border-b border-border bg-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={handleBack}>
            <Logo size="sm" />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-dim hidden sm:block">B2B Intelligence Platform</span>
            <a href="https://github.com" target="_blank" rel="noreferrer"
               className="text-text-dim hover:text-text-primary transition-colors">
              <GitBranch size={16} />
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-10">

        {view === VIEW_LOAD && (
          <LoadingState companyUrl={currentUrl} />
        )}

        {view === VIEW_REPORT && report && (
          <ReportView report={report} onBack={handleBack} />
        )}

        {view === VIEW_BATCH && (
          <BatchGrid reports={batchReports} onBack={handleBack} />
        )}

        {view === VIEW_HOME && (
          <div className="max-w-2xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-10 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                              bg-accent/10 border border-accent/20 text-xs text-accent font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Powered by Claude AI
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight leading-tight mb-4">
                Turn any company website
                <br />
                <span className="text-accent">into actionable intelligence</span>
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
                BizwizHack scrapes, structures, and interprets company data for investors,
                BD teams, and competitive analysts.
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center bg-surface border border-border rounded-xl p-1 mb-6">
              {[
                { id: MODE_SINGLE, icon: FileSearch, label: 'Single Company' },
                { id: MODE_BATCH,  icon: Layers,     label: 'Batch Analysis' },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm
                              font-semibold transition-all duration-200
                              ${mode === id
                                ? 'bg-accent text-white shadow-sm'
                                : 'text-text-secondary hover:text-text-primary'}`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-rose/10 border border-rose/20 text-sm text-rose">
                {error}
              </div>
            )}

            {/* Form card */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              {mode === MODE_SINGLE
                ? <AnalysisForm onSubmit={handleSingleSubmit} loading={false} />
                : <BatchForm    onSubmit={handleBatchSubmit}  loading={false} />
              }
            </div>

            {/* Feature tiles */}
            <div className="grid grid-cols-3 gap-4 mt-8 text-center">
              {[
                { emoji: '⚡', label: 'Parallel crawlers',  sub: 'About · Products · Press' },
                { emoji: '🧠', label: 'AI inference',        sub: 'Insight, not just data'   },
                { emoji: '📄', label: 'PDF export',          sub: 'One-click branded report' },
              ].map(({ emoji, label, sub }) => (
                <div key={label} className="p-4 rounded-xl border border-border bg-surface">
                  <div className="text-2xl mb-2">{emoji}</div>
                  <p className="text-xs font-semibold text-text-primary">{label}</p>
                  <p className="text-xs text-text-dim mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
