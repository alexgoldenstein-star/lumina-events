import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, CalendarCheck, MessageCircle, Briefcase,
  UtensilsCrossed, Users, Bell, CalendarDays, Settings,
  LogOut, UserCog, X, Download
} from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { rutasPermitidas } from '../../lib/roles'
import LogoJR from '../ui/LogoJR'

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

export default function Sidebar({ onClose }) {
  const { user, profile, logout, hideComisiones } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() { await logout(); navigate('/login') }

  const effectiveProfile = profile || { role: 'admin' }
  const rutas     = rutasPermitidas(effectiveProfile)
  const bottomH   = ['/configuracion','/usuarios','/exportar']
  const mainNav   = rutas.filter(r => !bottomH.includes(r.href))
  const bottomNav = rutas.filter(r =>  bottomH.includes(r.href))

  const initials = profile?.nombre
    ? profile.nombre.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <aside className="w-60 min-w-60 bg-white border-r border-nude-100 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-nude-100 flex items-center justify-between">
        <LogoJR size="sm"/>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-nude-100 text-ink-400 transition-colors ml-3 flex-shrink-0">
            <X size={16}/>
          </button>
        )}
      </div>

      {hideComisiones && (
        <div className="mx-4 mt-3 text-[10px] text-warm-700 bg-warm-50 border border-warm-200 px-3 py-2 rounded-lg flex items-center gap-1.5">
          🙈 Vista cliente activa — comisiones ocultas
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {mainNav.map(({ href, label }) => {
          const Icon = ICONS[href] || LayoutDashboard
          return (
            <NavLink key={href} to={href} end={href==='/dashboard'}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] tracking-wide transition-all group',
                isActive
                  ? 'bg-nude-100 text-ink-900 font-medium'
                  : 'text-ink-400 hover:bg-nude-50 hover:text-ink-800'
              )}>
              {({ isActive }) => (
                <>
                  <Icon size={15} className={isActive?'text-ink-700':'text-ink-300 group-hover:text-ink-600'}/>
                  {label}
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
                'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] tracking-wide transition-all',
                isActive?'bg-nude-100 text-ink-900 font-medium':'text-ink-400 hover:bg-nude-50 hover:text-ink-800'
              )}>
              <Icon size={14} className="text-ink-300"/> {label}
            </NavLink>
          )
        })}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-ink-400 hover:bg-red-50 hover:text-red-500 transition-all">
          <LogOut size={14} className="text-ink-300"/> Cerrar sesión
        </button>
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
