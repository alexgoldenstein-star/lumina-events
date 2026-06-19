export const ROLES = {
  admin:     { label:'Admin',        color:'bg-warm-100 text-warm-700',       icon:'👑' },
  socia:     { label:'Socia',        color:'bg-purple-100 text-purple-700',    icon:'🤝' },
  empleada:  { label:'Empleada',     color:'bg-blue-100 text-blue-700',        icon:'👩‍💼' },
  mensajera: { label:'Mensajes WA',  color:'bg-emerald-100 text-emerald-700',  icon:'💬' },
  proveedor: { label:'Proveedor',    color:'bg-gold-100 text-gold-700',        icon:'🏢' },
  cliente:   { label:'Cliente',      color:'bg-nude-200 text-ink-600',         icon:'💍' },
}

export const PERMISOS = {
  verEventos:         { label:'Ver eventos',               grupo:'Eventos'         },
  crearEventos:       { label:'Crear / editar eventos',    grupo:'Eventos'         },
  eliminarEventos:    { label:'Eliminar eventos',          grupo:'Eventos'         },
  verInvitados:       { label:'Ver invitados',             grupo:'Invitados'       },
  editarInvitados:    { label:'Agregar / editar invitados',grupo:'Invitados'       },
  exportarInvitados:  { label:'Exportar lista',            grupo:'Invitados'       },
  enviarMensajes:     { label:'Enviar mensajes WA',        grupo:'Mensajes'        },
  verPresupuestos:    { label:'Ver presupuestos',          grupo:'Finanzas'        },
  editarPresupuestos: { label:'Editar presupuestos',       grupo:'Finanzas'        },
  verGastos:          { label:'Ver gastos',                grupo:'Finanzas'        },
  editarGastos:       { label:'Editar gastos',             grupo:'Finanzas'        },
  // verComisiones: NO se ofrece como checkbox a nadie — solo admin, ver bloqueo abajo
  verProveedores:     { label:'Ver proveedores',           grupo:'Proveedores'     },
  editarProveedores:  { label:'Editar proveedores',        grupo:'Proveedores'     },
  verCalendario:      { label:'Ver calendario',            grupo:'Herramientas'    },
  verChecklist:       { label:'Ver checklist',             grupo:'Herramientas'    },
  editarChecklist:    { label:'Editar checklist',          grupo:'Herramientas'    },
  verMesas:           { label:'Ver mesas',                 grupo:'Herramientas'    },
  editarMesas:        { label:'Editar mesas',              grupo:'Herramientas'    },
  verDocumentos:      { label:'Ver documentos',            grupo:'Herramientas'    },
  subirDocumentos:    { label:'Subir documentos',          grupo:'Herramientas'    },
  verClientes:        { label:'Ver clientes (novios)',      grupo:'Administración'  },
  gestionarUsuarios:  { label:'Gestionar usuarios',        grupo:'Administración'  },
  verConfiguracion:   { label:'Configuración',             grupo:'Administración'  },
}

export const PERMISOS_DEFAULT = {
  // Admin: todo + comisiones (la única forma de ver comisiones)
  admin: [...Object.keys(PERMISOS), 'verComisiones'],

  // Socia: acceso amplio PERO NUNCA comisiones
  socia: [
    'verEventos','crearEventos',
    'verInvitados','editarInvitados','exportarInvitados',
    'enviarMensajes',
    'verPresupuestos','editarPresupuestos','verGastos','editarGastos',
    'verProveedores','editarProveedores',
    'verCalendario','verChecklist','editarChecklist',
    'verMesas','editarMesas','verDocumentos','subirDocumentos',
    'verClientes',
  ],

  empleada: [
    'verEventos',
    'verInvitados','editarInvitados','exportarInvitados',
    'enviarMensajes',
    'verCalendario','verChecklist','editarChecklist',
    'verMesas','verDocumentos',
    'verProveedores',
  ],

  mensajera: [
    'verEventos',
    'verInvitados',
    'enviarMensajes',
  ],

  proveedor: [
    'verEventos',
    'verPresupuestos',
  ],

  // Cliente: vista de su propio evento — sin finanzas internas
  cliente: [
    'verEventos',
    'verCalendario',
    'verChecklist',
    'verMesas',
    'verDocumentos',
  ],
}

/**
 * Verifica si un usuario tiene un permiso específico.
 * REGLA DE ORO: 'verComisiones' está bloqueado para TODOS excepto admin,
 * sin importar qué diga el array de permisos personalizado guardado en DB.
 * Esto evita que un admin distraído tilde el checkbox por error.
 */
export function tienePermiso(profile, permiso) {
  if (!profile) return false

  // Bloqueo absoluto de comisiones — solo admin, siempre
  if (permiso === 'verComisiones') {
    return profile.role === 'admin'
  }

  if (profile.role === 'admin') return true

  const permisos = (profile.permisos && profile.permisos.length > 0)
    ? profile.permisos
    : (PERMISOS_DEFAULT[profile.role] || [])
  return permisos.includes(permiso)
}

export function rutasPermitidas(profile) {
  if (!profile) return []
  const t = (p) => tienePermiso(profile, p)
  return [
    { show: true,                   href:'/dashboard',    label:'Dashboard'    },
    { show: t('verEventos'),        href:'/eventos',      label:'Eventos'      },
    { show: t('verCalendario'),     href:'/calendario',   label:'Calendario'   },
    { show: t('enviarMensajes'),    href:'/mensajes',     label:'Mensajes WA'  },
    { show: t('verClientes'),       href:'/clientes',     label:'Clientes'     },
    { show: t('verProveedores'),    href:'/proveedores',  label:'Proveedores'  },
    { show: t('verEventos'),        href:'/vencimientos', label:'Vencimientos' },
    { show: t('verInvitados'),      href:'/restricciones',label:'Restricciones'},
    { show: t('gestionarUsuarios'), href:'/usuarios',     label:'Usuarios'     },
    { show: t('gestionarUsuarios'), href:'/exportar',     label:'Exportar datos'},
    { show: t('verConfiguracion'),  href:'/configuracion',label:'Configuración'},
  ].filter(r => r.show)
}
