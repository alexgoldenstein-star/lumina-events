export const ROLES = {
  admin:     { label:'Admin',        color:'bg-warm-100 text-warm-700',       icon:'👑' },
  socia:     { label:'Socia',        color:'bg-purple-100 text-purple-700',    icon:'🤝' },
  empleada:  { label:'Empleada',     color:'bg-blue-100 text-blue-700',        icon:'👩‍💼' },
  mensajera: { label:'Mensajes WA',  color:'bg-emerald-100 text-emerald-700',  icon:'💬' },
  proveedor: { label:'Proveedor',    color:'bg-gold-100 text-gold-700',        icon:'🏢' },
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
  verComisiones:      { label:'Ver comisiones',            grupo:'Finanzas'        },
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
  admin: Object.keys(PERMISOS),

  socia: [
    'verEventos','crearEventos',
    'verInvitados','editarInvitados','exportarInvitados',
    'enviarMensajes',
    'verPresupuestos','editarPresupuestos','verGastos','editarGastos','verComisiones',
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
}

/**
 * Verifica si un usuario tiene un permiso específico.
 * - Admin siempre tiene todo
 * - Otros roles: verificar array permisos (personalizado o default del rol)
 */
export function tienePermiso(profile, permiso) {
  if (!profile) return false
  // Admin tiene acceso a todo sin restricciones
  if (profile.role === 'admin') return true
  // Para otros roles, verificar array de permisos
  // Usar permisos personalizados si existen, sino los del rol por defecto
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
    { show: t('verConfiguracion'),  href:'/configuracion',label:'Configuración'},
  ].filter(r => r.show)
}
