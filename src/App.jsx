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

function PrivateRoute({ children, permiso }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg"/></div>
  if (!user) return <Navigate to="/login" replace/>
  if (permiso && !tienePermiso(profile, permiso)) {
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
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg"/></div>
  if (user) return <Navigate to="/" replace/>
  return children
}

function EventoDetalleEdit() {
  const { id } = useParams()
  const { user } = useAuth()
  const [evento, setEvento] = useState(null)
  useEffect(() => {
    if (!user || !id) return
    get(eventoRef(user.uid, id)).then(snap => { if (snap.exists()) setEvento(snap.val()) })
  }, [user, id])
  if (!evento) return <div className="flex items-center justify-center h-64"><Spinner size="lg"/></div>
  return <EventoForm evento={evento}/>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/"         element={<Landing/>}/>
          <Route path="/cliente"  element={<PanelCliente/>}/>
          <Route path="/invitar/:code" element={<Invitar/>}/>
          <Route path="/login"    element={<PublicRoute><Login/></PublicRoute>}/>
          <Route path="/registro" element={<PublicRoute><Register/></PublicRoute>}/>

          {/* App privada */}
          <Route path="/app"                element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
          <Route path="/app/eventos"        element={<PrivateRoute permiso="verEventos"><Eventos/></PrivateRoute>}/>
          <Route path="/app/eventos/nuevo"  element={<PrivateRoute permiso="crearEventos"><EventoForm/></PrivateRoute>}/>
          <Route path="/app/eventos/:id"    element={<PrivateRoute permiso="verEventos"><EventoDetalle/></PrivateRoute>}/>
          <Route path="/app/eventos/:id/editar" element={<PrivateRoute permiso="crearEventos"><EventoDetalleEdit/></PrivateRoute>}/>
          <Route path="/app/mensajes"       element={<PrivateRoute permiso="enviarMensajes"><MensajesGlobal/></PrivateRoute>}/>
          <Route path="/app/proveedores"    element={<PrivateRoute permiso="verProveedores"><Proveedores/></PrivateRoute>}/>
          <Route path="/app/restricciones"  element={<PrivateRoute permiso="verInvitados"><Restricciones/></PrivateRoute>}/>
          <Route path="/app/clientes"       element={<PrivateRoute permiso="verClientes"><Clientes/></PrivateRoute>}/>
          <Route path="/app/vencimientos"   element={<PrivateRoute permiso="verEventos"><Vencimientos/></PrivateRoute>}/>
          <Route path="/app/calendario"     element={<PrivateRoute permiso="verCalendario"><Calendario/></PrivateRoute>}/>
          <Route path="/app/usuarios"       element={<PrivateRoute permiso="gestionarUsuarios"><Usuarios/></PrivateRoute>}/>
          <Route path="/app/configuracion"  element={<PrivateRoute permiso="verConfiguracion"><Configuracion/></PrivateRoute>}/>

          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
