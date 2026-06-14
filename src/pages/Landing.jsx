import { Link } from 'react-router-dom'
import { Heart, Star, ArrowRight, Check, Instagram, MessageCircle,
  Camera, Music, Flower, ChefHat, Sparkles, Users, Calendar,
  Shield, Phone, Mail } from 'lucide-react'

// Unsplash photos — eventos reales
const HERO_IMG     = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80&fit=crop'
const BODA_IMG     = 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80&fit=crop'
const QUINCE_IMG   = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80&fit=crop'
const CORP_IMG     = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80&fit=crop'
const DECO_IMG     = 'https://images.unsplash.com/photo-1478146059778-26b2ec6d2891?w=600&q=80&fit=crop'
const CATERING_IMG = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80&fit=crop'
const FOTO_IMG     = 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80&fit=crop'
const SALON_IMG    = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80&fit=crop'
const FLORES_IMG   = 'https://images.unsplash.com/photo-1487530811015-780ec32b2a4a?w=400&q=80&fit=crop'
const BRINDIS_IMG  = 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=80&fit=crop'
const TORTA_IMG    = 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&q=80&fit=crop'
const MUSICA_IMG   = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80&fit=crop'

const TIPOS = [
  { img: BODA_IMG,   label:'Bodas',             desc:'Coordinación integral del día más especial' },
  { img: QUINCE_IMG, label:'15 años',            desc:'Fiestas de quince con magia y detalle'       },
  { img: CORP_IMG,   label:'Corporativos',       desc:'Eventos empresariales y lanzamientos'        },
  { img: DECO_IMG,   label:'Fiestas temáticas',  desc:'Ambientación completamente personalizada'    },
  { img: CATERING_IMG,label:'Cumpleaños',        desc:'Celebraciones únicas para todas las edades'  },
  { img: SALON_IMG,  label:'Graduaciones',       desc:'Cenas de egresados y fiestas de colación'    },
]

const GALERIA = [
  { img: FLORES_IMG, label:'Decoración floral'    },
  { img: BRINDIS_IMG,label:'Momentos únicos'      },
  { img: TORTA_IMG,  label:'Repostería artesanal' },
  { img: MUSICA_IMG, label:'Música & ambiente'    },
  { img: FOTO_IMG,   label:'Fotografía'           },
  { img: CATERING_IMG,label:'Gastronomía'         },
]

const TESTIMONIOS = [
  { nombre:'Valentina & Rodrigo', tipo:'Boda · Diciembre 2024',
    texto:'Jésica hizo que nuestro casamiento fuera exactamente como lo soñamos. Cada detalle, cada momento, todo perfecto. No podríamos haberlo hecho sin ella.', estrellas:5 },
  { nombre:'Familia Martínez',    tipo:'15 años · Octubre 2024',
    texto:'El festejo de nuestra hija fue mágico. Jésica se encargó de absolutamente todo y nosotros pudimos disfrutar como invitados.', estrellas:5 },
  { nombre:'TechCorp Argentina',  tipo:'Evento corporativo · 2024',
    texto:'Profesionalismo total. Organizó nuestra cena anual con 200 personas sin un solo inconveniente. Lo recomendamos ampliamente.', estrellas:5 },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-nude-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-warm-500 rounded-lg flex items-center justify-center">
              <Heart size={15} className="text-white fill-white"/>
            </div>
            <span className="font-serif text-xl text-ink-800">JR Eventos</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm">
            <button onClick={()=>scrollTo('servicios')} className="text-ink-500 hover:text-warm-600 transition-colors">Servicios</button>
            <button onClick={()=>scrollTo('eventos')}   className="text-ink-500 hover:text-warm-600 transition-colors">Eventos</button>
            <button onClick={()=>scrollTo('galeria')}   className="text-ink-500 hover:text-warm-600 transition-colors">Galería</button>
            <button onClick={()=>scrollTo('contacto')}  className="text-ink-500 hover:text-warm-600 transition-colors">Contacto</button>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-ink-500 hover:text-ink-800 transition-colors px-3 py-1.5">Ingresar</Link>
            <button onClick={()=>scrollTo('contacto')}
              className="px-4 py-2 bg-warm-500 text-white rounded-lg text-sm font-medium hover:bg-warm-600 transition-colors">
              Contactame
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img src={HERO_IMG} alt="Eventos" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60"/>
        <div className="relative text-center text-white px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles size={14}/> Más de 5 años creando momentos únicos
          </div>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-6 drop-shadow-lg">
            Tu evento,<br/>
            <span className="text-warm-200">nuestra pasión</span>
          </h1>
          <p className="text-xl text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
            Organizamos bodas, quinceaños, cumpleaños y eventos corporativos en Buenos Aires con dedicación y atención al detalle.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={()=>scrollTo('contacto')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-warm-500 text-white rounded-2xl font-medium hover:bg-warm-600 transition-colors text-base shadow-lg">
              Quiero organizar mi evento <ArrowRight size={18}/>
            </button>
            <button onClick={()=>scrollTo('eventos')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm text-white rounded-2xl font-medium hover:bg-white/25 transition-colors text-base border border-white/30">
              Ver mis trabajos
            </button>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/70 rounded-full"/>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-nude-50 border-b border-nude-200">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[['150+','eventos realizados'],['5','años de experiencia'],['100%','clientes satisfechos'],['50+','proveedores aliados']].map(([n,l])=>(
            <div key={l} className="text-center">
              <div className="text-4xl font-serif text-warm-600 mb-1">{n}</div>
              <div className="text-sm text-ink-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tipos de eventos ───────────────────────────────────────────── */}
      <section id="eventos" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-warm-600 text-sm font-medium tracking-widest uppercase mb-3">Lo que hacemos</p>
            <h2 className="text-4xl font-serif text-ink-800 mb-3">¿Qué tipo de evento organizamos?</h2>
            <p className="text-ink-500">Cada celebración tiene su magia, y nosotros sabemos cómo potenciarla</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TIPOS.map(e => (
              <div key={e.label} className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300">
                <img src={e.img} alt={e.label} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="text-xl font-serif mb-1">{e.label}</h3>
                  <p className="text-white/80 text-sm">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Servicios ──────────────────────────────────────────────────── */}
      <section id="servicios" className="py-20 px-6 bg-nude-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-warm-600 text-sm font-medium tracking-widest uppercase mb-3">Cómo trabajamos</p>
            <h2 className="text-4xl font-serif text-ink-800 mb-3">Un servicio integral</h2>
            <p className="text-ink-500">Para que vos solo tengas que disfrutar</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature grande */}
            <div className="relative rounded-2xl overflow-hidden md:row-span-2">
              <img src={SALON_IMG} alt="Coordinación" className="w-full h-full object-cover min-h-64"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"/>
              <div className="absolute bottom-0 p-8 text-white">
                <div className="w-10 h-10 bg-warm-500/80 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                  <Calendar size={20}/>
                </div>
                <h3 className="text-2xl font-serif mb-2">Coordinación total</h3>
                <p className="text-white/80 leading-relaxed">Desde la primera reunión hasta el último brindis. Me encargo de todo para que vos disfrutes sin preocupaciones.</p>
              </div>
            </div>
            {/* Features pequeñas */}
            {[
              { icon: Users,     title:'Red de proveedores',    desc:'Trabajo con los mejores salones, fotógrafos, DJs y caterings.' },
              { icon: Shield,    title:'Sin sorpresas',         desc:'Presupuesto detallado y comunicación transparente en todo momento.' },
              { icon: MessageCircle, title:'Comunicación directa', desc:'Siempre disponible por WhatsApp. Respondo rápido.' },
              { icon: Sparkles,  title:'Atención personalizada',desc:'Escucho tu visión y la hago realidad con creatividad.' },
              { icon: Heart,     title:'Amor por lo que hago', desc:'Más de 5 años organizando eventos que perduran en la memoria.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-nude-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-warm-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-warm-600"/>
                </div>
                <h3 className="text-base font-medium text-ink-800 mb-1.5">{title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galería ────────────────────────────────────────────────────── */}
      <section id="galeria" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-warm-600 text-sm font-medium tracking-widest uppercase mb-3">Nuestro trabajo</p>
            <h2 className="text-4xl font-serif text-ink-800 mb-3">Momentos que quedan para siempre</h2>
            <p className="text-ink-500">Una pequeña muestra de lo que creamos juntos</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GALERIA.map((item, i) => (
              <div key={i} className={`relative overflow-hidden rounded-2xl group cursor-pointer ${i === 0 ? 'md:row-span-2' : ''}`}>
                <img src={item.img} alt={item.label} className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${i===0?'h-full min-h-80':'h-52'}`}/>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-white text-sm font-medium bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proveedores ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-nude-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-warm-600 text-sm font-medium tracking-widest uppercase mb-3">Nuestros aliados</p>
            <h2 className="text-4xl font-serif text-ink-800 mb-3">Trabajamos con los mejores</h2>
            <p className="text-ink-500">Una red de proveedores verificados y de confianza</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon:Camera,   label:'Fotografía & Video', img:FOTO_IMG },
              { icon:Music,    label:'Música & DJ',        img:MUSICA_IMG },
              { icon:Flower,   label:'Decoración & Flores',img:FLORES_IMG },
              { icon:ChefHat, label:'Catering',            img:CATERING_IMG },
            ].map(({ icon:Icon, label, img }) => (
              <div key={label} className="group relative rounded-2xl overflow-hidden cursor-pointer">
                <img src={img} alt={label} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
                <div className="absolute bottom-0 p-3 text-white">
                  <Icon size={16} className="mb-1 text-warm-200"/>
                  <p className="text-xs font-medium leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonios ────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-warm-600 text-sm font-medium tracking-widest uppercase mb-3">Testimonios</p>
            <h2 className="text-4xl font-serif text-ink-800 mb-3">Lo que dicen nuestros clientes</h2>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(5)].map((_,i)=><Star key={i} size={18} className="text-gold-400 fill-gold-400"/>)}
              <span className="text-sm text-ink-400 ml-2">5.0 promedio</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIOS.map(t => (
              <div key={t.nombre} className="bg-nude-50 rounded-2xl p-7 border border-nude-200 hover:shadow-sm transition-all">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.estrellas)].map((_,i)=><Star key={i} size={14} className="text-gold-400 fill-gold-400"/>)}
                </div>
                <p className="text-sm text-ink-600 leading-relaxed mb-5 italic">"{t.texto}"</p>
                <div>
                  <p className="text-sm font-medium text-ink-800">{t.nombre}</p>
                  <p className="text-xs text-warm-600 mt-0.5">{t.tipo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Equipo ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-nude-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-warm-600 text-sm font-medium tracking-widest uppercase mb-3">El equipo</p>
            <h2 className="text-4xl font-serif text-ink-800 mb-3">Detrás de cada evento</h2>
            <p className="text-ink-500">Profesionales apasionados por crear experiencias únicas</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { nombre:'Jésica Rodríguez', rol:'Fundadora & Coordinadora principal', emoji:'👩‍💼',
                desc:'Más de 5 años coordinando bodas, 15 años y eventos corporativos. Especializada en logística y atención al cliente.' },
              { nombre:'Equipo de coordinación', rol:'Asistentes de eventos', emoji:'👥',
                desc:'Profesionales que garantizan que cada evento fluya sin contratiempos desde la preparación hasta el cierre.' },
              { nombre:'Red de proveedores', rol:'Aliados estratégicos verificados', emoji:'🤝',
                desc:'Fotógrafos, DJs, caterings y decoradores seleccionados y probados en más de 150 eventos.' },
            ].map(p => (
              <div key={p.nombre} className="bg-white rounded-2xl p-7 border border-nude-200 text-center hover:shadow-sm transition-all">
                <div className="w-20 h-20 bg-warm-50 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl border-4 border-warm-100">
                  {p.emoji}
                </div>
                <h3 className="font-serif text-lg text-ink-800 mb-1">{p.nombre}</h3>
                <p className="text-xs text-warm-600 font-medium mb-3 uppercase tracking-wide">{p.rol}</p>
                <p className="text-sm text-ink-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto ───────────────────────────────────────────────────── */}
      <section id="contacto" className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-warm-600 text-sm font-medium tracking-widest uppercase mb-3">Contacto</p>
            <h2 className="text-4xl font-serif text-ink-800 mb-5">¿Hablamos de tu evento?</h2>
            <p className="text-ink-500 leading-relaxed mb-8">
              Contame tu idea y te ayudo a hacerla realidad. Respondo en menos de 24 horas.
            </p>
            <div className="space-y-4">
              <a href="https://wa.me/5491112345678" target="_blank" rel="noreferrer"
                className="flex items-center gap-4 text-ink-600 hover:text-warm-600 transition-colors group">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <MessageCircle size={18} className="text-emerald-600"/>
                </div>
                <div>
                  <p className="text-sm font-medium">WhatsApp</p>
                  <p className="text-xs text-ink-400">+54 9 11 1234-5678</p>
                </div>
              </a>
              <a href="mailto:hola@jreventos.com.ar"
                className="flex items-center gap-4 text-ink-600 hover:text-warm-600 transition-colors group">
                <div className="w-10 h-10 bg-warm-50 rounded-xl flex items-center justify-center group-hover:bg-warm-100 transition-colors">
                  <Mail size={18} className="text-warm-600"/>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-ink-400">hola@jreventos.com.ar</p>
                </div>
              </a>
              <a href="https://instagram.com/jreventos" target="_blank" rel="noreferrer"
                className="flex items-center gap-4 text-ink-600 hover:text-warm-600 transition-colors group">
                <div className="w-10 h-10 bg-nude-100 rounded-xl flex items-center justify-center group-hover:bg-nude-200 transition-colors">
                  <Instagram size={18} className="text-ink-600"/>
                </div>
                <div>
                  <p className="text-sm font-medium">Instagram</p>
                  <p className="text-xs text-ink-400">@jreventos</p>
                </div>
              </a>
            </div>
          </div>
          <div className="bg-nude-50 rounded-2xl border border-nude-200 p-8 space-y-4">
            <h3 className="font-serif text-xl text-ink-800">Escribime</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Nombre</label>
                <input placeholder="Tu nombre" className="w-full px-3 py-2.5 text-sm border border-nude-300 rounded-xl outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">WhatsApp</label>
                <input placeholder="11 1234-5678" className="w-full px-3 py-2.5 text-sm border border-nude-300 rounded-xl outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 bg-white"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1">Tipo de evento</label>
              <select className="w-full px-3 py-2.5 text-sm border border-nude-300 rounded-xl outline-none focus:border-warm-400 bg-white text-ink-800">
                <option>Boda / Casamiento</option>
                <option>15 años</option>
                <option>Cumpleaños</option>
                <option>Evento corporativo</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-500 mb-1">Contame de tu evento</label>
              <textarea rows={4} placeholder="Fecha aproximada, cantidad de personas, visión del evento..."
                className="w-full px-3 py-2.5 text-sm border border-nude-300 rounded-xl outline-none focus:border-warm-400 focus:ring-2 focus:ring-warm-100 resize-none bg-white"/>
            </div>
            <a href="https://wa.me/5491112345678?text=Hola%20Jésica!%20Te%20contacto%20desde%20tu%20web."
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3.5 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#1fbd5a] transition-colors">
              <MessageCircle size={18}/> Enviar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <img src={BODA_IMG} alt="CTA" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/60"/>
        <div className="relative text-center text-white max-w-2xl mx-auto">
          <h2 className="text-4xl font-serif mb-4">Empezá a planificar hoy</h2>
          <p className="text-white/80 mb-8 text-lg">El evento de tus sueños empieza con una conversación.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://wa.me/5491112345678" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#1fbd5a] transition-colors text-base">
              <MessageCircle size={18}/> WhatsApp
            </a>
            <Link to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-colors text-base border border-white/30">
              Ingresar al panel
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 bg-ink-900 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-warm-500 rounded-lg flex items-center justify-center">
              <Heart size={14} className="text-white fill-white"/>
            </div>
            <span className="font-serif text-lg">JR Eventos</span>
          </div>
          <div className="flex gap-6 text-sm text-white/60">
            <button onClick={()=>scrollTo('servicios')} className="hover:text-warm-300 transition-colors">Servicios</button>
            <button onClick={()=>scrollTo('eventos')}   className="hover:text-warm-300 transition-colors">Eventos</button>
            <button onClick={()=>scrollTo('galeria')}   className="hover:text-warm-300 transition-colors">Galería</button>
            <button onClick={()=>scrollTo('contacto')}  className="hover:text-warm-300 transition-colors">Contacto</button>
            <Link to="/login" className="hover:text-warm-300 transition-colors">Panel</Link>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://instagram.com/jreventos" target="_blank" rel="noreferrer"
              className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-warm-500 transition-colors">
              <Instagram size={16}/>
            </a>
            <a href="https://wa.me/5491112345678" target="_blank" rel="noreferrer"
              className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
              <MessageCircle size={16}/>
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-white/30 mt-8">
          © 2026 JR Eventos · Todos los derechos reservados · Desarrollado con Lumina Events
        </div>
      </footer>
    </div>
  )
}
