import { TrendingUp, Handshake, Search, Globe } from 'lucide-react'

const INTENTS = [
  {
    id: 'investment',
    label: 'Investment',
    icon: TrendingUp,
    desc: 'Growth signals, moat, red flags',
    color: 'text-emerald',
    activeBg: 'bg-emerald/10 border-emerald/40',
  },
  {
    id: 'partnership',
    label: 'Partnership',
    icon: Handshake,
    desc: 'Fit, ICP overlap, integration',
    color: 'text-accent',
    activeBg: 'bg-accent/10 border-accent/40',
  },
  {
    id: 'competitive_research',
    label: 'Competitive',
    icon: Search,
    desc: 'Weaknesses, pricing, GTM',
    color: 'text-rose',
    activeBg: 'bg-rose/10 border-rose/40',
  },
  {
    id: 'general',
    label: 'General',
    icon: Globe,
    desc: 'Balanced overview',
    color: 'text-text-secondary',
    activeBg: 'bg-surface border-border',
  },
]

export default function IntentSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
        Analysis Lens
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {INTENTS.map(({ id, label, icon: Icon, desc, color, activeBg }) => {
          const active = value === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`
                flex flex-col gap-1.5 p-3 rounded-xl border text-left
                transition-all duration-200 cursor-pointer
                ${active ? activeBg : 'border-border bg-surface hover:border-text-dim'}
              `}
            >
              <Icon size={16} className={active ? color : 'text-text-dim'} />
              <span className={`text-sm font-semibold ${active ? 'text-text-primary' : 'text-text-secondary'}`}>
                {label}
              </span>
              <span className="text-xs text-text-dim leading-tight">{desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
