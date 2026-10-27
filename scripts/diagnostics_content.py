"""Stable editorial topic selection; no claim of local fault prevalence or completed jobs."""
from pathlib import Path
from html import escape as esc
import hashlib,json
TOPICS=json.loads((Path(__file__).resolve().parents[1]/'data/consultas-tecnicas.json').read_text())['topics']

def choose(key):
 return sorted(TOPICS,key=lambda t:hashlib.sha256(('norte-consultas-v1:'+str(key)+':'+t['slug']).encode()).digest())[:3]

def choose_primary(key):
 """One relevant example per main service; never a claim of local incidence."""
 signal_topics={
  'coaxial-agua-humedad','mer-nivel-alto','cabecera-falta-multiplex',
  'receptor-externo-entrada','mastil-caido-viento','dipolo-antena-roto-ausente',
  'dipolo-activo-alimentacion','cable-exterior-polietileno-uv',
  'conectores-antena-blindados','tdt-intermitente-atmosfera',
  'sustitucion-coaxial-completo','coaxial-interior-blindaje',
 }
 groups=[
  [t for t in TOPICS if t['slug'] in signal_topics and t['service'] in {'antenas-tdt','amplificacion-tdt-satelite'}],
  [t for t in TOPICS if t['service']=='porteros-automaticos'],
  [t for t in TOPICS if t['service']=='videoporteros'],
 ]
 return [min(group,key=lambda t:hashlib.sha256(('norte-consultas-primary-v1:'+str(key)+':'+t['slug']).encode()).digest()) for group in groups]

def destination(topic):
 base='/comunidades/' if topic['service']=='iluminacion-led' else '/servicios/'+topic['service']+'/'
 return base+'#consulta-'+topic['slug']

def local_focus(key,name,services,*,topic_slugs=None):
 """Illustrative questions, explicitly labelled; existing technical answers stay intact."""
 by_slug={t['slug']:t for t in TOPICS}
 topics=[by_slug[slug] for slug in topic_slugs] if topic_slugs else choose_primary(key)
 service_names={s['slug']:s['title'] for s in services}
 service_names['iluminacion-led']='Iluminación LED y sensores'
 avatar='<span class="consultation-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg></span>'
 cards=[]
 for topic in topics:
  service=service_names[topic['service']]
  choice=topic.get('choice',service)
  cards.append(f'''<article class="consultation-card" data-consultation-topic="{esc(topic['slug'],quote=True)}">
<div class="consultation-person">{avatar}<div><span class="consultation-label">Consulta de ejemplo</span><h3>{esc(service)}</h3></div></div>
<blockquote><p>«{esc(topic['example'])}»</p></blockquote>
<details class="consultation-detail" id="consulta-local-{esc(topic['slug'],quote=True)}"><summary>Cómo estudiaríamos este caso</summary>
<div class="consultation-answer"><h4>{esc(topic['title'])}</h4><p>{esc(topic['intro'])}</p><h4>Qué comprobamos</h4><p>{esc(topic['check'])}</p><h4>Datos para preparar el aviso</h4><p>{esc(topic['prepare'])}</p>
<div class="consultation-links"><a class="text-link" href="{destination(topic)}">Ampliar la explicación</a><a class="text-link" href="#contacto" data-service-choice="{esc(choice,quote=True)}">Consultar mi caso</a></div></div></details></article>''')
 title='¿Te ocurre algo parecido<br>en '+esc(name)+'?' if name else '¿Te ocurre algo parecido<br>en casa o en tu comunidad?'
 return f'''<section class="section local-consultations" id="consultas" aria-labelledby="consultas-title"><div class="wrap">
<div class="split-heading"><div><span class="eyebrow">CONSULTAS DE EJEMPLO</span><h2 id="consultas-title">{title}</h2></div><p>Situaciones redactadas para explicar cómo revisaríamos cada instalación. El diagnóstico depende de las comprobaciones de tu caso.</p></div>
<div class="consultation-grid">{''.join(cards)}</div></div></section>'''

def topic_sources(topic):
 sources=topic.get('sources',[])
 if not sources:return ''
 return '<p class="small">Documentación: '+', '.join('<a href="'+esc(s['url'],quote=True)+'">'+esc(s['label'])+'</a>' for s in sources)+'.</p>'

def service_section(service):
 topics=[t for t in TOPICS if t['service']==service]
 if not topics:return ''
 items=''.join('<details id="consulta-'+esc(t['slug'])+'"><summary>'+esc(t['title'])+'</summary><p>'+esc(t['intro'])+'</p><h3>Qué comprobamos</h3><p>'+esc(t['check'])+'</p><h3>Qué datos enviar</h3><p>'+esc(t['prepare'])+'</p>'+topic_sources(t)+'</details>' for t in topics)
 references=''
 if service=='antenas-parabolicas':references='<p class="small">Documentación de equipos: <a href="https://www.televes.com/es/lnb-quad-lnb-offset-quad-4-salidas-ha-va-hb-vb.html">LNB Quad</a>, <a href="https://www.televes.com/es/lnb-quattro-lnb-offset-quattro-4-salidas-ha-va-hb-vb.html">LNB Quattro</a> y <a href="https://www.televes.com/es/soporte/faqs/2013-1-8?url=en-el-mercado-existen-diferentes-lnbs-cual-es-la-diferencia-real-entre-ellos">tipos de LNB según Televes</a>.</p>'
 return '<section class="section consultation-library"><div class="wrap article"><span class="eyebrow">CONSULTAS Y COMPROBACIONES</span><h2>Identifica el síntoma<br>antes de elegir una solución.</h2><p>Abre la consulta que se parece a tu instalación. Los datos del equipo y el alcance del fallo ayudan a preparar la revisión.</p><div class="faq-list">'+items+'</div>'+references+'</div></section>'

def satellite_platforms():
 return '''<section class="section choice-section" id="astra-hispasat-television-francesa"><div class="wrap"><span class="eyebrow">SATÉLITES, RECEPTORES Y ACCESO</span><h2>Elige qué quieres recibir.<br>Después se define la instalación.</h2><div class="choice-grid"><article class="choice-card"><h3>Astra 19,2° Este</h3><p>Es una posición orbital que transporta servicios en abierto y de plataformas. Se comprueban canal, emisión vigente y receptor necesario. Que aparezca un nombre en una lista descargada no garantiza disponibilidad.</p><a href="https://www.ses.com/newsroom/enhancing-tv-experiences-over-192-degrees-east">SES · servicios en 19,2° Este</a></article><article class="choice-card"><h3>Hispasat 30° Oeste</h3><p>La orientación, la cobertura y el servicio deseado se valoran para esa posición. Las señales de distribución profesional y los servicios domésticos no son equivalentes: un receptor convencional no recibe cualquier transmisión.</p><a href="https://www.hispasat.com/es/soluciones-y-servicios/video/distribucion">Hispasat · distribución de televisión y radio</a></article><article class="choice-card"><h3>TNTSAT y FRANSAT</h3><p>TNTSAT utiliza Astra 19,2° Este; FRANSAT, Eutelsat 5 West B en 5° Oeste. Requieren equipos y acceso compatibles. Antes de valorar una instalación se verifican cobertura y condiciones territoriales: no son dos nombres para el mismo receptor ni plataformas de uso universal.</p><a href="https://www.tntsat.tv/vos-questions.htm">TNTSAT · preguntas y condiciones</a><br><a href="https://www.fransat.fr/assistance-fransat/satellite-e5wb/je-suis-hors-de-france-metropolitaine-et-je-ne-recois-plus-les-chaines-de-la-tnt-fransat/">FRANSAT · recepción fuera del territorio de servicio</a></article></div><div class="article" style="margin-top:30px"><h3>Movistar Plus+ por satélite: recepción y servicio contratado</h3><p>Si ya dispones de una instalación de televisión por satélite de Movistar, comunica modelo de decodificador y mensaje exacto. Se distingue la señal recibida de una incidencia de acceso, abono o equipo del operador. El ajuste de la parabólica no añade derechos de visualización ni sustituye el soporte o las condiciones del servicio contratado.</p><h3>Canales libres, radio y UHD</h3><p>La búsqueda debe ajustarse al sistema recibido. Se revisan modo TV/radio, lista vigente y compatibilidad de transmisión y códec cuando un servicio aparece sin imagen. Para la recepción terrestre y sus cambios de emisión, consulta <a href="/servicios/sintonizacion-televisores/">sintonización TDT y compatibilidad UHD</a>.</p></div></div></section>'''
