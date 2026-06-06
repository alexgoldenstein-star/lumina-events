export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="bg-white border-b border-ink-100 px-7 py-5 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-serif text-ink-800">{title}</h1>
        {subtitle && <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
