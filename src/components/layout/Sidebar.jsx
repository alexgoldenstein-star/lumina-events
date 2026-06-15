import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, CalendarCheck, MessageCircle, Briefcase,
  UtensilsCrossed, Users, Bell, CalendarDays, Settings,
  LogOut, UserCog, X, Download
} from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { rutasPermitidas } from '../../lib/roles'

const ICONS = {
  '/dashboard':     LayoutDashboard,
  '/eventos':       CalendarCheck,
  '/calendario':    CalendarDays,
  '/mensajes':      MessageCircle,
  '/clientes':      Users,
  '/proveedores':   Briefcase,
  '/vencimientos':  Bell,
  '/restricciones': UtensilsCrossed,
  '/usuarios':      UserCog,
  '/exportar':      Download,
  '/configuracion': Settings,
}

// Logo tipográfico de JR — replica el estilo del logo real
function LogoJR() {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-light tracking-[0.25em] text-ink-900 uppercase"
        style={{fontFamily:'Georgia, serif', letterSpacing:'0.22em'}}>
        JAZMIN ROSENBERG
      </span>
      <span className="text-[8px] tracking-[0.2em] text-ink-400 uppercase mt-0.5"
        style={{letterSpacing:'0.2em'}}>
        ORGANIZACIÓN DE EVENTOS
      </span>
    </div>
  )
}

export default function Sidebar({ onClose }) {
  const { user, profile, logout, hideComisiones } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() { await logout(); navigate('/login') }

  const effectiveProfile = profile || { role: 'admin' }
  const rutas = rutasPermitidas(effectiveProfile)

  // Separar nav principal de bottom items
  const bottomHrefs = ['/configuracion', '/usuarios', '/exportar']
  const mainNav  = rutas.filter(r => !bottomHrefs.includes(r.href))
  const bottomNav= rutas.filter(r => bottomHrefs.includes(r.href))

  const initials = profile?.nombre
    ? profile.nombre.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <aside className="w-60 min-w-60 bg-white border-r border-nude-200 flex flex-col h-screen shadow-sm">
      {/* Header con logo */}
      <div className="px-5 py-5 border-b border-nude-100 flex items-center justify-between">
        <LogoJR/>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-nude-100 text-ink-500 transition-colors ml-2 flex-shrink-0">
            <X size={16}/>
          </button>
        )}
      </div>

      {hideComisiones && (
        <div className="mx-4 mt-2 flex items-center gap-1.5 text-[10px] text-warm-700 bg-warm-100 px-2.5 py-1.5 rounded-lg">
          <span>🙈</span> Modo cliente activo
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {mainNav.map(({ href, label }) => {
          const Icon = ICONS[href] || LayoutDashboard
          return (
            <NavLink key={href} to={href} end={href==='/dashboard'}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group',
                isActive
                  ? 'bg-nude-100 text-ink-900 font-medium'
                  : 'text-ink-400 hover:bg-nude-50 hover:text-ink-800'
              )}>
              {({ isActive }) => (
                <>
                  <Icon size={15} className={isActive ? 'text-ink-700' : 'text-ink-300 group-hover:text-ink-600'}/>
                  <span className="text-[13px] tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-nude-100 space-y-0.5">
        {bottomNav.map(({ href, label }) => {
          const Icon = ICONS[href] || Settings
          return (
            <NavLink key={href} to={href}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all tracking-wide',
                isActive ? 'bg-nude-100 text-ink-900 font-medium' : 'text-ink-400 hover:bg-nude-50 hover:text-ink-800'
              )}>
              <Icon size={14} className="text-ink-300"/> {label}
            </NavLink>
          )
        })}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-ink-400 hover:bg-red-50 hover:text-red-500 transition-all tracking-wide">
          <LogOut size={14} className="text-ink-300"/> Cerrar sesión
        </button>

        {/* User chip */}
        <div className="flex items-center gap-3 px-2 py-3 mt-1 border-t border-nude-100">
          <div className="w-8 h-8 rounded-full bg-nude-200 flex items-center justify-center text-ink-600 text-xs font-medium flex-shrink-0 border border-nude-300">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-700 truncate">{profile?.nombre||user?.email?.split('@')[0]||'Usuario'}</p>
            <p className="text-[10px] text-ink-400 truncate capitalize">{profile?.role||''}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
