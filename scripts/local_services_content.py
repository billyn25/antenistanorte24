"""Visible service summaries for existing local and provincial landing pages."""
from html import escape as esc


PRIMARY_SERVICES = (
    {
        'slug': 'antenas-tdt',
        'heading': 'Instalación y reparación de antenas',
        'short_heading': 'Antenas TDT y parabólicas',
        'repair': 'Si faltan canales, la imagen se pixela o una toma no funciona, revisamos recepción, amplificación, alimentación y cableado. Comparamos la señal en distintos puntos para localizar la avería; si afecta a varios vecinos, comprobamos también la instalación colectiva.',
        'installation': 'Montamos antenas TDT y parabólicas, ajustamos orientación y estudiamos soportes, recorrido del cable y tomas. En satélite, indica qué emisión quieres recibir para comprobar receptor y equipos compatibles.',
        'overview': 'Instalación y reparación de antenas TDT y parabólicas para viviendas y comunidades. Medimos recepción y distribución cuando faltan canales, aparecen píxeles o falla una toma. Revisamos orientación, alimentación, amplificación y cableado antes de proponer cambios; en satélite también comprobamos el receptor y la emisión que quieres recibir.',
        'guide': '/guias/television-se-pixela/',
        'guide_label': 'Qué revisar si la televisión se pixela',
        'service_label': 'Instalación y reparación de antenas TDT',
    },
    {
        'slug': 'porteros-automaticos',
        'heading': 'Instalación y reparación de porteros automáticos',
        'short_heading': 'Porteros automáticos',
        'repair': 'Reparamos fallos de llamada, audio y apertura. Comprobamos telefonillo, placa de calle, alimentador y abrepuertas para distinguir una avería de vivienda de un problema del portal. Indica si otros vecinos tienen el mismo fallo.',
        'installation': 'Instalamos porteros de audio y sustituimos terminales compatibles. Para renovar una comunidad, revisamos tecnología, cableado, viviendas y accesos antes de elegir el equipo. Trabajamos con referencias de Fermax, Tegui o Golmar, según compatibilidad y recambios disponibles.',
        'overview': 'Instalación y reparación de telefonillos, placas de calle y abrepuertas. Si no suena, no se escucha o no abre la puerta, diferenciamos el terminal de una vivienda de los elementos comunes. Para sustituir o renovar, identificamos sistema, cableado y referencias compatibles con el portero existente.',
        'guide': '/guias/portero-no-funciona/',
        'guide_label': 'Si el portero no suena, no se oye o no abre',
        'service_label': 'Instalación y reparación de porteros automáticos',
    },
    {
        'slug': 'videoporteros',
        'heading': 'Instalación y reparación de videoporteros',
        'short_heading': 'Videoporteros',
        'repair': 'Revisamos imagen, sonido, llamada y apertura cuando el monitor falla o la placa no responde. Comprobamos si la incidencia está en una vivienda, la alimentación o el sistema comunitario. Una pantalla sin imagen no implica cambiar todo el conjunto.',
        'installation': 'Instalamos y renovamos placas y monitores, incluido el cambio de portero de audio a vídeo. Valoramos cableado y compatibilidad; reutilizar cables o atender llamadas desde el móvil depende del sistema elegido.',
        'overview': 'Instalación, reparación y renovación de placas y monitores de videoportero. Revisamos imagen, sonido, llamada y apertura para viviendas y comunidades. Si quieres pasar de audio a vídeo, estudiamos el cableado existente; las soluciones de dos hilos y las llamadas al móvil se valoran según la compatibilidad del sistema.',
        'guide': '/guias/cambiar-portero-por-videoportero/',
        'guide_label': 'Qué revisar al cambiar a videoportero',
        'service_label': 'Instalación y reparación de videoporteros',
    },
)


def local_primary_services(name, services, product_renderer):
    """Three main service blocks; locality names locate service, not past jobs."""
    by_slug = {service['slug']: service for service in services}
    articles = []
    for item in PRIMARY_SERVICES:
        service = by_slug[item['slug']]
        articles.append(
            f'<article class="primary-service" id="{item["slug"]}">'
            f'<h2>{esc(item["heading"])} en {esc(name)}</h2>'
            f'{product_renderer(service)}'
            f'<h3>Reparación</h3><p>{esc(item["repair"])}</p>'
            f'<h3>Instalación y renovación</h3><p>{esc(item["installation"])}</p>'
            '<div class="primary-service-links">'
            f'<a class="text-link" href="{item["guide"]}">{esc(item["guide_label"])}</a>'
            f'<a class="text-link local-request" href="#contacto" data-service-choice="{esc(service["title"], quote=True)}">Consultar este servicio</a>'
            '</div></article>'
        )
    return (
        '<section class="section primary-services" id="servicios"><div class="wrap">'
        '<span class="eyebrow">ANTENAS · PORTEROS · VIDEOPORTEROS</span>'
        '<p class="primary-intro">Una avería, una instalación nueva o la renovación de tu comunidad. '
        'Encuentra qué revisamos y qué información ayuda a preparar cada trabajo.</p>'
        '<div class="primary-service-grid">' + ''.join(articles) + '</div></div></section>'
    )


def overview_services(services, product_renderer, place=''):
    """Compact summaries for home/province pages, without repeated anchor IDs."""
    by_slug = {service['slug']: service for service in services}
    suffix = ' en ' + esc(place) if place else ''
    articles = []
    for item in PRIMARY_SERVICES:
        service = by_slug[item['slug']]
        articles.append(
            '<article class="primary-service">'
            f'<h3>{esc(item["short_heading"])}{suffix}</h3>'
            f'{product_renderer(service)}<p>{esc(item["overview"])}</p>'
            '<div class="primary-service-links">'
            f'<a class="text-link" href="/servicios/{item["slug"]}/">{esc(item["service_label"])}</a>'
            '</div></article>'
        )
    return '<div class="primary-service-grid">' + ''.join(articles) + '</div>'
