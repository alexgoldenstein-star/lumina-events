import { Link } from 'react-router-dom'
import { Star, ArrowRight, MessageCircle, Instagram,
  Camera, Music, Flower, ChefHat, Users, Calendar, Shield, Sparkles } from 'lucide-react'
import LogoJR from '../components/ui/LogoJR'

// Fotos Unsplash con IDs específicos y verificados
const IMGS = {
  hero:     'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80',
  boda:     'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=700&q=80',
  quince:   'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=700&q=80',
  corp:     'https://images.unsplash.com/photo-1511578314322-379afb476865?w=700&q=80',
  deco:     'https://images.unsplash.com/photo-1478146059778-26b2ec6d2891?w=700&q=80',
  cumple:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
  salon:    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=700&q=80',
  flores:   'https://images.unsplash.com/photo-1487530811015-780ec32b2a4a?w=600&q=80',
  brindis:  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80',
  torta:    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
  musica:   'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80',
  foto:     'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80',
  catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80',
}

const TIPOS = [
  { img:IMGS.boda,   label:'Bodas & Casamientos', desc:'Coordinación integral del día más especial' },
  { img:IMGS.quince, label:'15 años',             desc:'Fiestas de quince con magia y detalle'     },
  { img:IMGS.corp,   label:'Corporativos',         desc:'Eventos empresariales y lanzamientos'      },
  { img:IMGS.deco,   label:'Fiestas temáticas',   desc:'Ambientación completamente personalizada'   },
  { img:IMGS.cumple, label:'Cumpleaños',           desc:'Celebraciones únicas para todas las edades'},
  { img:IMGS.salon,  label:'Graduaciones',         desc:'Cenas de egresados y colaciones'           },
]

const GALERIA = [
  { img:IMGS.flores,  label:'Decoración floral'  },
  { img:IMGS.brindis, label:'Momentos únicos'    },
  { img:IMGS.torta,   label:'Repostería'         },
  { img:IMGS.musica,  label:'Música & ambiente'  },
  { img:IMGS.foto,    label:'Fotografía'         },
  { img:IMGS.catering,label:'Gastronomía'        },
]

const TESTIMONIOS = [
  { nombre:'Valentina & Rodrigo', tipo:'Boda · Diciembre 2024',
    texto:'Jazmin hizo que nuestro casamiento fuera exactamente como lo soñamos. Cada detalle, perfecto.' },
  { nombre:'Familia Martínez',    tipo:'15 años · Octubre 2024',
    texto:'El festejo fue mágico. Jazmin se encargó de absolutamente todo y nosotros pudimos disfrutar.' },
  { nombre:'TechCorp Argentina',  tipo:'Evento corporativo · 2024',
    texto:'Profesionalismo total. Organizó nuestra cena con 200 personas sin un solo inconveniente.' },
]

function scrollTo(id) { document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }) }

// Imagen con fallback si falla
function Img({ src, alt, className }) {
  return (
    <img src={src} alt={alt||''} className={className}
      onError={e => { e.target.style.background='#EDE0D0'; e.target.src='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==' }}
    />
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-nude-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <LogoJR size="sm"/>
          <div className="hidden md:flex items-center gap-8 text-[11px] tracking-widest uppercase text-ink-400">
            <button onClick={()=>scrollTo('servicios')} className="hover:text-ink-900 transition-colors">Servicios</button>
            <button onClick={()=>scrollTo('eventos')}   className="hover:text-ink-900 transition-colors">Eventos</button>
            <button onClick={()=>scrollTo('galeria')}   className="hover:text-ink-900 transition-colors">Galería</button>
            <button onClick={()=>scrollTo('contacto')}  className="hover:text-ink-900 transition-colors">Contacto</button>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden md:block text-[11px] tracking-widest uppercase text-ink-400 hover:text-ink-900 transition-colors">
              Panel
            </Link>
            <button onClick={()=>scrollTo('contacto')}
              className="text-[11px] tracking-widest uppercase px-5 py-2.5 bg-ink-900 text-white hover:bg-ink-700 transition-colors">
              Contacto
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Img src={IMGS.hero} alt="Evento" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/45"/>
        <div className="relative text-center text-white px-6 max-w-4xl mx-auto">
          <LogoJR size="2xl" light className="mb-6"/>
          <div className="w-16 h-px bg-white/40 mx-auto mb-7"/>
          <p className="text-base md:text-xl text-white/85 max-w-xl mx-auto font-light leading-relaxed">
            Transformamos cada celebración en una experiencia única e irrepetible
          </p>
          <div className="flex gap-4 justify-center mt-10 flex-wrap">
            <button onClick={()=>scrollTo('contacto')}
              className="px-8 py-4 bg-white text-ink-900 text-[11px] tracking-widest uppercase hover:bg-nude-100 transition-colors">
              Consultá tu evento
            </button>
            <button onClick={()=>scrollTo('eventos')}
              className="px-8 py-4 border border-white/60 text-white text-[11px] tracking-widest uppercase hover:bg-white/10 transition-colors">
              Ver trabajos
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-12 bg-white/40 animate-pulse"/>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-nude-50 border-y border-nude-200">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[['150+','Eventos realizados'],['5','Años de experiencia'],['100%','Satisfacción'],['50+','Proveedores aliados']].map(([n,l])=>(
            <div key={l} className="text-center">
              <div className="text-3xl md:text-4xl font-light text-ink-900 mb-1" style={{fontFamily:'Georgia, serif'}}>{n}</div>
              <div className="text-[10px] text-ink-400 tracking-widest uppercase">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tipos ──────────────────────────────────────────────────────── */}
      <section id="eventos" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] text-ink-400 tracking-widest uppercase mb-4">Especialidades</p>
            <h2 className="text-3xl font-light text-ink-900" style={{fontFamily:'Georgia, serif'}}>Cada celebración, única</h2>
            <div className="w-12 h-px bg-nude-400 mx-auto mt-4"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIPOS.map(e=>(
              <div key={e.label} className="group relative overflow-hidden cursor-pointer">
                <Img src={e.img} alt={e.label} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"/>
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
            <p className="text-[11px] text-ink-400 tracking-widest uppercase mb-4">Cómo trabajamos</p>
            <h2 className="text-3xl font-light text-ink-900" style={{fontFamily:'Georgia, serif'}}>Un servicio integral</h2>
            <div className="w-12 h-px bg-nude-400 mx-auto mt-4"/>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="relative overflow-hidden md:row-span-2 group min-h-80">
              <Img src={IMGS.salon} alt="Coordinación" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"/>
              <div className="absolute bottom-0 p-8 text-white">
                <p className="text-[11px] tracking-widest uppercase text-white/50 mb-2">Servicio principal</p>
                <h3 className="text-2xl font-light mb-3" style={{fontFamily:'Georgia, serif'}}>
                  Desde la primera reunión hasta el último brindis
                </h3>
                <p className="text-white/70 text-sm font-light leading-relaxed">
                  Me encargo de cada detalle para que vos puedas disfrutar sin preocupaciones.
                </p>
              </div>
            </div>
            {[
              { icon:Users,    title:'Red de proveedores',    desc:'Los mejores salones, fotógrafos, DJs y caterings de la zona.' },
              { icon:Shield,   title:'Transparencia total',   desc:'Presupuesto detallado y comunicación constante en todo momento.' },
              { icon:MessageCircle, title:'Siempre disponible', desc:'Respondo rápido porque sé que los tiempos del evento no esperan.' },
              { icon:Sparkles, title:'Atención personalizada', desc:'Escucho tu visión y la transformo en realidad con precisión.' },
            ].map(({ icon:Icon, title, desc })=>(
              <div key={title} className="bg-white border border-nude-200 p-6">
                <Icon size={20} className="text-nude-500 mb-4"/>
                <h3 className="text-sm font-medium text-ink-900 mb-2">{title}</h3>
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
            <p className="text-[11px] text-ink-400 tracking-widest uppercase mb-4">Portfolio</p>
            <h2 className="text-3xl font-light text-ink-900" style={{fontFamily:'Georgia, serif'}}>Momentos que perduran</h2>
            <div className="w-12 h-px bg-nude-400 mx-auto mt-4"/>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {GALERIA.map((item,i)=>(
              <div key={i} className={`relative overflow-hidden group cursor-pointer ${i===0?'md:row-span-2':''}`}>
                <Img src={item.img} alt={item.label}
                  className={`w-full object-cover group-hover:scale-105 transition-transform duration-700 ${i===0?'h-full min-h-80':'h-52'}`}/>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-white text-[11px] tracking-widest uppercase">{item.label}</span>
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
            <p className="text-[11px] text-ink-400 tracking-widest uppercase mb-4">Alianzas estratégicas</p>
            <h2 className="text-3xl font-light text-ink-900" style={{fontFamily:'Georgia, serif'}}>Trabajamos con los mejores</h2>
            <div className="w-12 h-px bg-nude-400 mx-auto mt-4"/>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon:Camera,  label:'Fotografía & Video',    img:IMGS.foto     },
              { icon:Music,   label:'Música & DJ',           img:IMGS.musica   },
              { icon:Flower,  label:'Decoración & Flores',   img:IMGS.flores   },
              { icon:ChefHat, label:'Catering & Repostería', img:IMGS.catering },
            ].map(({ icon:Icon, label, img })=>(
              <div key={label} className="group relative overflow-hidden">
                <Img src={img} alt={label} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
                <div className="absolute bottom-0 p-3 text-white">
                  <Icon size={13} className="mb-1 text-nude-300"/>
                  <p className="text-[11px] leading-tight tracking-wide">{label}</p>
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
            <p className="text-[11px] text-ink-400 tracking-widest uppercase mb-4">Testimonios</p>
            <h2 className="text-3xl font-light text-ink-900" style={{fontFamily:'Georgia, serif'}}>Lo que dicen nuestros clientes</h2>
            <div className="flex justify-center gap-0.5 mt-3">
              {[...Array(5)].map((_,i)=><Star key={i} size={14} className="text-nude-500 fill-nude-500"/>)}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIOS.map(t=>(
              <div key={t.nombre} className="bg-nude-50 border border-nude-200 p-8">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_,i)=><Star key={i} size={11} className="text-nude-500 fill-nude-500"/>)}
                </div>
                <p className="text-sm text-ink-600 leading-relaxed mb-6 italic font-light">"{t.texto}"</p>
                <p className="text-xs font-medium text-ink-900">{t.nombre}</p>
                <p className="text-[10px] text-nude-500 mt-0.5 tracking-widest uppercase">{t.tipo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contacto ───────────────────────────────────────────────────── */}
      <section id="contacto" className="py-20 px-6 bg-nude-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[11px] text-ink-400 tracking-widest uppercase mb-4">Contacto</p>
            <h2 className="text-3xl font-light text-ink-900 mb-4" style={{fontFamily:'Georgia, serif'}}>
              Hablemos de tu evento
            </h2>
            <div className="w-12 h-px bg-nude-400 mb-6"/>
            <p className="text-sm text-ink-500 leading-relaxed font-light mb-8">
              Cada evento es único. Contame tu visión y juntas lo hacemos realidad.
              Respondo en menos de 24 horas.
            </p>
            <div className="space-y-5">
              {[
                { href:'https://wa.me/5491112345678', Icon:MessageCircle, label:'WhatsApp', sub:'+54 9 11 1234-5678' },
                { href:'mailto:hola@jazminrosenberg.com.ar', Icon:()=><span className="text-sm font-light">@</span>, label:'Email', sub:'hola@jazminrosenberg.com.ar' },
                { href:'https://instagram.com/jazminrosenberg.eventos', Icon:Instagram, label:'Instagram', sub:'@jazminrosenberg.eventos' },
              ].map(({ href, Icon, label, sub })=>(
                <a key={label} href={href} target={href.startsWith('http')?'_blank':undefined} rel="noreferrer"
                  className="flex items-center gap-4 text-ink-600 hover:text-ink-900 transition-colors group">
                  <div className="w-10 h-10 border border-nude-300 flex items-center justify-center group-hover:border-ink-900 transition-colors flex-shrink-0">
                    <Icon size={16}/>
                  </div>
                  <div>
                    <p className="text-[11px] tracking-widest uppercase font-medium">{label}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{sub}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label:'Nombre', ph:'Tu nombre', type:'text' },
              { label:'WhatsApp', ph:'11 1234-5678', type:'tel' },
            ].map(f=>(
              <div key={f.label}>
                <label className="block text-[11px] tracking-widest uppercase text-ink-400 mb-2">{f.label}</label>
                <input type={f.type} placeholder={f.ph} className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors"/>
              </div>
            ))}
            <div>
              <label className="block text-[11px] tracking-widest uppercase text-ink-400 mb-2">Tipo de evento</label>
              <select className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors text-ink-800">
                <option>Boda / Casamiento</option><option>15 años</option>
                <option>Cumpleaños</option><option>Evento corporativo</option><option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] tracking-widest uppercase text-ink-400 mb-2">Tu visión</label>
              <textarea rows={4} placeholder="Fecha, cantidad de personas, estilo que imaginás..."
                className="w-full px-4 py-3 text-sm border border-nude-300 bg-white outline-none focus:border-ink-900 transition-colors resize-none"/>
            </div>
            <a href="https://wa.me/5491112345678?text=Hola%20Jazmin!%20Me%20contacto%20desde%20tu%20web."
              target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 bg-ink-900 text-white text-[11px] tracking-widest uppercase hover:bg-ink-700 transition-colors">
              <MessageCircle size={15}/> Enviar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <Img src={IMGS.boda} alt="" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black/55"/>
        <div className="relative text-center text-white max-w-xl mx-auto">
          <LogoJR size="lg" light className="mb-6"/>
          <div className="w-12 h-px bg-white/40 mx-auto mb-6"/>
          <p className="text-white/75 mb-8 font-light">El evento que siempre imaginaste está más cerca de lo que creés</p>
          <a href="https://wa.me/5491112345678" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-ink-900 text-[11px] tracking-widest uppercase hover:bg-nude-100 transition-colors">
            <MessageCircle size={14}/> Escribinos hoy
          </a>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 bg-ink-900 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <LogoJR size="sm" light/>
          <div className="flex gap-8 text-[11px] tracking-widest uppercase text-white/40">
            <button onClick={()=>scrollTo('servicios')} className="hover:text-white/80 transition-colors">Servicios</button>
            <button onClick={()=>scrollTo('eventos')}   className="hover:text-white/80 transition-colors">Eventos</button>
            <button onClick={()=>scrollTo('galeria')}   className="hover:text-white/80 transition-colors">Galería</button>
            <Link to="/login" className="hover:text-white/80 transition-colors">Panel</Link>
          </div>
          <div className="flex gap-3">
            {[
              { href:'https://instagram.com/jazminrosenberg.eventos', Icon:Instagram },
              { href:'https://wa.me/5491112345678', Icon:MessageCircle },
            ].map(({ href, Icon })=>(
              <a key={href} href={href} target="_blank" rel="noreferrer"
                className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors">
                <Icon size={14}/>
              </a>
            ))}
          </div>
        </div>
        <div className="text-center text-[10px] text-white/20 mt-8 tracking-widest uppercase">
          © 2026 Jazmin Rosenberg · Organización de Eventos
        </div>
      </footer>
    </div>
  )
}
