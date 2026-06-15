import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'
import PWAInstall from '../ui/PWAInstall'

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Cerrar al navegar
  useEffect(() => setOpen(false), [location.pathname])

  // Bloquear scroll del body cuando sidebar abierto en móvil
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className="flex h-screen overflow-hidden bg-nude-50">

      {/* Overlay móvil */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}/>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setOpen(false)}/>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header móvil */}
        <header className="lg:hidden flex items-center gap-3 px-4 bg-white border-b border-nude-200 flex-shrink-0"
          style={{height:'56px', paddingTop:'env(safe-area-inset-top, 0)'}}>
          <button onClick={() => setOpen(true)}
            className="p-2 -ml-1 rounded-xl hover:bg-nude-100 text-ink-600 transition-colors active:bg-nude-200">
            <Menu size={22}/>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-warm-500 flex items-center justify-center">
              <span className="text-white text-sm font-serif font-bold">L</span>
            </div>
            <span className="font-serif text-lg text-ink-800 leading-none">Lumina</span>
          </div>
        </header>

        {/* Contenido scrolleable */}
        <main className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>

      <PWAInstall/>
    </div>
  )
}
