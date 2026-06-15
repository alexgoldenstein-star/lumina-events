export default function LogoJR({ size = 'md', light = false, className = '' }) {
  const sizes = {
    sm:  { name: 'text-[10px]', sub: 'text-[7px]',  spacing: '0.3em' },
    md:  { name: 'text-xs',     sub: 'text-[8px]',   spacing: '0.35em' },
    lg:  { name: 'text-sm',     sub: 'text-[9px]',   spacing: '0.38em' },
    xl:  { name: 'text-xl',     sub: 'text-[11px]',  spacing: '0.38em' },
    '2xl':{ name: 'text-3xl',   sub: 'text-sm',      spacing: '0.4em'  },
  }
  const s   = sizes[size] || sizes.md
  const col = light ? 'text-white' : 'text-ink-900'
  const sub = light ? 'text-white/60' : 'text-ink-400'

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span
        className={`font-light tracking-widest uppercase ${s.name} ${col}`}
        style={{ fontFamily:'Georgia, "Times New Roman", serif', letterSpacing: s.spacing }}
      >
        JAZMIN ROSENBERG
      </span>
      <span
        className={`tracking-widest uppercase ${s.sub} ${sub} mt-0.5`}
        style={{ letterSpacing: '0.25em' }}
      >
        ORGANIZACIÓN DE EVENTOS
      </span>
    </div>
  )
}
