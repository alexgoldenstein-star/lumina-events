import { Link } from 'react-router-dom'
import { Sparkles, CalendarCheck, Users, MessageCircle, Briefcase, Receipt, FileText, Star, Check, ArrowRight } from 'lucide-react'

const FEATURES = [
  { icon: CalendarCheck, title: 'Gestión de eventos',      desc: 'Bodas, cumpleaños, corporativos. Todo en un solo lugar con fechas, lugares y estado en tiempo real.' },
  { icon: Users,         title: 'Invitados con Excel',     desc: 'Importá tu lista desde Excel en segundos. Confirmaciones, restricciones y estados automáticos.' },
  { icon: MessageCircle, title: 'Mensajes WhatsApp',       desc: 'Plantillas automáticas prellenadas. Un clic y se abre WhatsApp listo para enviar.' },
  { icon: Briefcase,     title: 'Directorio de proveedores', desc: 'Guardá tus proveedores con categoría, rating y comisión. Todo a mano para cada evento.' },
  { icon: Receipt,       title: 'Presupuestos y comisiones', desc: 'Calculá automáticamente cuánto ganás en comisiones por cada proveedor.' },
  { icon: FileText,      title: 'Documentos del evento',  desc: 'Subí contratos, propuestas y archivos. Siempre disponibles desde cualquier dispositivo.' },
]

const TESTIMONIALS = [
  { name: 'Valentina R.', role: 'Organizadora de eventos, CABA', text: 'Antes perdía horas con el Excel de invitados. Ahora importo todo en segundos y mando los mensajes de WA directamente desde Lumina.', stars: 5 },
  { name: 'Lucía M.',     role: 'Wedding planner, Buenos Aires',  text: 'El sistema de seguimiento de invitados sin respuesta me cambió la vida. Ya no se me escapa nadie.', stars: 5 },
  { name: 'Carolina P.',  role: 'Eventos corporativos, Rosario',  text: 'Mis comisiones ahora se calculan solas. Sé exactamente cuánto voy a ganar en cada evento antes de cerrarlo.', stars: 5 },
]

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'gratis para siempre',
    features: ['Hasta 2 eventos activos', 'Hasta 50 invitados por evento', 'Mensajes WA ilimitados', 'Proveedores ilimitados'],
    cta: 'Empezar gratis',
    variant: 'outline',
    href: '/registro',
  },
  {
    name: 'Pro',
    price: '$15',
    period: 'USD / mes',
    features: ['Eventos ilimitados', 'Invitados ilimitados', 'Exportar PDF de invitados', 'Restricciones para catering', 'Soporte prioritario'],
    cta: 'Comenzar prueba 14 días',
    variant: 'primary',
    href: '/registro',
    highlight: true,
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-serif text-xl text-ink-800">Lumina Events</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-ink-500 hover:text-ink-800 transition-colors">Ingresar</Link>
            <Link to="/registro" className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-rose-50 via-white to-sage-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles size={14} /> La plataforma para organizadoras de eventos
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-ink-800 leading-tight mb-6">
            Organizá eventos<br />
            <span className="text-rose-500">sin el caos</span>
          </h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Invitados, WhatsApp, proveedores y presupuestos en un solo lugar.
            Diseñado para organizadoras que quieren trabajar mejor, no más.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/registro" className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors text-base">
              Empezar gratis <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-ink-700 border border-ink-200 rounded-xl font-medium hover:bg-rose-50 transition-colors text-base">
              Ya tengo cuenta
            </Link>
          </div>
          <p className="text-xs text-ink-400 mt-4">Sin tarjeta de crédito · Gratis para siempre en el plan básico</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-serif text-ink-800 mb-3">Todo lo que necesitás en un solo lugar</h2>
            <p className="text-ink-500">Pensado por y para organizadoras de eventos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 bg-white rounded-2xl border border-ink-100 hover:border-rose-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-rose-500" />
                </div>
                <h3 className="text-base font-medium text-ink-800 mb-2">{title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp highlight */}
      <section className="py-20 px-6 bg-gradient-to-r from-rose-50 to-sage-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-serif text-ink-800 mb-4">Mensajes de WhatsApp en un clic</h2>
            <p className="text-ink-500 leading-relaxed mb-6">
              Lumina genera el mensaje personalizado con el nombre del invitado, el evento y los datos del lugar. Vos solo apretás "Abrir en WhatsApp" y enviás.
            </p>
            <ul className="space-y-3">
              {['Primera confirmación automática', 'Seguimiento a los que no respondieron (+72hs)', 'Recordatorio días antes del evento', 'Mensaje el día del festejo'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink-700">
                  <Check size={15} className="text-sage-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#ECE5DD] rounded-2xl p-6">
            <div className="bg-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-sm p-4 text-sm text-ink-800 leading-relaxed max-w-xs">
              Hola <strong>María</strong> 👋, ¿cómo estás?{'\n\n'}
              Te escribo de <strong>JR Eventos</strong> en relación al festejo de <strong>Valentina — 15 años</strong>.{'\n\n'}
              ¿Podés confirmarnos tu asistencia? ¿Tenés alguna restricción alimentaria?{'\n\n'}
              ¡Muchas gracias! 🌸
            </div>
            <div className="mt-4 flex justify-end">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium">
                <MessageCircle size={15} /> Abrir en WhatsApp
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif text-ink-800 text-center mb-12">Lo que dicen las organizadoras</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-6 bg-white rounded-2xl border border-ink-100">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, i) => <Star key={i} size={14} className="text-gold-400 fill-gold-400" />)}
                </div>
                <p className="text-sm text-ink-600 leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-medium text-ink-800">{t.name}</p>
                  <p className="text-xs text-ink-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-ink-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif text-ink-800 text-center mb-3">Precios simples</h2>
          <p className="text-center text-ink-500 mb-12">Empezá gratis, crecé cuando quieras</p>
          <div className="grid md:grid-cols-2 gap-6">
            {PLANS.map(plan => (
              <div key={plan.name} className={`p-8 rounded-2xl border ${plan.highlight ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-ink-200'}`}>
                <h3 className={`text-lg font-medium mb-1 ${plan.highlight ? 'text-white' : 'text-ink-800'}`}>{plan.name}</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-serif ${plan.highlight ? 'text-white' : 'text-ink-800'}`}>{plan.price}</span>
                  <span className={`text-sm mb-1 ${plan.highlight ? 'text-rose-100' : 'text-ink-400'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 my-6">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-rose-50' : 'text-ink-600'}`}>
                      <Check size={14} className={plan.highlight ? 'text-white' : 'text-sage-500'} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.href}
                  className={`block text-center py-3 rounded-xl font-medium text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-white text-rose-600 hover:bg-rose-50'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 bg-gradient-to-br from-rose-500 to-rose-600 text-white text-center">
        <h2 className="text-3xl font-serif mb-4">¿Lista para organizar sin el caos?</h2>
        <p className="text-rose-100 mb-8 max-w-md mx-auto">Creá tu cuenta gratis en menos de un minuto. Sin tarjeta, sin compromisos.</p>
        <Link to="/registro" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-rose-600 rounded-xl font-medium hover:bg-rose-50 transition-colors text-base">
          Empezar ahora <ArrowRight size={16} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-ink-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-rose-500 rounded-md flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="font-serif text-ink-700">Lumina Events</span>
        </div>
        <p className="text-xs text-ink-400">© 2026 Lumina Events. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
