import { useState } from 'react'
import { Globe, ArrowRight, Loader2 } from 'lucide-react'
import IntentSelector from './IntentSelector'

export default function AnalysisForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('')
  const [intent, setIntent] = useState('general')
  const [context, setContext] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url.trim()) return
    onSubmit({ company_url: url.trim(), intent, user_context: context.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* URL input */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
          Company Website
        </label>
        <div className="relative">
          <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            className="input-base pl-10 pr-4 text-base"
            placeholder="stripe.com  or  https://stripe.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>
      </div>

      {/* Intent */}
      <IntentSelector value={intent} onChange={setIntent} />

      {/* Optional context */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
          Your Context
          <span className="normal-case font-normal text-text-dim ml-2">— optional, sharpens the analysis</span>
        </label>
        <textarea
          className="input-base resize-none"
          rows={2}
          placeholder={`e.g. "I'm a Series B VC focused on B2B SaaS infrastructure in Europe"`}
          value={context}
          onChange={e => setContext(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="btn-primary w-full justify-center py-4 text-base"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analysing company…
          </>
        ) : (
          <>
            Generate Intelligence Report
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  )
}
