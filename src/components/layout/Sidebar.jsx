import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, CalendarCheck, MessageCircle, Briefcase,
  UtensilsCrossed, Users, Bell, CalendarDays, Settings,
  LogOut, Sparkles, EyeOff, UserCog
} from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { rutasPermitidas } from '../../lib/roles'

// Map using /app/* paths to match roles.js
const ICONS = {
  '/app':              LayoutDashboard,
  '/app/eventos':      CalendarCheck,
  '/app/calendario':   CalendarDays,
  '/app/mensajes':     MessageCircle,
  '/app/clientes':     Users,
  '/app/proveedores':  Briefcase,
  '/app/vencimientos': Bell,
  '/app/restricciones':UtensilsCrossed,
  '/app/usuarios':     UserCog,
  '/app/configuracion':Settings,
}

export default function Sidebar() {
  const { user, profile, logout, hideComisiones } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() { await logout(); navigate('/login') }

  const rutas = rutasPermitidas(profile)

  // Fallback: si profile aún no cargó, mostrar nav mínima
  const mainNav   = rutas.filter(r => r.href !== '/app/configuracion' && r.href !== '/app/usuarios')
  const bottomNav = rutas.filter(r => r.href === '/app/configuracion' || r.href === '/app/usuarios')

  const initials = profile?.nombre
    ? profile.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <aside className="w-56 min-w-56 bg-nude-50 border-r border-nude-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-nude-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-warm-500 flex items-center justify-center">
            <Sparkles size={15} className="text-white"/>
          </div>
          <div>
            <div className="font-serif text-lg text-ink-800 leading-tight">Lumina</div>
            <div className="text-[10px] text-ink-400 tracking-widest uppercase">Events</div>
          </div>
        </div>
        {hideComisiones && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-warm-700 bg-warm-100 px-2 py-1 rounded-lg">
            <EyeOff size={10}/> Modo cliente activo
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {mainNav.length === 0 && (
          // Fallback mientras carga el profile
          <div className="px-3 py-2 text-xs text-ink-400">Cargando...</div>
        )}
        {mainNav.map(({ href, label }) => {
          const Icon = ICONS[href] || LayoutDashboard
          return (
            <NavLink key={href} to={href} end={href === '/app'}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-warm-100 text-warm-800 font-medium'
                  : 'text-ink-500 hover:bg-warm-50 hover:text-warm-700'
              )}>
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-warm-600' : 'text-ink-400 group-hover:text-warm-500'}/>
                  {label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-nude-200 space-y-0.5">
        {bottomNav.map(({ href, label }) => {
          const Icon = ICONS[href] || Settings
          return (
            <NavLink key={href} to={href}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-warm-100 text-warm-800 font-medium'
                  : 'text-ink-500 hover:bg-warm-50 hover:text-warm-700'
              )}>
              <Icon size={15} className="text-ink-400"/> {label}
            </NavLink>
          )
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-500 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={15} className="text-ink-400"/> Cerrar sesión
        </button>

        {/* User chip */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-300 to-warm-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-700 truncate">{profile?.nombre || user?.email?.split('@')[0] || 'Usuario'}</p>
            <p className="text-[10px] text-ink-400 truncate capitalize">{profile?.orgName || profile?.role || ''}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
