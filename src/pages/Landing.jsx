import { Link } from 'react-router-dom'
import { Star, ArrowRight, Check, Instagram, MessageCircle,
  Camera, Music, Flower, ChefHat, Sparkles, Users, Calendar, Shield } from 'lucide-react'

const HERO_IMG     = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=85&fit=crop&crop=center'
const BODA_IMG     = 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=700&q=80&fit=crop'
const QUINCE_IMG   = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=700&q=80&fit=crop'
const CORP_IMG     = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=700&q=80&fit=crop'
const DECO_IMG     = 'https://images.unsplash.com/photo-1478146059778-26b2ec6d2891?w=700&q=80&fit=crop'
const CATERING_IMG = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=700&q=80&fit=crop'
const SALON_IMG    = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=700&q=80&fit=crop'
const FLORES_IMG   = 'https://images.unsplash.com/photo-1487530811015-780ec32b2a4a?w=600&q=80&fit=crop'
const BRINDIS_IMG  = 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80&fit=crop'
const TORTA_IMG    = 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80&fit=crop'
const MUSICA_IMG   = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80&fit=crop'
const FOTO_IMG     = 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80&fit=crop'

const TIPOS = [
  { img:BODA_IMG,    label:'Bodas & Casamientos', desc:'Coordinación integral del día más especial'       },
  { img:QUINCE_IMG,  label:'15 años',             desc:'Fiestas de quince con magia y atención al detalle'},
  { img:CORP_IMG,    label:'Corporativos',         desc:'Eventos empresariales y lanzamientos de marca'   },
  { img:DECO_IMG,    label:'Fiestas temáticas',   desc:'Ambientación completamente personalizada'         },
  { img:CATERING_IMG,label:'Cumpleaños',           desc:'Celebraciones únicas para todas las edades'      },
  { img:SALON_IMG,   label:'Graduaciones',         desc:'Cenas de egresados y fiestas de colación'        },
]

const GALERIA = [
  { img:FLORES_IMG, label:'Decoración floral'    },
  { img:BRINDIS_IMG,label:'Momentos únicos'      },
  { img:TORTA_IMG,  label:'Repostería artesanal' },
  { img:MUSICA_IMG, label:'Música & ambiente'    },
  { img:FOTO_IMG,   label:'Fotografía'           },
  { img:CATERING_IMG,label:'Gastronomía'         },
]

const TESTIMONIOS = [
  { nombre:'Valentina & Rodrigo', tipo:'Boda · Diciembre 2024',
    texto:'Jazmin hizo que nuestro casamiento fuera exactamente como lo soñamos. Cada detalle, cada momento, todo perfecto.' },
  { nombre:'Familia Martínez',    tipo:'15 años · Octubre 2024',
    texto:'El festejo de nuestra hija fue mágico. Jazmin se encargó de absolutamente todo y nosotros pudimos disfrutar.' },
  { nombre:'TechCorp Argentina',  tipo:'Evento corporativo · 2024',
    texto:'Profesionalismo total. Organizó nuestra cena anual con 200 personas sin un solo inconveniente.' },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior:'smooth' })
}

// Logo component — tipografía del logo real
function Logo({ className = '', light = false }) {
  return (
    <div className={className}>
      <div className={`text-xs md:text-sm font-light tracking-[0.35em] uppercase ${light ? 'text-white' : 'text-ink-900'}`}
        style={{fontFamily:'Georgia, "Times New Roman", serif', letterSpacing:'0.35em'}}>
        JAZMIN ROSENBERG
      </div>
      <div className={`text-[9px] tracking-[0.25em] uppercase mt-0.5 text-center ${light ? 'text-white/70' : 'text-ink-400'}`}
        style={{letterSpacing:'0.25em', fontSize:'9px'}}>
        ORGANIZACIÓN DE EVENTOS
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white" style={{fontFamily:'"DM Sans", sans-serif'}}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-sm border-b border-nude-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo/>
          <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase">
            <button onClick={()=>scrollTo('servicios')} className="text-ink-400 hover:text-ink-900 transition-colors">Servicios</button>
            <button onClick={()=>scrollTo('eventos')}   className="text-ink-400 hover:text-ink-900 transition-colors">Eventos</button>
            <button onClick={()=>scrollTo('galeria')}   className="text-ink-400 hover:text-ink-900 transition-colors">Galería</button>
            <button onClick={()=>scrollTo('contacto')}  className="text-ink-400 hover:text-ink-900 transition-colors">Contacto</button>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs tracking-widest uppercase text-ink-400 hover:text-ink-900 transition-colors hidden md:block">
              Panel
            </Link>
            <button onClick={()=>scrollTo('contacto')}
              className="text-xs tracking-widest uppercase px-5 py-2.5 bg-ink-900 text-white hover:bg-ink-700 transition-colors">
              Contacto
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <img src={HERO_IMG} alt="Eventos" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/45"/>
        <div className="relative text-center text-white px-6 max-w-4xl mx-auto">
          {/* Logo grande en el hero */}
          <div className="mb-8">
            <div className="text-2xl md:text-4xl font-light tracking-[0.4em] uppercase text-white mb-2"
              style={{fontFamily:'Georgia, serif', letterSpacing:'0.4em'}}>
              JAZMIN ROSENBERG
            </div>
            <div className="text-xs md:text-sm tracking-[0.35em] uppercase text-white/70"
              style={{letterSpacing:'0.35em'}}>
              ORGANIZACIÓN DE EVENTOS
            </div>
          </div>
          <div className="w-16 h-px bg-white/40 mx-auto mb-8"/>
          <p className="text-base md:text-xl text-white/85 max-w-xl mx-auto leading-relaxed font-light">
            Transformamos cada celebración en una experiencia única e irrepetible
          </p>
          <div className="flex gap-4 justify-center mt-10 flex-wrap">
            <button onClick={()=>scrollTo('contacto')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-ink-900 text-xs tracking-widest uppercase hover:bg-nude-100 transition-colors">
              Consultá tu evento
            </button>
            <button onClick={()=>scrollTo('eventos')}
              className="inline-flex items-center gap-2 px-8 py-4 border border-white/60 text-white text-xs tracking-widest uppercase hover:bg-white/10 transition-colors">
              Ver trabajos
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-12 bg-white/40"/>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-nude-50 border-y border-nude-200">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[['150+','Eventos realizados'],['5','Años de experiencia'],['100%','Satisfacción'],['50+','Proveedores aliados']].map(([n,l])=>(
            <div key={l} className="text-center">
              <div className="text-3xl md:text-4xl font-light text-ink-900 mb-1"
                style={{fontFamily:'Georgia, serif'}}>{n}</div>
              <div className="text-xs text-ink-400 tracking-widest uppercase">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tipos de eventos ───────────────────────────────────────────── */}
      <section id="eventos" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-ink-400 tracking-widest uppercase mb-4">Especialidades</p>
            <h2 className="text-3xl md:text-4xl font-light text-ink-900 mb-4" style={{fontFamily:'Georgia, serif'}}>
              Cada celebración, única
            </h2>
            <div className="w-12 h-px bg-nude-400 mx-auto"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIPOS.map(e => (
              <div key={e.label} className="group relative overflow-hidden cursor-pointer">
                <img src={e.img} alt={e.label} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-lg font-light tracking-wide mb-1" style={{fontFamily:'Georgia, serif'}}>{e.label}</h3>
                  <p className="text-white/70 text-xs leading-relaxed">{e.desc}</p>
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
            <p className="text-xs text-ink-400 tracking-widest uppercase mb-4">Cómo trabajamos</p>
            <h2 className="text-3xl md:text-4xl font-light text-ink-900 mb-4" style={{fontFamily:'Georgia, serif'}}>
              Un servicio integral
            </h2>
            <div className="w-12 h-px bg-nude-400 mx-auto"/>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden md:row-span-2 group">
              <img src={SALON_IMG} alt="Coordinación" className="w-full h-full object-cover min-h-72 group-hover:scale-105 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"/>
              <div className="absolute bottom-0 p-8 text-white">
                <p className="text-xs tracking-widest uppercase text-white/60 mb-2">Coordinación total</p>
                <h3 className="text-2xl font-light mb-3" style={{fontFamily:'Georgia, serif'}}>
                  Desde la primera reunión hasta el último brindis
                </h3>
                <p className="text-white/75 text-sm leading-relaxed">Me encargo de cada detalle para que vos puedas disfrutar sin preocupaciones.</p>
              </div>
            </div>
            {[
              { icon:Users,    title:'Red de proveedores',   desc:'Trabajo con los mejores salones, fotógrafos, DJs y caterings verificados.' },
              { icon:Shield,   title:'Transparencia total',  desc:'Presupuesto detallado y comunicación constante en cada etapa del proceso.' },
              { icon:MessageCircle, title:'Disponibilidad',  desc:'Siempre accesible por WhatsApp. Respondo rápido porque tu evento no espera.' },
              { icon:Sparkles, title:'Atención personalizada',desc:'Escucho tu visión y la transformo en realidad con creatividad y precisión.' },
            ].map(({ icon:Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 border border-nude-200">
                <Icon size={20} className="text-nude-500 mb-4"/>
                <h3 className="text-sm font-medium text-ink-900 mb-2 tracking-wide">{title}</h3>
                <p className="text-xs text-ink-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Galería ────────────────────────────────────────────────────── */}
      <section id="galeria" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-ink-400 tracking-widest uppercase mb-4">Portfolio</p>
            <h2 className="text-3xl md:text-4xl font-light text-ink-900 mb-4" style={{fontFamily:'Georgia, serif'}}>
              Momentos que perduran
            </h2>
            <div className="w-12 h-px bg-nude-400 mx-auto"/>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {GALERIA.map((item, i) => (
              <div key={i} className={`relative overflow-hidden group cursor-pointer ${i===0?'md:row-span-2':''}`}>
                <img src={item.img} alt={item.label}
                  className={`w-full object-cover group-hover:scale-105 transition-transform duration-700 ${i===0?'h-full min-h-72':'h-52'}`}/>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-white text-xs tracking-widest uppercase">{item.label}</span>
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
            <p className="text-xs text-ink-400 tracking-widest uppercase mb-4">Alianzas estratégicas</p>
            <h2 className="text-3xl md:text-4xl font-light text-ink-900 mb-4" style={{fontFamily:'Georgia, serif'}}>
              Trabajamos con los mejores
            </h2>
            <div className="w-12 h-px bg-nude-400 mx-auto"/>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon:Camera,  label:'Fotografía & Video',  img:FOTO_IMG       },
              { icon:Music,   label:'Música & DJ',         img:MUSICA_IMG     },
              { icon:Flower,  label:'Decoración & Flores', img:FLORES_IMG     },
              { icon:ChefHat, label:'Catering & Repostería',img:CATERING_IMG  },
            ].map(({ icon:Icon, label, img }) => (
              <div key={label} className="group relative overflow-hidden cursor-pointer">
                <img src={img} alt={label} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
                <div className="absolute bottom-0 p-3 text-white">
                  <Icon size={14} className="mb-1 text-nude-300"/>
                  <p className="text-xs leading-tight tracking-wide">{label}</p>
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
            <p className="text-xs text-ink-400 tracking-widest uppercase mb-4">Testimonios</p>
            <h2 className="text-3xl md:text-4xl font-light text-ink-900 mb-4" style={{fontFamily:'Georgia, serif'}}>
              Lo que dicen nuestros clientes
            </h2>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[...Array(5)].map((_,i)=><Star key={i} size={14} className="text-nude-500 fill-nude-500"/>)}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIOS.map(t => (
              <div key={t.nombre} className="bg-nude-50 border border-nude-200 p-8">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_,i)=><Star key={i} size={12} className="text-nude-500 fill-nude-500"/>)}
                </div>
                <p className="text-sm text-ink-600 leading-relaxed mb-6 italic font-light">"{t.texto}"</p>
                <div>
                  <p className="text-xs font-medium text-ink-900 tracking-wide">{t.nombre}</p>
                  <p className="text-xs text-nude-500 mt-0.5 tracking-widest uppercase text-[10px]">{t.tipo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto ───────────────────────────────────────────────────── */}
      <section id="contacto" className="py-20 px-6 bg-nude-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs text-ink-400 tracking-widest uppercase mb-4">Contacto</p>
            <h2 className="text-3xl md:text-4xl font-light text-ink-900 mb-5" style={{fontFamily:'Georgia, serif'}}>
              Hablemos de tu evento
            </h2>
            <div className="w-12 h-px bg-nude-400 mb-6"/>
            <p className="text-sm text-ink-500 leading-relaxed mb-8 font-light">
              Cada evento es único. Contame tu visión y juntas lo hacemos realidad.
              Respondo en menos de 24 horas.
            </p>
            <div className="space-y-4">
              <a href="https://wa.me/5491112345678" target="_blank" rel="noreferrer"
                className="flex items-center gap-4 text-ink-600 hover:text-ink-900 transition-colors group">
                <div className="w-10 h-10 border border-nude-300 flex items-center justify-center group-hover:border-ink-900 transition-colors">
                  <MessageCircle size={16}/>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase font-medium">WhatsApp</p>
                  <p className="text-xs text-ink-400">+54 9 11 1234-5678</p>
                </div>
              </a>
              <a href="mailto:hola@jazminrosenberg.com.ar"
                className="flex items-center gap-4 text-ink-600 hover:text-ink-900 transition-colors group">
                <div className="w-10 h-10 border border-nude-300 flex items-center justify-center group-hover:border-ink-900 transition-colors">
                  <span className="text-xs">@</span>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase font-medium">Email</p>
                  <p className="text-xs text-ink-400">hola@jazminrosenberg.com.ar</p>
                </div>
              </a>
              <a href="https://instagram.com/jazminrosenberg.eventos" target="_blank" rel="noreferrer"
                className="flex items-center gap-4 text-ink-600 hover:text-ink-900 transition-colors group">
                <div className="w-10 h-10 border border-nude-300 flex items-center justify-center group-hover:border-ink-900 transition-colors">
                  <Instagram size={16}/>
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase font-medium">Instagram</p>
                  <p className="text-xs text-ink-400">@jazminrosenberg.eventos</p>
                </div>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs tracking-widest uppercase text-ink-400 mb-2">Nombre</label>
                <input placeholder="Tu nombre" className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors"/>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-ink-400 mb-2">WhatsApp</label>
                <input placeholder="11 1234-5678" className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors"/>
              </div>
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-ink-400 mb-2">Tipo de evento</label>
              <select className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors text-ink-800">
                <option>Boda / Casamiento</option><option>15 años</option>
                <option>Cumpleaños</option><option>Evento corporativo</option><option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-ink-400 mb-2">Tu visión del evento</label>
              <textarea rows={4} placeholder="Fecha, cantidad de personas, estilo que imaginás..."
                className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors resize-none"/>
            </div>
            <a href="https://wa.me/5491112345678?text=Hola%20Jazmin!%20Me%20contacto%20desde%20tu%20web%20para%20consultar%20sobre%20un%20evento."
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-ink-900 text-white text-xs tracking-widest uppercase hover:bg-ink-700 transition-colors">
              <MessageCircle size={16}/> Enviar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <img src={BODA_IMG} alt="" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/55"/>
        <div className="relative text-center text-white max-w-2xl mx-auto">
          <Logo light className="mb-6 flex flex-col items-center"/>
          <div className="w-12 h-px bg-white/40 mx-auto mb-6"/>
          <p className="text-white/80 mb-8 text-base font-light">
            El evento que siempre imaginaste está más cerca de lo que creés
          </p>
          <a href="https://wa.me/5491112345678" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-ink-900 text-xs tracking-widest uppercase hover:bg-nude-100 transition-colors">
            <MessageCircle size={15}/> Escribinos hoy
          </a>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 bg-ink-900 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo light/>
          <div className="flex gap-8 text-xs tracking-widest uppercase text-white/40">
            <button onClick={()=>scrollTo('servicios')} className="hover:text-white/80 transition-colors">Servicios</button>
            <button onClick={()=>scrollTo('eventos')}   className="hover:text-white/80 transition-colors">Eventos</button>
            <button onClick={()=>scrollTo('galeria')}   className="hover:text-white/80 transition-colors">Galería</button>
            <Link to="/login" className="hover:text-white/80 transition-colors">Panel</Link>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://instagram.com/jazminrosenberg.eventos" target="_blank" rel="noreferrer"
              className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors">
              <Instagram size={15}/>
            </a>
            <a href="https://wa.me/5491112345678" target="_blank" rel="noreferrer"
              className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors">
              <MessageCircle size={15}/>
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-white/20 mt-8 tracking-widest uppercase">
          © 2026 Jazmin Rosenberg Organización de Eventos
        </div>
      </footer>
    </div>
  )
}
