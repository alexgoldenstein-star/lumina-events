import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, CalendarCheck, Users, MessageCircle,
  Briefcase, Receipt, FileText, Settings, LogOut, Sparkles
} from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

const navItems = [
  { label: 'Dashboard',    href: '/',              icon: LayoutDashboard },
  { label: 'Eventos',      href: '/eventos',        icon: CalendarCheck },
  { label: 'Invitados',    href: '/invitados',      icon: Users },
  { label: 'Mensajes WA',  href: '/mensajes',       icon: MessageCircle },
  { label: 'Proveedores',  href: '/proveedores',    icon: Briefcase },
  { label: 'Presupuestos', href: '/presupuestos',   icon: Receipt },
  { label: 'Documentos',   href: '/documentos',     icon: FileText },
]

export default function Sidebar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const initials = profile?.nombre
    ? profile.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <aside className="w-56 min-w-56 bg-white border-r border-ink-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-ink-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div className="font-serif text-lg text-ink-800 leading-tight">Lumina</div>
            <div className="text-[10px] text-ink-400 tracking-widest uppercase">Events</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group',
              isActive
                ? 'bg-rose-50 text-rose-700 font-medium'
                : 'text-ink-500 hover:bg-rose-50 hover:text-rose-600'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={clsx(isActive ? 'text-rose-500' : 'text-ink-400 group-hover:text-rose-400')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-ink-100 space-y-1">
        <NavLink
          to="/configuracion"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
        >
          <Settings size={16} className="text-ink-400" />
          Configuración
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={16} className="text-ink-400" />
          Cerrar sesión
        </button>
        <div className="flex items-center gap-3 px-3 py-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-rose-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-700 truncate">{profile?.nombre || 'Usuario'}</p>
            <p className="text-[10px] text-ink-400 truncate">{profile?.orgName || ''}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
