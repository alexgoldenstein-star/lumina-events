import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { get } from 'firebase/database'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { tienePermiso } from './lib/roles'
import { eventoRef } from './lib/db'
import AppLayout from './components/layout/AppLayout'
import { Spinner } from './components/ui'

import Landing        from './pages/Landing'
import { Login, Register } from './pages/Auth'
import Invitar        from './pages/Invitar'
import Dashboard      from './pages/Dashboard'
import Eventos        from './pages/Eventos'
import EventoForm     from './pages/EventoForm'
import EventoDetalle  from './pages/EventoDetalle'
import MensajesGlobal from './pages/MensajesGlobal'
import Proveedores    from './pages/Proveedores'
import Restricciones  from './pages/Restricciones'
import Configuracion  from './pages/Configuracion'
import Clientes       from './pages/Clientes'
import Vencimientos   from './pages/Vencimientos'
import Calendario     from './pages/Calendario'
import Usuarios       from './pages/Usuarios'
import PanelCliente   from './pages/PanelCliente'
import Setup          from './pages/Setup'

function PrivateRoute({ children, permiso }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-nude-50">
      <Spinner size="lg"/>
    </div>
  )
  if (!user) return <Navigate to="/login" replace/>
  if (permiso && profile && !tienePermiso(profile, permiso)) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="text-4xl">🔒</div>
          <p className="text-ink-500 text-sm">No tenés permiso para ver esta sección</p>
        </div>
      </AppLayout>
    )
  }
  return <AppLayout>{children}</AppLayout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-nude-50">
      <Spinner size="lg"/>
    </div>
  )
  if (user) return <Navigate to="/dashboard" replace/>
  return children
}

// Editar evento — carga el evento y pasa al form
function EventoEditPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [evento, setEvento] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!user?.uid || !id) return
    get(eventoRef(user.uid, id)).then(snap => {
      if (snap.exists()) setEvento(snap.val())
      else setNotFound(true)
    })
  }, [user?.uid, id])

  if (notFound) return <Navigate to="/eventos" replace/>
  if (!evento)  return <div className="flex items-center justify-center h-64"><Spinner size="lg"/></div>
  return <EventoForm evento={evento}/>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Rutas públicas ───────────────────────────────── */}
          <Route path="/"              element={<Landing/>}/>
          <Route path="/cliente"       element={<PanelCliente/>}/>
          <Route path="/setup"         element={<Setup/>}/>
          <Route path="/invitar/:code" element={<Invitar/>}/>
          <Route path="/login"         element={<PublicRoute><Login/></PublicRoute>}/>
          <Route path="/registro"      element={<PublicRoute><Register/></PublicRoute>}/>

          {/* ── Rutas privadas ───────────────────────────────── */}
          <Route path="/dashboard"     element={<PrivateRoute><Dashboard/></PrivateRoute>}/>

          {/* Eventos — orden importa: más específicas primero */}
          <Route path="/eventos/nuevo"
            element={<PrivateRoute permiso="crearEventos"><EventoForm/></PrivateRoute>}/>
          <Route path="/eventos/:id/editar"
            element={<PrivateRoute permiso="crearEventos"><EventoEditPage/></PrivateRoute>}/>
          <Route path="/eventos/:id"
            element={<PrivateRoute permiso="verEventos"><EventoDetalle/></PrivateRoute>}/>
          <Route path="/eventos"
            element={<PrivateRoute permiso="verEventos"><Eventos/></PrivateRoute>}/>

          <Route path="/mensajes"
            element={<PrivateRoute permiso="enviarMensajes"><MensajesGlobal/></PrivateRoute>}/>
          <Route path="/proveedores"
            element={<PrivateRoute permiso="verProveedores"><Proveedores/></PrivateRoute>}/>
          <Route path="/restricciones"
            element={<PrivateRoute permiso="verInvitados"><Restricciones/></PrivateRoute>}/>
          <Route path="/clientes"
            element={<PrivateRoute permiso="verClientes"><Clientes/></PrivateRoute>}/>
          <Route path="/vencimientos"
            element={<PrivateRoute permiso="verEventos"><Vencimientos/></PrivateRoute>}/>
          <Route path="/calendario"
            element={<PrivateRoute permiso="verCalendario"><Calendario/></PrivateRoute>}/>
          <Route path="/usuarios"
            element={<PrivateRoute permiso="gestionarUsuarios"><Usuarios/></PrivateRoute>}/>
          <Route path="/configuracion"
            element={<PrivateRoute permiso="verConfiguracion"><Configuracion/></PrivateRoute>}/>

          {/* Rutas desconocidas — si está logueado va al dashboard, sino a login */}
          <Route path="*" element={<RedirectSmart/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function RedirectSmart() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg"/></div>
  return <Navigate to={user ? "/dashboard" : "/login"} replace/>
}
