export default function Logo({ size = 'md' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' }
  return (
    <div className={`flex items-center gap-2.5 font-bold ${sizes[size]}`}>
      <div className="relative">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="5" cy="7" r="3.5" stroke="white" strokeWidth="1.5" />
            <path d="M7.5 7h7M12 4.5l3 2.5-3 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 12l2.5 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald border-2 border-bg" />
      </div>
      <span className="text-text-primary tracking-tight">
        Bizwiz<span className="text-accent">Hack</span>
      </span>
    </div>
  )
}
