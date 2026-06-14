/**
 * Sistema de roles y permisos — Lumina Events
 *
 * Roles disponibles:
 * - admin:     Dueña / administradora completa
 * - socia:     Acceso casi total, sin configuración ni usuarios
 * - empleada:  Acceso a eventos asignados, sin finanzas
 * - mensajera: Solo mensajes WA e invitados
 * - proveedor: Solo ve sus presupuestos y los eventos asignados
 * - cliente:   Panel cliente (novios/familia) — usa PanelCliente.jsx aparte
 */

export const ROLES = {
  admin:     { label: 'Admin',           color: 'bg-rose-100 text-rose-700',   icon: '👑' },
  socia:     { label: 'Socia',           color: 'bg-purple-100 text-purple-700', icon: '🤝' },
  empleada:  { label: 'Empleada',        color: 'bg-blue-100 text-blue-700',   icon: '👩‍💼' },
  mensajera: { label: 'Mensajes WA',     color: 'bg-emerald-100 text-emerald-700', icon: '💬' },
  proveedor: { label: 'Proveedor',       color: 'bg-gold-100 text-gold-700',   icon: '🏢' },
}

/**
 * Permisos disponibles en la app
 */
export const PERMISOS = {
  // Eventos
  verEventos:        { label: 'Ver eventos',              grupo: 'Eventos'       },
  crearEventos:      { label: 'Crear / editar eventos',   grupo: 'Eventos'       },
  eliminarEventos:   { label: 'Eliminar eventos',         grupo: 'Eventos'       },

  // Invitados
  verInvitados:      { label: 'Ver invitados',            grupo: 'Invitados'     },
  editarInvitados:   { label: 'Agregar / editar invitados', grupo: 'Invitados'  },
  exportarInvitados: { label: 'Exportar lista',           grupo: 'Invitados'     },

  // Mensajes
  enviarMensajes:    { label: 'Enviar mensajes WA',       grupo: 'Mensajes'      },

  // Finanzas (oculto a roles no financieros)
  verPresupuestos:   { label: 'Ver presupuestos',         grupo: 'Finanzas'      },
  editarPresupuestos:{ label: 'Editar presupuestos',      grupo: 'Finanzas'      },
  verGastos:         { label: 'Ver gastos',               grupo: 'Finanzas'      },
  editarGastos:      { label: 'Editar gastos',            grupo: 'Finanzas'      },
  verComisiones:     { label: 'Ver comisiones',           grupo: 'Finanzas'      },

  // Proveedores
  verProveedores:    { label: 'Ver proveedores',          grupo: 'Proveedores'   },
  editarProveedores: { label: 'Editar proveedores',       grupo: 'Proveedores'   },

  // Herramientas
  verCalendario:     { label: 'Ver calendario',           grupo: 'Herramientas'  },
  verChecklist:      { label: 'Ver checklist',            grupo: 'Herramientas'  },
  editarChecklist:   { label: 'Editar checklist',         grupo: 'Herramientas'  },
  verMesas:          { label: 'Ver layout de mesas',      grupo: 'Herramientas'  },
  editarMesas:       { label: 'Editar mesas',             grupo: 'Herramientas'  },
  verDocumentos:     { label: 'Ver documentos',           grupo: 'Herramientas'  },
  subirDocumentos:   { label: 'Subir documentos',         grupo: 'Herramientas'  },

  // Admin
  verClientes:       { label: 'Ver clientes (novios)',    grupo: 'Administración' },
  gestionarUsuarios: { label: 'Gestionar usuarios',       grupo: 'Administración' },
  verConfiguracion:  { label: 'Configuración',            grupo: 'Administración' },
}

/**
 * Permisos por defecto de cada rol
 */
export const PERMISOS_DEFAULT = {
  admin: Object.keys(PERMISOS), // todo

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
 * Verificar si un usuario tiene un permiso
 */
export function tienePermiso(profile, permiso) {
  if (!profile) return false
  if (profile.role === 'admin') return true // admin siempre tiene todo
  // Si tiene permisos personalizados, usarlos
  const permisos = profile.permisos || PERMISOS_DEFAULT[profile.role] || []
  return permisos.includes(permiso)
}

/**
 * Rutas permitidas por rol (para el sidebar)
 */
export function rutasPermitidas(profile) {
  if (!profile) return []
  const t = (p) => tienePermiso(profile, p)
  return [
    { show: true,                  href:'/app',              label:'Dashboard'    },
    { show: t('verEventos'),       href:'/app/eventos',       label:'Eventos'      },
    { show: t('verCalendario'),    href:'/app/calendario',    label:'Calendario'   },
    { show: t('enviarMensajes'),   href:'/app/mensajes',      label:'Mensajes WA'  },
    { show: t('verClientes'),      href:'/app/clientes',      label:'Clientes'     },
    { show: t('verProveedores'),   href:'/app/proveedores',   label:'Proveedores'  },
    { show: t('verEventos'),       href:'/app/vencimientos',  label:'Vencimientos' },
    { show: t('verInvitados'),     href:'/app/restricciones', label:'Restricciones'},
    { show: t('gestionarUsuarios'),href:'/app/usuarios',      label:'Usuarios'     },
    { show: t('verConfiguracion'), href:'/app/configuracion', label:'Configuración'},
  ].filter(r => r.show)
}
