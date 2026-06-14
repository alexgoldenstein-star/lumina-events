import { Link } from 'react-router-dom'
import { Heart, Star, ArrowRight, Check, Instagram, MessageCircle,
  Camera, Music, Flower, ChefHat, Sparkles, Users, Calendar, Shield } from 'lucide-react'

const TIPOS_EVENTOS = [
  { icon:'💒', label:'Bodas',            desc:'Coordinación integral del día más especial' },
  { icon:'🎂', label:'15 años',          desc:'Fiestas de quince con magia y detalle' },
  { icon:'🎊', label:'Cumpleaños',       desc:'Celebraciones únicas para todas las edades' },
  { icon:'🏢', label:'Corporativos',     desc:'Eventos empresariales y lanzamientos' },
  { icon:'🎓', label:'Graduaciones',     desc:'Cenas de egresados y fiestas de graduación' },
  { icon:'🌿', label:'Fiestas temáticas',desc:'Eventos con ambientación personalizada' },
]

const SERVICIOS = [
  { icon: Calendar,    title:'Coordinación total',       desc:'Desde la primera reunión hasta el último brindis. Me encargo de todo para que vos disfrutes.' },
  { icon: Users,       title:'Red de proveedores',       desc:'Trabajo con los mejores salones, fotógrafos, DJs, caterings y decoradores de la zona.' },
  { icon: Shield,      title:'Sin sorpresas',            desc:'Presupuesto detallado, seguimiento constante y comunicación transparente en todo momento.' },
  { icon: MessageCircle, title:'Comunicación directa',  desc:'Siempre disponible por WhatsApp. Respondo rápido porque sé que los tiempos del evento no esperan.' },
  { icon: Sparkles,    title:'Atención personalizada',  desc:'Cada evento es único. Escucho tu visión y la hago realidad con creatividad y profesionalismo.' },
  { icon: Heart,       title:'Amor por lo que hago',    desc:'Más de 5 años organizando eventos que quedan en la memoria de las familias.' },
]

const TESTIMONIOS = [
  { nombre:'Valentina & Rodrigo', tipo:'Boda', texto:'Jésica hizo que nuestro casamiento fuera exactamente como lo soñamos. Cada detalle, cada momento, todo perfecto. No podríamos haberlo hecho sin ella.', estrellas:5 },
  { nombre:'Familia Martínez',    tipo:'15 años', texto:'El festejo de nuestra hija fue mágico. Jésica se encargó de absolutamente todo y nosotros pudimos disfrutar como invitados.', estrellas:5 },
  { nombre:'TechCorp Argentina',  tipo:'Evento corporativo', texto:'Profesionalismo total. Organizó nuestra cena anual con 200 personas sin un solo inconveniente. Lo recomendamos ampliamente.', estrellas:5 },
]

const GALERIA = [
  { emoji:'💐', color:'bg-rose-100', label:'Decoración floral' },
  { emoji:'📸', color:'bg-sage-100', label:'Momentos únicos' },
  { emoji:'🎵', color:'bg-gold-100', label:'Música y ambiente' },
  { emoji:'🍽️', color:'bg-purple-100',label:'Gastronomía' },
  { emoji:'✨', color:'bg-blue-100', label:'Detalles especiales' },
  { emoji:'🥂', color:'bg-rose-50',  label:'Brindis' },
]

export default function Landing() {
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-rose-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white fill-white"/>
            </div>
            <div>
              <span className="font-serif text-xl text-ink-800">JR Eventos</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => scrollTo('servicios')} className="text-ink-500 hover:text-rose-600 transition-colors">Servicios</button>
            <button onClick={() => scrollTo('eventos')}   className="text-ink-500 hover:text-rose-600 transition-colors">Eventos</button>
            <button onClick={() => scrollTo('equipo')}    className="text-ink-500 hover:text-rose-600 transition-colors">Equipo</button>
            <button onClick={() => scrollTo('contacto')}  className="text-ink-500 hover:text-rose-600 transition-colors">Contacto</button>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-ink-500 hover:text-ink-800 transition-colors">Ingresar</Link>
            <button onClick={() => scrollTo('contacto')}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors">
              Contactame
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-rose-50 via-white to-sage-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-rose-100 rounded-full opacity-30 blur-3xl pointer-events-none"/>
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-sage-100 rounded-full opacity-40 blur-3xl pointer-events-none"/>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles size={14}/> Más de 5 años creando momentos únicos
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-ink-800 leading-tight mb-6">
            Tu evento,<br/>
            <span className="text-rose-500">nuestra pasión</span>
          </h1>
          <p className="text-xl text-ink-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Organizamos bodas, quinceaños, cumpleaños y eventos corporativos en Buenos Aires
            con dedicación, creatividad y atención al detalle.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => scrollTo('contacto')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 text-white rounded-2xl font-medium hover:bg-rose-600 transition-colors text-base shadow-lg shadow-rose-200">
              Quiero organizar mi evento <ArrowRight size={18}/>
            </button>
            <button onClick={() => scrollTo('eventos')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-ink-700 rounded-2xl font-medium hover:bg-rose-50 transition-colors text-base border border-ink-200">
              Ver tipos de eventos
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-8 justify-center mt-14 flex-wrap">
            {[['150+','eventos realizados'],['5','años de experiencia'],['100%','clientes satisfechos'],['50+','proveedores aliados']].map(([n,l]) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-serif text-rose-600">{n}</div>
                <div className="text-sm text-ink-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tipos de eventos ───────────────────────────────────────────────────── */}
      <section id="eventos" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif text-ink-800 mb-3">¿Qué tipo de evento organizamos?</h2>
            <p className="text-ink-500">Cada celebración tiene su magia, y nosotros sabemos cómo potenciarla</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {TIPOS_EVENTOS.map(e => (
              <div key={e.label}
                className="p-6 bg-white rounded-2xl border border-ink-100 hover:border-rose-200 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                <div className="text-4xl mb-4">{e.icon}</div>
                <h3 className="text-lg font-serif text-ink-800 mb-2 group-hover:text-rose-600 transition-colors">{e.label}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Servicios ──────────────────────────────────────────────────────────── */}
      <section id="servicios" className="py-20 px-6 bg-gradient-to-br from-rose-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif text-ink-800 mb-3">Cómo trabajamos</h2>
            <p className="text-ink-500">Un servicio integral para que vos solo tengas que disfrutar</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICIOS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 bg-white rounded-2xl border border-ink-100 hover:shadow-sm transition-all">
                <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-rose-500"/>
                </div>
                <h3 className="text-base font-medium text-ink-800 mb-2">{title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galería visual ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif text-ink-800 mb-3">Momentos que quedan para siempre</h2>
            <p className="text-ink-500">Cada evento es una historia única</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALERIA.map((item, i) => (
              <div key={i} className={`${item.color} rounded-2xl p-8 flex flex-col items-center justify-center text-center aspect-square hover:scale-[1.02] transition-transform cursor-pointer`}>
                <span className="text-5xl mb-3">{item.emoji}</span>
                <span className="text-sm font-medium text-ink-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Equipo ─────────────────────────────────────────────────────────────── */}
      <section id="equipo" className="py-20 px-6 bg-gradient-to-br from-sage-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif text-ink-800 mb-3">El equipo detrás de cada evento</h2>
            <p className="text-ink-500">Profesionales apasionados por crear experiencias únicas</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { nombre:'Jésica Rodríguez', rol:'Fundadora & Organizadora Principal', emoji:'👩‍💼',
                desc:'Más de 5 años coordinando eventos. Especialista en bodas y eventos de 15 años. Me apasiona cada detalle.' },
              { nombre:'Equipo de coordinación', rol:'Asistentes de eventos', emoji:'👥',
                desc:'Un equipo de profesionales que garantiza que cada evento se desarrolle perfectamente.' },
              { nombre:'Red de proveedores', rol:'Aliados estratégicos', emoji:'🤝',
                desc:'Trabajamos con los mejores fotógrafos, DJs, caterings y decoradores de Buenos Aires.' },
            ].map(p => (
              <div key={p.nombre} className="bg-white rounded-2xl p-6 border border-ink-100 text-center hover:shadow-sm transition-all">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  {p.emoji}
                </div>
                <h3 className="font-serif text-lg text-ink-800 mb-1">{p.nombre}</h3>
                <p className="text-xs text-rose-600 font-medium mb-3">{p.rol}</p>
                <p className="text-sm text-ink-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proveedores ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif text-ink-800 mb-3">Trabajamos con los mejores</h2>
            <p className="text-ink-500">Una red de proveedores verificados y de confianza</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: Camera,   label:'Fotografía & Video', color:'text-ink-500 bg-ink-50' },
              { icon: Music,    label:'Música & DJ',        color:'text-purple-600 bg-purple-50' },
              { icon: Flower,   label:'Decoración',         color:'text-rose-500 bg-rose-50' },
              { icon: ChefHat, label:'Catering',            color:'text-gold-600 bg-gold-50' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="p-6 bg-white rounded-2xl border border-ink-100 text-center hover:shadow-sm transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${color}`}>
                  <Icon size={24}/>
                </div>
                <p className="text-sm font-medium text-ink-700">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-rose-50 rounded-2xl border border-rose-100 text-center">
            <p className="text-sm font-medium text-rose-700">¿Sos proveedor y querés trabajar con nosotros?</p>
            <p className="text-xs text-rose-500 mt-1">Contactanos y sumate a nuestra red de profesionales</p>
          </div>
        </div>
      </section>

      {/* ── Testimonios ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-br from-rose-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif text-ink-800 mb-3">Lo que dicen nuestros clientes</h2>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-gold-400 fill-gold-400"/>)}
              <span className="text-sm text-ink-400 ml-2">5.0 promedio</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIOS.map(t => (
              <div key={t.nombre} className="bg-white rounded-2xl p-6 border border-ink-100 hover:shadow-sm transition-all">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.estrellas)].map((_,i) => <Star key={i} size={14} className="text-gold-400 fill-gold-400"/>)}
                </div>
                <p className="text-sm text-ink-600 leading-relaxed mb-5 italic">"{t.texto}"</p>
                <div>
                  <p className="text-sm font-medium text-ink-800">{t.nombre}</p>
                  <p className="text-xs text-rose-500">{t.tipo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto ───────────────────────────────────────────────────────────── */}
      <section id="contacto" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif text-ink-800 mb-3">¿Hablamos de tu evento?</h2>
            <p className="text-ink-500">Contame tu idea y te ayudo a hacerla realidad</p>
          </div>
          <div className="bg-white rounded-2xl border border-ink-100 p-8 shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Nombre</label>
                <input placeholder="Tu nombre" className="w-full px-3 py-2.5 text-sm border border-ink-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">WhatsApp</label>
                <input placeholder="11 1234-5678" className="w-full px-3 py-2.5 text-sm border border-ink-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1">Tipo de evento</label>
              <select className="w-full px-3 py-2.5 text-sm border border-ink-200 rounded-xl outline-none focus:border-rose-400">
                <option>Boda / Casamiento</option>
                <option>15 años</option>
                <option>Cumpleaños</option>
                <option>Evento corporativo</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1">Contame de tu evento</label>
              <textarea rows={4} placeholder="Fecha aproximada, cantidad de personas, visión del evento..." className="w-full px-3 py-2.5 text-sm border border-ink-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"/>
            </div>
            <a
              href="https://wa.me/5491112345678?text=Hola%20Jésica!%20Te%20contacto%20desde%20tu%20web%20para%20consultar%20sobre%20un%20evento."
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#1fbd5a] transition-colors">
              <MessageCircle size={18}/> Escribirme por WhatsApp
            </a>
            <p className="text-center text-xs text-ink-400">O enviame un mail a <a href="mailto:hola@jreventos.com.ar" className="text-rose-500 hover:underline">hola@jreventos.com.ar</a></p>
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-br from-rose-500 to-rose-700 text-white text-center">
        <h2 className="text-4xl font-serif mb-4">Empezá a planificar hoy</h2>
        <p className="text-rose-100 mb-8 max-w-md mx-auto">
          El evento de tus sueños empieza con una conversación. Estoy acá para ayudarte.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a href="https://wa.me/5491112345678" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-rose-600 rounded-xl font-medium hover:bg-rose-50 transition-colors">
            <MessageCircle size={16}/> WhatsApp
          </a>
          <Link to="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors border border-white/30">
            Ingresar a mi panel
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-ink-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
              <Heart size={14} className="text-white fill-white"/>
            </div>
            <span className="font-serif text-lg text-ink-700">JR Eventos</span>
          </div>
          <div className="flex gap-6 text-sm text-ink-400">
            <button onClick={() => scrollTo('servicios')} className="hover:text-rose-500 transition-colors">Servicios</button>
            <button onClick={() => scrollTo('eventos')}   className="hover:text-rose-500 transition-colors">Eventos</button>
            <button onClick={() => scrollTo('equipo')}    className="hover:text-rose-500 transition-colors">Equipo</button>
            <Link to="/login" className="hover:text-rose-500 transition-colors">Panel</Link>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://instagram.com/jreventos" target="_blank" rel="noreferrer"
              className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors">
              <Instagram size={16}/>
            </a>
            <a href="https://wa.me/5491112345678" target="_blank" rel="noreferrer"
              className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors">
              <MessageCircle size={16}/>
            </a>
          </div>
        </div>
        <p className="text-center text-xs text-ink-300 mt-6">© 2026 JR Eventos · Todos los derechos reservados · Desarrollado con Lumina Events</p>
      </footer>
    </div>
  )
}
