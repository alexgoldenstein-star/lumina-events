import { clsx } from 'clsx'

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className, disabled, loading, ...props }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border'
  const variants = {
    primary:  'bg-rose-500 text-white border-rose-500 hover:bg-rose-600 hover:border-rose-600',
    outline:  'bg-white text-ink-600 border-ink-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700',
    ghost:    'bg-transparent text-ink-500 border-transparent hover:bg-rose-50 hover:text-rose-700',
    danger:   'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    sage:     'bg-sage-500 text-white border-sage-500 hover:bg-sage-600',
    wa:       'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  }
  const sizes = {
    xs: 'px-2.5 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  }
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, ...props }) {
  return (
    <div className={clsx('bg-white rounded-xl border border-ink-100 overflow-hidden', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className, action }) {
  return (
    <div className={clsx('px-5 py-4 border-b border-ink-100 flex items-center justify-between', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-ink-700">{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function CardBody({ children, className }) {
  return <div className={clsx('p-5', className)}>{children}</div>
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'gray', className }) {
  const variants = {
    green:  'bg-sage-100 text-sage-700',
    amber:  'bg-gold-100 text-gold-700',
    red:    'bg-red-50 text-red-600',
    pink:   'bg-rose-100 text-rose-700',
    gray:   'bg-ink-100 text-ink-500',
    purple: 'bg-purple-100 text-purple-700',
  }
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-ink-500">{label}</label>}
      <input
        className={clsx(
          'w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none transition-colors',
          'border-ink-200 text-ink-800 placeholder-ink-300',
          'focus:border-rose-400 focus:ring-2 focus:ring-rose-100',
          error && 'border-red-300 focus:border-red-400 focus:ring-red-100',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-ink-500">{label}</label>}
      <select
        className={clsx(
          'w-full px-3 py-2 text-sm bg-white border border-ink-200 rounded-lg outline-none transition-colors',
          'text-ink-800 focus:border-rose-400 focus:ring-2 focus:ring-rose-100',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-ink-500">{label}</label>}
      <textarea
        rows={3}
        className={clsx(
          'w-full px-3 py-2 text-sm bg-white border border-ink-200 rounded-lg outline-none transition-colors resize-none',
          'text-ink-800 placeholder-ink-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-8 h-8' }
  return (
    <svg className={clsx('animate-spin text-rose-400', sizes[size])} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      {Icon && <Icon size={40} className="text-ink-200 mb-3" strokeWidth={1.5} />}
      <p className="text-sm font-medium text-ink-500">{title}</p>
      {description && <p className="text-xs text-ink-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className={clsx('bg-white rounded-2xl shadow-xl w-full overflow-hidden', sizes[size])}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
            <h2 className="text-base font-medium text-ink-800">{title}</h2>
            <button onClick={onClose} className="text-ink-400 hover:text-ink-700 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ variant = 'info', children, onDismiss }) {
  const variants = {
    info:    'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-sage-50 text-sage-800 border-sage-200',
    warning: 'bg-gold-50 text-gold-800 border-gold-200',
    danger:  'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <div className={clsx('flex items-center gap-3 px-4 py-3 rounded-lg border text-sm', variants[variant])}>
      <span className="flex-1">{children}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-50 hover:opacity-100">✕</button>
      )}
    </div>
  )
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'rose' }) {
  const pct = Math.round((value / max) * 100)
  const colors = { rose: 'bg-rose-400', sage: 'bg-sage-400', gold: 'bg-gold-400' }
  return (
    <div className="w-full bg-ink-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={clsx('h-full rounded-full transition-all duration-500', colors[color])}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}
