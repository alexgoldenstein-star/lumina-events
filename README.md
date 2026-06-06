# Lumina Events 🌸

Plataforma completa para organizadoras de eventos. Gestión de invitados, mensajes WhatsApp, proveedores, presupuestos y documentos.

## Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend/Auth/DB**: Firebase (Auth + Realtime DB + Storage)
- **Deploy**: Vercel
- **Excel import**: SheetJS (cliente)
- **WhatsApp**: Links `wa.me` con mensajes prellenados (sin costo)

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/TU_USUARIO/lumina-events.git
cd lumina-events
npm install
```

### 2. Crear proyecto Firebase

1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Crear proyecto nuevo → nombrar "lumina-events"
3. Agregar app web → copiar la config
4. Habilitar **Authentication** → Sign-in method → Email/Password → Activar
5. Habilitar **Realtime Database** → Crear base de datos → Modo de prueba
6. Habilitar **Storage** → Comenzar en modo de prueba

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Completar `.env` con los datos del proyecto Firebase.

### 4. Reglas de Firebase Realtime Database

En Firebase Console → Realtime Database → Reglas, pegar:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

### 5. Reglas de Firebase Storage

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{uid}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

### 6. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## Deploy en Vercel

### Opción A — GitHub + Vercel (recomendado)

1. Subir repo a GitHub
2. Ir a [vercel.com](https://vercel.com) → New Project → importar el repo
3. Framework preset: **Vite**
4. En "Environment Variables", agregar todas las del `.env`
5. Deploy ✓

### Opción B — CLI

```bash
npm install -g vercel
vercel --prod
```

## Estructura del proyecto

```
lumina-events/
├── src/
│   ├── components/
│   │   ├── layout/       → Sidebar, AppLayout, PageHeader
│   │   └── ui/           → Button, Card, Input, Modal, Badge...
│   ├── lib/
│   │   ├── firebase.js   → Firebase app init
│   │   ├── AuthContext   → Auth provider + hook
│   │   ├── db.js         → Todos los CRUD de Firebase
│   │   ├── whatsapp.js   → Generación de links y mensajes WA
│   │   └── excel.js      → Import/parse de Excel con SheetJS
│   ├── pages/
│   │   ├── Auth.jsx          → Login + Registro
│   │   ├── Dashboard.jsx     → Resumen general
│   │   ├── Eventos.jsx       → Lista de eventos
│   │   ├── EventoForm.jsx    → Crear / Editar evento
│   │   ├── EventoDetalle.jsx → Vista por tabs del evento
│   │   ├── Invitados.jsx     → Gestión de invitados + estados
│   │   ├── MensajesWA.jsx    → Agenda y cola de mensajes WA
│   │   ├── Proveedores.jsx   → Directorio de proveedores
│   │   ├── Presupuesto.jsx   → Costos y comisiones
│   │   └── Documentos.jsx    → Archivos del evento (Firebase Storage)
│   ├── styles/global.css
│   ├── App.jsx               → Router principal
│   └── main.jsx
├── api/
│   └── parse-excel.js        → Serverless function (Vercel)
├── vercel.json
└── .env.example
```

## Funcionalidades

- ✅ Login / Registro con Firebase Auth
- ✅ Dashboard con stats y alertas
- ✅ CRUD completo de eventos (boda, cumpleaños, corporativo)
- ✅ Import de invitados desde Excel (.xlsx, .xls, .csv)
- ✅ Agregar invitados manualmente
- ✅ Estados: Pendiente / Confirmado / No asiste
- ✅ Detección automática de sin respuesta +72hs
- ✅ Generación de mensajes WA prellenados (4 tipos)
- ✅ Botón "Abrir en WhatsApp" → link `wa.me`
- ✅ Cola de mensajes pendientes con alertas
- ✅ Directorio de proveedores con categoría, rating, comisión
- ✅ Presupuesto por evento con cálculo automático de comisiones
- ✅ Upload de documentos a Firebase Storage
- ✅ Datos separados por usuario (multi-tenant)
- ✅ Responsive y elegante (DM Serif + DM Sans)

## Próximas features

- [ ] Portal público para proveedores
- [ ] Exportar lista de invitados a PDF
- [ ] Notificaciones push para recordatorios
- [ ] Multi-organizadora (equipo)
- [ ] Landing page de venta del producto
