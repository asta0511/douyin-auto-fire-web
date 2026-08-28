'use client'

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/80 via-orange-100/60 to-rose-100/80" />

      {/* Blob layer with heavy blur for liquid metaball effect */}
      <div className="absolute inset-0" style={{ filter: 'blur(60px)' }}>
        <div className="liquid-blob blob-1"
          style={{ background: 'radial-gradient(circle at 40% 40%, rgba(251,146,60,0.85) 0%, rgba(251,146,60,0.3) 60%)' }}
        />
        <div className="liquid-blob blob-2"
          style={{ background: 'radial-gradient(circle at 60% 60%, rgba(239,68,68,0.8) 0%, rgba(239,68,68,0.25) 60%)' }}
        />
        <div className="liquid-blob blob-3"
          style={{ background: 'radial-gradient(circle at 50% 30%, rgba(251,191,36,0.75) 0%, rgba(251,191,36,0.2) 60%)' }}
        />
        <div className="liquid-blob blob-4"
          style={{ background: 'radial-gradient(circle at 30% 70%, rgba(244,114,182,0.65) 0%, rgba(244,114,182,0.2) 60%)' }}
        />
        <div className="liquid-blob blob-5"
          style={{ background: 'radial-gradient(circle at 70% 30%, rgba(248,113,113,0.7) 0%, rgba(248,113,113,0.2) 60%)' }}
        />
      </div>

      {/* Subtle noise overlay */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />
    </div>
  )
}