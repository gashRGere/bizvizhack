import { useEffect, useState } from 'react'

const STEPS = [
  { label: 'Fetching About page…',     delay: 0 },
  { label: 'Fetching Products page…',  delay: 800 },
  { label: 'Fetching Press / News…',   delay: 1600 },
  { label: 'Converting to Markdown…',  delay: 2400 },
  { label: 'Running intelligence AI…', delay: 3200 },
  { label: 'Structuring report…',      delay: 4200 },
]

export default function LoadingState({ companyUrl }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = STEPS.map(({ delay }, i) =>
      setTimeout(() => setStep(i), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  const domain = companyUrl?.replace(/https?:\/\/(www\.)?/, '').split('/')[0] || 'company'

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-fade-up">
      {/* Spinner */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-2 border-border" />
        <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-transparent
                        border-t-accent animate-spin" />
        <div className="absolute inset-3 w-14 h-14 rounded-full border border-accent/20
                        animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-text-primary font-semibold">
          Analysing <span className="text-accent font-mono">{domain}</span>
        </p>
        <p className="text-sm text-text-secondary">{STEPS[step]?.label}</p>
      </div>

      {/* Step progress */}
      <div className="w-64 space-y-2">
        {STEPS.map(({ label }, i) => (
          <div key={i} className={`flex items-center gap-2.5 text-xs transition-all duration-300
            ${i < step ? 'opacity-40' : i === step ? 'opacity-100' : 'opacity-20'}`}>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300
              ${i < step ? 'bg-emerald' : i === step ? 'bg-accent animate-pulse' : 'bg-border'}`} />
            <span className={i === step ? 'text-text-primary' : 'text-text-dim'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
