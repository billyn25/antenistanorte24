"""Local channel enquiries, with stable selection and no claim of an active outage.

The three editorial families describe different checks, rather than assigning
invented faults or reception guarantees to municipalities. RF frequencies and
channel-to-multiplex mappings remain in the sourced TDT modules.
"""

from hashlib import sha256
from html import escape


NATIONAL_CASES = (
    {
        "slug": "telecinco-noche",
        "channel": "Telecinco",
        "time": "Por la noche",
        "title": "¿Telecinco falla por la noche en {name}?",
        "observe": "Si la imagen se congela durante la cena y vuelve más tarde, anota la hora de inicio, la duración y si también desaparece el sonido.",
        "compare": "Comprueba otro canal y otra toma durante el corte; interesa saber si varios vecinos pierden la señal a la vez.",
        "review": "Se compara la calidad cuando funciona y cuando falla. Las mediciones permiten valorar recepción, alimentación o cabecera antes de sustituir equipos.",
    },
    {
        "slug": "antena3-tarde",
        "channel": "Antena 3",
        "time": "Por la tarde",
        "title": "¿No se ve Antena 3 por la tarde en {name}?",
        "observe": "Si Antena 3 se queda sin imagen mientras otras cadenas funcionan, conserva la lista de canales afectados y comprueba si el fallo se repite cada tarde.",
        "compare": "Contrasta el mismo programa en otra televisión. Una pérdida parcial necesita identificar las señales afectadas, no aumentar toda la amplificación.",
        "review": "Se mide entrada y salida de cabecera y después la toma. Según el resultado, se corrige el ajuste o el tramo que pierde calidad.",
    },
    {
        "slug": "la1-mediodia",
        "channel": "La 1",
        "time": "Al mediodía",
        "title": "¿La 1 se pixela al mediodía en {name}?",
        "observe": "Si empieza bien y aparecen cuadros después de varias horas, distingue el momento del día del tiempo que llevan encendidos el televisor y el receptor.",
        "compare": "Anota si sucede también en otra toma y si el equipo muestra un mensaje de señal o se reinicia por completo.",
        "review": "Se contrasta recepción con alimentación y funcionamiento del equipo. Un componente que pierde estabilidad necesita una comprobación específica antes de decidir el recambio.",
    },
    {
        "slug": "lasexta-anochecer",
        "channel": "laSexta",
        "time": "Al anochecer",
        "title": "¿laSexta pierde señal al anochecer en {name}?",
        "observe": "Si el corte coincide con el anochecer, apunta si ocurre todos los días o solo en algunos episodios y cuánto tarda la imagen en recuperarse.",
        "compare": "Compara los canales afectados con los que permanecen estables. El horario ayuda a repetir la medición, pero no identifica una interferencia móvil.",
        "review": "Se estudian calidad, señales no deseadas y margen de recepción. Solo se propone filtrado, orientación o ajuste cuando las medidas justifican esa actuación.",
    },
    {
        "slug": "cuatro-noche",
        "channel": "Cuatro",
        "time": "Por la noche",
        "title": "¿Cuatro se corta por la noche en {name}?",
        "observe": "Si Cuatro falla por antena pero funciona en su aplicación, explica por qué vía lo ves: las dos opciones utilizan conexiones diferentes.",
        "compare": "Comprueba si el corte afecta al sintonizador del televisor, a un receptor externo o también a otros canales recibidos por antena.",
        "review": "Se revisa la vía afectada: señal y coaxial para TDT, o conexión y dispositivo para Internet. Cambiar la antena no resuelve un fallo de reproducción en línea.",
    },
    {
        "slug": "antena3-manana",
        "channel": "Antena 3",
        "time": "Por la mañana",
        "title": "¿Antena 3 no aparece al encender por la mañana en {name}?",
        "observe": "Si el programa falta al encender y aparece minutos después, anota si ocurre al salir del modo de espera o después de desconectar la alimentación.",
        "compare": "Revisa el mensaje del receptor y si otros televisores reciben Antena 3 en ese momento, sin borrar todavía la lista de canales.",
        "review": "Se distingue un problema de arranque o configuración de una señal insuficiente. La solución depende de comprobar receptor, alimentación y recepción en la toma.",
    },
    {
        "slug": "telecinco-tarde",
        "channel": "Telecinco",
        "time": "Por la tarde",
        "title": "¿Telecinco falla por la tarde en varias viviendas de {name}?",
        "observe": "Si distintos vecinos pierden Telecinco a la misma hora, ayuda conocer cuántas viviendas están afectadas y si otras cadenas siguen funcionando.",
        "compare": "Contrasta un piso próximo y otro de una planta distinta. Así se puede estudiar si el fallo sigue una rama de distribución o es común.",
        "review": "Se miden recepción, cabecera y salidas de la red. La reparación se centra en el elemento compartido que presente el problema, según el resultado.",
    },
    {
        "slug": "la1-noche-luces",
        "channel": "La 1",
        "time": "Por la noche",
        "title": "¿La 1 se corta al encender las luces por la noche en {name}?",
        "observe": "Si notas cortes coincidiendo con una luz o un equipo doméstico, anota cuál y si la coincidencia se repite; no demuestra por sí sola el origen.",
        "compare": "Indica si ocurre en una sola televisión o en toda la vivienda y si son cortes breves o una pérdida mantenida.",
        "review": "Se estudian conexiones, apantallamiento y posibles perturbaciones. Se corrige el punto identificado tras medir, sin manipular mecanismos eléctricos para preparar la consulta.",
    },
    {
        "slug": "antena3-noche-lista",
        "channel": "Antena 3",
        "time": "Por la noche",
        "title": "¿Antena 3 desaparece por la noche de la lista en {name}?",
        "observe": "Si el nombre desaparece de la lista, distingue ese cambio de un canal que sigue guardado pero muestra una pantalla negra o un aviso de señal.",
        "compare": "Anota si hay actualizaciones automáticas, versiones duplicadas o una búsqueda reciente. Comprueba qué ocurre en otro receptor conectado a la misma instalación.",
        "review": "Se verifica primero la señal y después la lista y configuración. Ordenar programas puede resolver duplicados; no recupera una señal que llega degradada.",
    },
    {
        "slug": "telecinco-mediodia-calidad",
        "channel": "Telecinco",
        "time": "Al mediodía",
        "title": "¿Telecinco se pixela al mediodía aunque marque buena señal en {name}?",
        "observe": "Una barra alta de intensidad junto a cuadros o saltos de sonido no garantiza que el televisor pueda decodificar bien la señal recibida.",
        "compare": "Anota si la barra de calidad también cambia y si ocurre durante una franja concreta. Compara el mismo canal en otro televisor.",
        "review": "El técnico comprueba calidad y errores, además de potencia. Se estudian ruido, sobrecarga o recepción inestable antes de añadir ganancia o elegir un filtro.",
    },
)


REGIONAL_CASES = (
    {
        "slug": "regional-tarde",
        "time": "Por la tarde",
        "title": "¿{channel} falla por la tarde en {name}?",
        "observe": "Si ya recibías {channel} y empieza a cortarse por la tarde, apunta desde cuándo sucede y si vuelve sin tocar el televisor.",
        "compare": "Contrasta otra toma y un canal nacional. Si otros vecinos reciben bien la misma emisión, conviene localizar qué parte de tu recorrido difiere.",
        "review": "Se comprueban recepción y distribución del canal afectado. El ajuste o sustitución se decide al encontrar dónde disminuye la calidad.",
    },
    {
        "slug": "regional-noche",
        "time": "Por la noche",
        "title": "¿{channel} se pixela por la noche en {name}?",
        "observe": "Si una emisión que veías por antena se interrumpe por la noche, anota hora y duración antes de realizar otra búsqueda de canales.",
        "compare": "Indica si falla solo {channel} o también otras cadenas, y si afecta a varios receptores. Esa comparación ayuda a preparar una medición durante el corte.",
        "review": "Se revisa la señal efectiva y su paso por la cabecera. La franja horaria no confirma por sí sola un problema de 4G o 5G.",
    },
    {
        "slug": "regional-nacionales-bien",
        "time": "Pérdida parcial",
        "title": "¿Falta {channel} y se ven las nacionales en {name}?",
        "observe": "Que funcionen las cadenas nacionales no demuestra que llegue correctamente la emisión regional. Indica si {channel} se recibía antes o nunca llegó a sintonizarse.",
        "compare": "Compara un vecino que utilice la misma antena y confirma el programa exacto. La cobertura y la configuración regional deben verificarse para la dirección.",
        "review": "Se contrasta la señal disponible con los filtros de la instalación. Se valora adaptar la cabecera únicamente si existe una emisión utilizable.",
    },
    {
        "slug": "regional-tras-busqueda",
        "time": "Tras resintonizar",
        "title": "¿No encuentras {channel} después de resintonizar en {name}?",
        "observe": "Si el canal estaba guardado y desaparece tras una búsqueda, anota cuándo ocurrió y si durante ese proceso ya había cortes de imagen.",
        "compare": "Comprueba si {channel} aparece con otro nombre o en otra posición y si otro televisor lo recibe por la misma instalación.",
        "review": "Se verifica recepción antes de repetir el escaneo. Con señal correcta se revisa la lista; sin ella hay que localizar la pérdida o confirmar cobertura.",
    },
    {
        "slug": "regional-duplicados",
        "time": "Versiones duplicadas",
        "title": "¿Una versión de {channel} funciona y otra falla en {name}?",
        "observe": "Si la búsqueda guarda varias entradas parecidas, indica cuál mantiene la imagen y cuál presenta cortes. El orden del mando no determina la mejor recepción.",
        "compare": "Consulta los datos de señal de cada versión, si el televisor los muestra, y anota si cambian tras una actualización automática.",
        "review": "Se identifica la emisión estable antes de ordenar favoritos o eliminar duplicados. Si ninguna ofrece calidad suficiente, se revisa la recepción y la distribución.",
    },
    {
        "slug": "regional-portal",
        "time": "Antena colectiva",
        "title": "¿{channel} falta en todo el portal de {name}?",
        "observe": "Si varios pisos han perdido una emisión regional que recibían, pregunta si empezó al mismo tiempo o después de una actuación en la antena colectiva.",
        "compare": "Anota los canales afectados, las plantas y si otra comunidad cercana conserva la misma emisión. Los resultados sirven para acotar la revisión.",
        "review": "Se compara lo recibido en antena con la salida de cabecera. Si el origen está en un módulo o ajuste compartido, se interviene sobre ese punto.",
    },
)


INSTALLATION_CASES = (
    {
        "slug": "segunda-toma",
        "time": "Otra habitación",
        "title": "¿La TDT se ve en el salón y no en otra habitación de {name}?",
        "observe": "Si una toma funciona y otra pierde canales, apunta qué habitaciones fallan y si el problema empezó al cambiar el televisor o el cable corto de conexión.",
        "compare": "Prueba un latiguillo conocido en buen estado, si es accesible, y el mismo canal en ambas tomas. Evita desmontar mecanismos.",
        "review": "Se mide la pérdida entre derivaciones, cables y tomas. Se repara el tramo afectado cuando la señal de origen llega correctamente.",
    },
    {
        "slug": "tras-segundo-televisor",
        "time": "Al añadir una TV",
        "title": "¿Pierdes canales al conectar una segunda televisión en {name}?",
        "observe": "Si antes funcionaba y los cortes empezaron al repartir la señal, indica si utilizaste un repartidor, un adaptador en T o una nueva toma.",
        "compare": "Anota si fallan las dos pantallas o solo la más alejada. El reparto añade pérdidas que deben valorarse con la señal disponible.",
        "review": "Se comprueban niveles, conexiones y distribución. Puede ser necesario corregir el reparto; instalar un amplificador sin medir no garantiza recuperar la calidad.",
    },
    {
        "slug": "lluvia",
        "time": "Con lluvia",
        "title": "¿La televisión pierde canales cuando llueve en {name}?",
        "observe": "Si los cortes coinciden con lluvia y tardan en desaparecer, anota cuándo empiezan y si continúan después de que deje de llover.",
        "compare": "Comprueba si sucede en todas las tomas y si otros vecinos comparten el fallo. La coincidencia orienta la revisión, pero no identifica una pieza.",
        "review": "Se inspeccionan conexiones exteriores, protección y coaxial desde un acceso seguro. Si se detecta entrada de agua o deterioro, se corrige y se comprueba la señal.",
    },
    {
        "slug": "viento",
        "time": "Después de viento",
        "title": "¿La TDT empezó a fallar después del viento en {name}?",
        "observe": "Si la pérdida apareció después de rachas, indica si es continua o si la imagen cambia mientras vuelve a soplar. No accedas a la cubierta.",
        "compare": "Comprueba desde el interior qué televisores y canales están afectados; conserva una referencia de cuándo funcionaban correctamente.",
        "review": "Se valora el estado del soporte, las fijaciones y el cable antes de orientar. Se repara lo necesario y se verifica estabilidad con el conjunto asegurado.",
    },
    {
        "slug": "hd-sin-imagen",
        "time": "Imagen y sonido",
        "title": "¿Un canal tiene sonido pero no imagen en {name}?",
        "observe": "Si escuchas el programa y aparece pantalla negra o formato no admitido, indica el canal exacto y el modelo del televisor o receptor.",
        "compare": "Comprueba si otros servicios HD se ven y si otro equipo reproduce esa misma emisión. El tamaño o resolución de la pantalla no basta para asegurar compatibilidad.",
        "review": "Se distingue un problema de señal de uno de decodificación. Se revisan formato y equipo antes de proponer una antena o un receptor diferente.",
    },
    {
        "slug": "amplificador",
        "time": "Después de amplificar",
        "title": "¿La TDT empeora tras poner un amplificador en {name}?",
        "observe": "Si subió la barra de intensidad pero aumentaron los cortes, indica qué equipo añadiste y si está conectado antes de un repartidor o junto al televisor.",
        "compare": "Anota qué canales cambiaron y si el problema afecta a todas las salidas. Mucha potencia no equivale a una señal limpia.",
        "review": "Se comprueban entrada, ganancia y salida para detectar sobrecarga o pérdidas anteriores. El ajuste se decide con medidas, sin acumular amplificadores.",
    },
    {
        "slug": "sin-corriente",
        "time": "Tras un apagón",
        "title": "¿Faltan todos los canales después de un apagón en {name}?",
        "observe": "Si la televisión enciende pero no recibe ninguna cadena tras volver la luz, indica si ocurre en toda la vivienda o en varios pisos.",
        "compare": "Comprueba únicamente desde los mandos la entrada seleccionada y anota si el receptor externo también ha arrancado. No abras la fuente ni la cabecera.",
        "review": "Se verifica alimentación de antena activa, amplificador y distribución. Cuando se identifica el elemento sin servicio, se valora su restablecimiento o reparación.",
    },
    {
        "slug": "televisor-nuevo",
        "time": "Televisor nuevo",
        "title": "¿La televisión nueva no encuentra los canales en {name}?",
        "observe": "Si el equipo anterior recibía la TDT y el nuevo no encuentra programas, facilita modelo, entrada utilizada y tipo de búsqueda seleccionada.",
        "compare": "Contrasta la misma toma y cable con el receptor anterior, si lo conservas. Distingue la búsqueda terrestre de cable o satélite.",
        "review": "Se revisan configuración y compatibilidad antes de intervenir en la antena. Si también falla la comparación, se mide la señal disponible en la toma.",
    },
    {
        "slug": "cortes-breves",
        "time": "Cortes de segundos",
        "title": "¿La imagen se congela unos segundos y vuelve en {name}?",
        "observe": "Si los cortes son breves, anota su frecuencia y si coinciden con pérdida de sonido. Una foto del mensaje puede ayudar a identificar el síntoma.",
        "compare": "Comprueba si sucede en el mismo canal de otro televisor y si el receptor llega a reiniciarse o solo falla la imagen.",
        "review": "Se comparan errores de recepción y funcionamiento del equipo durante el episodio. La reparación depende de localizar si falla señal, alimentación o receptor.",
    },
    {
        "slug": "varias-antenas",
        "time": "Dos antenas",
        "title": "¿La TDT empezó a cortarse al mezclar dos antenas en {name}?",
        "observe": "Si los canales se pierden después de unir dos captaciones, indica qué querías recibir y si antes cada antena funcionaba de forma independiente.",
        "compare": "Anota cuáles han empeorado y si existen filtros o una central programable. Combinar señales no asegura sumar canales con estabilidad.",
        "review": "Se identifica qué aporta cada antena y si hay señales que se interfieren. La mezcla y el filtrado se plantean después de medir las entradas.",
    },
    {
        "slug": "cable-movido",
        "time": "Tras mover la TV",
        "title": "¿Faltan canales desde que moviste la televisión en {name}?",
        "observe": "Si el problema comenzó al mover el mueble o cambiar de posición la pantalla, indica si el cable quedó estirado o se añadió una prolongación.",
        "compare": "Comprueba un latiguillo en buen estado y si otra toma mantiene los canales. No fuerces el conector ni desmontes la base de pared.",
        "review": "Se revisan contacto, apantallamiento y pérdidas del recorrido. Si la avería está en la conexión interior, se corrige y se vuelve a medir.",
    },
    {
        "slug": "vecino-bien",
        "time": "Solo una vivienda",
        "title": "¿Tu vecino ve la TDT y tu vivienda no en {name}?",
        "observe": "Si otra vivienda recibe los canales que te faltan, confirma que comparte la antena y anota si en tu casa falla una toma o todas.",
        "compare": "Indica la planta y si hubo obras o cambios de conexiones. La comparación sirve para estudiar la derivación y la distribución particular.",
        "review": "Se mide antes y después del punto que alimenta la vivienda. Se repara la conexión o tramo identificado, sin asumir que hace falta cambiar la antena común.",
    },
)


# These are editorial channel examples, not a declaration of reception at a
# municipality. Local broadcasts require checking the exact installation.
REGIONAL_CHANNELS = {
    "madrid": ("Telemadrid", "laOtra"),
    "bizkaia": ("ETB1", "ETB2"),
    "alava": ("ETB1", "ETB2"),
    "gipuzkoa": ("ETB1", "ETB2"),
    "burgos": ("La 7 de CyLTV", "La 8 Burgos"),
    "la-rioja": ("TVR",),
}


def _choose(key, family, values):
    """Stable ranking isolates each family from the other editorial pools."""
    return min(
        values,
        key=lambda item: sha256(
            ("norte-channel-faults-v1:" + str(key) + ":" + family + ":"
             + (item["slug"] if isinstance(item, dict) else item)).encode("utf-8")
        ).digest(),
    )


def selection(key, province_slug):
    """Expose the selected cases for build checks without parsing HTML."""
    national = dict(_choose(key, "national", NATIONAL_CASES))
    national["family"] = "national"

    channels = REGIONAL_CHANNELS.get(province_slug)
    if channels:
        regional = dict(_choose(key, "regional-pattern", REGIONAL_CASES))
        regional["channel"] = _choose(key, "regional-channel", channels)
        regional["family"] = "regional"
        if regional["channel"] in ("La 8 Burgos", "TVR"):
            regional["observe"] = (
                "Primero se confirma que {channel} tiene emisión y cobertura "
                "para tu dirección. Si antes la recibías, indica cuándo empezó "
                "el fallo y en qué tomas ocurre."
            )
    else:
        # Cantabria has no invented regional TV assignment. A second national
        # enquiry uses a different channel and a different diagnostic pattern.
        regional = dict(_choose(key, "national-comparison", REGIONAL_CASES))
        regional["channel"] = _choose(
            key, "comparison-channel",
            tuple(c for c in ("Antena 3", "Telecinco", "La 1", "laSexta")
                  if c != national["channel"]),
        )
        regional["family"] = "national-comparison"
        # Remove assumptions about regional broadcasting from generic patterns.
        for field in ("title", "observe", "compare", "review"):
            regional[field] = regional[field].replace("regional", "de TDT")
        if regional["slug"] == "regional-nacionales-bien":
            regional["title"] = "¿Falta {channel} y se ven otras cadenas en {name}?"
            regional["observe"] = (
                "Que funcionen otras cadenas no demuestra que llegue "
                "correctamente la señal de {channel}. Indica si se recibía "
                "antes o nunca llegó a sintonizarse."
            )
            regional["compare"] = (
                "Compara un vecino que utilice la misma antena y confirma el "
                "programa exacto. La recepción y la configuración deben "
                "comprobarse para la instalación."
            )

    installation = dict(_choose(key, "installation", INSTALLATION_CASES))
    installation["title"] = installation["title"].replace(" en {name}", "").replace(" de {name}", "")
    installation["channel"] = ""
    installation["family"] = "installation"
    return national, regional, installation


def _card(case, name):
    fields = {"name": name, "channel": case["channel"]}

    def content(field):
        return escape(case[field].format(**fields))

    return (
        '<article class="channel-fault-card" data-channel-fault="'
        + escape(case["slug"], quote=True)
        + '" data-fault-family="' + escape(case["family"], quote=True) + '">'
        '<span class="channel-fault-tag">' + content("time") + '</span>'
        '<h3>' + content("title") + '</h3>'
        '<p>' + content("observe") + '</p>'
        '<p><strong>Qué comparar.</strong> ' + content("compare") + '</p>'
        '<p><strong>Qué revisamos.</strong> ' + content("review") + '</p>'
        '</article>'
    )


def local(key, name, province_slug):
    """Render three visible cards and one local contact action.

    ``key`` should be the municipality INE code or a stable district key;
    ``name`` is the plain, unescaped display name and ``province_slug`` the
    existing province identifier. The primary action carries no diagnosis or
    channel choice, because the reader has not yet selected a specific case.
    """
    cases = selection(key, province_slug)
    display_name = escape(str(name))
    cards = "".join(_card(case, str(name)) for case in cases)
    return (
        '<section class="section channel-faults" id="averias-canales" '
        'aria-labelledby="averias-canales-title"><div class="wrap">'
        '<span class="eyebrow">CANALES · HORARIOS · RECEPCIÓN</span>'
        '<h2 id="averias-canales-title">¿La televisión falla a ratos en '
        + display_name + '?</h2>'
        '<p class="channel-fault-intro">El canal, el horario y las tomas '
        'afectadas ayudan a preparar la revisión. Busca el síntoma que se '
        'parece al tuyo.</p>'
        '<div class="channel-fault-grid">' + cards + '</div>'
        '<div class="channel-fault-footer">'
        '<p>Si el corte se repite, consulta la <a href="/guias/tdt-falla-por-la-tarde-noche/">'
        'guía de TDT por la tarde o la noche</a>. '
        '<a href="/guias/castilla-la-mancha-satelite/">'
        'Instalación para ver Castilla-La Mancha por Hispasat</a>.</p>'
        '<a class="btn btn-primary" href="#contacto" '
        'data-service-choice="Antenas TDT" data-tv-incident="true">Preparar revisión en '
        + display_name + ' →</a></div></div></section>'
    )
