import { useState, useRef } from 'react'
import { Upload, X, Loader2, ArrowRight, FileText } from 'lucide-react'
import IntentSelector from './IntentSelector'

function parseURLsFromText(text) {
  return text
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 3)
}

export default function BatchForm({ onSubmit, loading }) {
  const [urlText, setUrlText] = useState('')
  const [intent, setIntent]   = useState('general')
  const [context, setContext] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const urls = parseURLsFromText(urlText)

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setUrlText(e.target.result)
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (urls.length === 0) return
    onSubmit({ urls, intent, user_context: context.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Drop zone / textarea */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
            Company URLs
          </label>
          <div className="flex items-center gap-3">
            {urls.length > 0 && (
              <span className="tag bg-accent/15 text-accent">
                {urls.length} URL{urls.length !== 1 ? 's' : ''}
              </span>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-text-secondary hover:text-accent flex items-center gap-1.5 transition-colors"
            >
              <Upload size={12} />
              Import .txt / .csv
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.csv"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl border transition-all duration-200 ${
            dragging
              ? 'border-accent bg-accent/5'
              : 'border-border'
          }`}
        >
          <textarea
            className="w-full bg-surface rounded-xl px-4 py-3 text-text-primary placeholder-text-dim
                       focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
                       transition-all duration-200 resize-none font-mono text-sm"
            rows={8}
            placeholder={`stripe.com\nnotion.so\nhubspot.com\n\nOne URL per line — or drag & drop a .txt / .csv file`}
            value={urlText}
            onChange={e => setUrlText(e.target.value)}
            disabled={loading}
          />
          {urlText && (
            <button
              type="button"
              onClick={() => setUrlText('')}
              className="absolute top-3 right-3 text-text-dim hover:text-text-primary transition-colors"
            >
              <X size={14} />
            </button>
          )}
          {dragging && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-bg/80 backdrop-blur-sm pointer-events-none">
              <FileText size={32} className="text-accent mb-2" />
              <p className="text-accent font-semibold">Drop file to import</p>
            </div>
          )}
        </div>

        <p className="text-xs text-text-dim mt-2">
          Accepts one URL per line, CSV, or plain text. Each company is analysed in parallel.
        </p>
      </div>

      <IntentSelector value={intent} onChange={setIntent} />

      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
          Your Context
          <span className="normal-case font-normal text-text-dim ml-2">— optional</span>
        </label>
        <textarea
          className="input-base resize-none"
          rows={2}
          placeholder={`e.g. "I'm evaluating these as potential acquisition targets in the HR tech space"`}
          value={context}
          onChange={e => setContext(e.target.value)}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading || urls.length === 0}
        className="btn-primary w-full justify-center py-4 text-base"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analysing {urls.length} companies…
          </>
        ) : (
          <>
            Analyse {urls.length || 0} Companies
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  )
}
