import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { get } from 'firebase/database'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { eventoRef } from './lib/db'
import AppLayout from './components/layout/AppLayout'
import { Spinner } from './components/ui'

import Landing        from './pages/Landing'
import { Login, Register } from './pages/Auth'
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
import PanelCliente   from './pages/PanelCliente'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (user) return <Navigate to="/" replace />
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
  if (!evento) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  return <EventoForm evento={evento} />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/landing"  element={<Landing />} />
          <Route path="/cliente"  element={<PanelCliente />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/registro" element={<PublicRoute><Register /></PublicRoute>} />

          {/* App privada */}
          <Route path="/"                   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/eventos"            element={<PrivateRoute><Eventos /></PrivateRoute>} />
          <Route path="/eventos/nuevo"      element={<PrivateRoute><EventoForm /></PrivateRoute>} />
          <Route path="/eventos/:id"        element={<PrivateRoute><EventoDetalle /></PrivateRoute>} />
          <Route path="/eventos/:id/editar" element={<PrivateRoute><EventoDetalleEdit /></PrivateRoute>} />
          <Route path="/mensajes"           element={<PrivateRoute><MensajesGlobal /></PrivateRoute>} />
          <Route path="/proveedores"        element={<PrivateRoute><Proveedores /></PrivateRoute>} />
          <Route path="/restricciones"      element={<PrivateRoute><Restricciones /></PrivateRoute>} />
          <Route path="/clientes"           element={<PrivateRoute><Clientes /></PrivateRoute>} />
          <Route path="/vencimientos"       element={<PrivateRoute><Vencimientos /></PrivateRoute>} />
          <Route path="/configuracion"      element={<PrivateRoute><Configuracion /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
