export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50" />

      {/* Liquid blobs */}
      <div className="absolute inset-0 overflow-hidden" style={{ filter: 'blur(80px)' }}>
        <div className="liquid-blob blob-1"
          style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.45), rgba(251,146,60,0.15))' }}
        />
        <div className="liquid-blob blob-2"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.35), rgba(239,68,68,0.1))' }}
        />
        <div className="liquid-blob blob-3"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4), rgba(251,191,36,0.12))' }}
        />
        <div className="liquid-blob blob-4"
          style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.3), rgba(244,114,182,0.08))' }}
        />
        <div className="liquid-blob blob-5"
          style={{ background: 'radial-gradient(circle, rgba(248,113,113,0.3), rgba(248,113,113,0.08))' }}
        />
      </div>

      {/* Subtle noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />
    </div>
  )
}