import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu, X } from 'lucide-react'
import PWAInstall from '../ui/PWAInstall'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Cerrar sidebar al navegar en móvil
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-nude-50">

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — siempre visible en desktop, slide-in en móvil */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)}/>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar móvil */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-nude-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-nude-100 text-ink-600 transition-colors"
          >
            <Menu size={22}/>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-warm-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold font-serif">L</span>
            </div>
            <span className="font-serif text-lg text-ink-800">Lumina</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <PWAInstall/>
    </div>
  )
}
