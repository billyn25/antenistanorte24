"""Stable editorial topic selection; no claim of local fault prevalence or completed jobs."""
from pathlib import Path
from html import escape as esc
import hashlib,json
TOPICS=json.loads((Path(__file__).resolve().parents[1]/'data/consultas-tecnicas.json').read_text())['topics']

def choose(key):
 return sorted(TOPICS,key=lambda t:hashlib.sha256(('norte-consultas-v1:'+str(key)+':'+t['slug']).encode()).digest())[:2]

def destination(topic):
 base='/comunidades/' if topic['service']=='iluminacion-led' else '/servicios/'+topic['service']+'/'
 return base+'#consulta-'+topic['slug']

def local_focus(key,name,services):
 a,b=choose(key)
 service=next((s for s in services if s['slug']==a['service']),None)
 if service:
  image=service['image'];alt=service['alt'];choice=service['title']
 else:
  image='iluminacion-led.webp';alt='Plafón LED circular con sensor integrado';choice='Iluminación LED y sensores'
 secondary='<details class="consultation-secondary" data-consultation-topic="'+esc(b['slug'])+'"><summary>'+esc(b['title'])+'</summary><p>'+esc(b['intro'])+'</p><a class="text-link" href="'+destination(b)+'">Qué comprobar</a></details>'
 return '<section class="section local-spotlight" style="background:#f0e9e4" data-consultation-topic="'+esc(a['slug'])+'"><div class="wrap content-columns"><div><span class="eyebrow">PARA TU CONSULTA EN '+esc(name.upper())+'</span><h2>'+esc(a['title'])+'</h2><p>'+esc(a['intro'])+'</p><h3>Qué revisamos</h3><p>'+esc(a['check'])+'</p><a class="text-link" href="'+destination(a)+'">Ver las comprobaciones del servicio</a>'+secondary+'</div><aside class="product-panel"><img src="/assets/'+esc(image,quote=True)+'" alt="'+esc(alt,quote=True)+'" width="640" height="480" loading="lazy" decoding="async"><h3>Datos para preparar el aviso</h3><p>'+esc(a['prepare'])+'</p><a class="text-link" href="#contacto" data-service-choice="'+esc(choice,quote=True)+'">Consultar en '+esc(name)+'</a></aside></div></section>'

def service_section(service):
 topics=[t for t in TOPICS if t['service']==service]
 if not topics:return ''
 items=''.join('<details id="consulta-'+esc(t['slug'])+'"><summary>'+esc(t['title'])+'</summary><p>'+esc(t['intro'])+'</p><h3>Qué comprobamos</h3><p>'+esc(t['check'])+'</p><h3>Qué datos enviar</h3><p>'+esc(t['prepare'])+'</p></details>' for t in topics)
 references=''
 if service=='antenas-parabolicas':references='<p class="small">Documentación de equipos: <a href="https://www.televes.com/es/lnb-quad-lnb-offset-quad-4-salidas-ha-va-hb-vb.html">LNB Quad</a>, <a href="https://www.televes.com/es/lnb-quattro-lnb-offset-quattro-4-salidas-ha-va-hb-vb.html">LNB Quattro</a> y <a href="https://www.televes.com/es/soporte/faqs/2013-1-8?url=en-el-mercado-existen-diferentes-lnbs-cual-es-la-diferencia-real-entre-ellos">tipos de LNB según Televes</a>.</p>'
 return '<section class="section consultation-library"><div class="wrap article"><span class="eyebrow">CONSULTAS Y COMPROBACIONES</span><h2>Identifica el síntoma<br>antes de elegir una solución.</h2><p>Abre la consulta que se parece a tu instalación. Los datos del equipo y el alcance del fallo ayudan a preparar la revisión.</p><div class="faq-list">'+items+'</div>'+references+'</div></section>'

def satellite_platforms():
 return '''<section class="section choice-section" id="astra-hispasat-television-francesa"><div class="wrap"><span class="eyebrow">SATÉLITES, RECEPTORES Y ACCESO</span><h2>Elige qué quieres recibir.<br>Después se define la instalación.</h2><div class="choice-grid"><article class="choice-card"><h3>Astra 19,2° Este</h3><p>Es una posición orbital que transporta servicios en abierto y de plataformas. Se comprueban canal, emisión vigente y receptor necesario. Que aparezca un nombre en una lista descargada no garantiza disponibilidad.</p><a href="https://www.ses.com/newsroom/enhancing-tv-experiences-over-192-degrees-east">SES · servicios en 19,2° Este</a></article><article class="choice-card"><h3>Hispasat 30° Oeste</h3><p>La orientación, la cobertura y el servicio deseado se valoran para esa posición. Las señales de distribución profesional y los servicios domésticos no son equivalentes: un receptor convencional no recibe cualquier transmisión.</p><a href="https://www.hispasat.com/es/soluciones-y-servicios/video/distribucion">Hispasat · distribución de televisión y radio</a></article><article class="choice-card"><h3>TNTSAT y FRANSAT</h3><p>TNTSAT utiliza Astra 19,2° Este; FRANSAT, Eutelsat 5 West B en 5° Oeste. Requieren equipos y acceso compatibles. Antes de valorar una instalación se verifican cobertura y condiciones territoriales: no son dos nombres para el mismo receptor ni plataformas de uso universal.</p><a href="https://www.tntsat.tv/vos-questions.htm">TNTSAT · preguntas y condiciones</a><br><a href="https://www.fransat.fr/assistance-fransat/satellite-e5wb/je-suis-hors-de-france-metropolitaine-et-je-ne-recois-plus-les-chaines-de-la-tnt-fransat/">FRANSAT · recepción fuera del territorio de servicio</a></article></div><div class="article" style="margin-top:30px"><h3>Movistar Plus+ por satélite: recepción y servicio contratado</h3><p>Si ya dispones de una instalación de televisión por satélite de Movistar, comunica modelo de decodificador y mensaje exacto. Se distingue la señal recibida de una incidencia de acceso, abono o equipo del operador. El ajuste de la parabólica no añade derechos de visualización ni sustituye el soporte o las condiciones del servicio contratado.</p><h3>Canales libres, radio y UHD</h3><p>La búsqueda debe ajustarse al sistema recibido. Se revisan modo TV/radio, lista vigente y compatibilidad de transmisión y códec cuando un servicio aparece sin imagen. Para la recepción terrestre y sus cambios de emisión, consulta <a href="/servicios/sintonizacion-televisores/">sintonización TDT y compatibilidad UHD</a>.</p></div></div></section>'''
