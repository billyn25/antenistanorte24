# Antenas Norte 24

Sitio estático para **antenasnorte24.com**, orientado a instalaciones y reparaciones en viviendas y comunidades.

- Norte (Bizkaia, Álava, Gipuzkoa, Burgos, Cantabria y La Rioja): **670 042 626**.
- Madrid: **614 78 99 45**.

## Publicación en Netlify

Conectar este repositorio, rama **main**. `netlify.toml` configura automáticamente:

- Comando: `npm run build:production && npm test`.
- Carpeta publicada: `dist`.
- Sin dependencias npm; el generador utiliza Python 3 estándar.

Añadir `antenasnorte24.com` como dominio principal y `www.antenasnorte24.com` como alias; activar HTTPS y comprobar DNS. El nombre del repositorio contiene «antenista», pero el dominio acordado es **antenasnorte24.com**.

Los previews de rama y de pull request reciben `noindex` y robots bloqueado. La producción utiliza canonical HTTPS del dominio definitivo y robots abierto. No hay redirección general a index.html: las páginas inexistentes devuelven el 404 del alojamiento.

## Contenido y cobertura

La compilación actual genera 1239 páginas indexables, con 1156 municipios, 21 distritos de Madrid y ocho provincias, además de los directorios, servicios, marcas y guías. El total se registra en `build-report.json`. Aviso legal, privacidad y cookies son accesibles, con noindex.

| Provincia | Municipios |
| --- | ---: |
| Bizkaia | 113 |
| Álava | 51 |
| Gipuzkoa | 88 |
| Burgos | 371 |
| Cantabria | 102 |
| La Rioja | 174 |
| Madrid | 179 |

Los municipios proceden de CodeForSpain, relación INE 2026 (ver `data/FUENTE-municipios.md`). Snapshot: `1e9c99280ef4d7a12def33cafc3df59d9fc1f688`. Se conservan códigos INE y nombres bilingües. Las páginas comparten información general de servicios y añaden localidad, provincia, formulario preseleccionado y contacto. No se inventan trabajos, oficinas, referencias locales de cobertura ni testimonios. El contenido municipal debe enriquecerse progresivamente con casos reales y datos confirmados por el negocio; el número de páginas no garantiza indexación ni posicionamiento.

## Funciones

- HTML completo de cada página, sin depender de JavaScript para indexar.
- Menú móvil, navegación por servicios y abecedario provincial.
- Buscador de localidades con alternativa por directorios HTML.
- Formulario que prepara WhatsApp y selecciona el destinatario por provincia. No almacena solicitudes ni las envía automáticamente.
- Acceso inferior de llamada y WhatsApp; selección Norte / Madrid.
- Mapa SVG geográfico local: puntos de referencia provinciales, no oficinas.
- Fotografías de catálogo optimizadas, imagen de ambientación generada con IA y metadatos sociales.
- Consultas de ejemplo con avatares neutros, sin valoraciones ni reseñas inventadas.
- Sin Google Analytics, píxeles o mapas externos; no se cargan rastreadores ni cookies de analítica.

## Editar y comprobar

```sh
npm run build
npm test
```

Editar servicios en `data/services.json`, provincias en `data/provinces.json`, municipios en `data/municipios.json`, estructura y texto en `scripts/build.py`. Estilos e interacciones en `assets/`.

El rastreo comprueba enlaces y anclas, imágenes, títulos únicos, canonicals, formularios etiquetados, contactos Madrid, JSON-LD válido, URLs de sitemaps y accesibilidad de todos los municipios a dos clics desde portada. No sustituye una revisión visual en navegador real.

## Sitemaps y Search Console

Enviar únicamente `https://antenasnorte24.com/sitemap.xml` una vez que el dominio responda correctamente. El índice contiene principal y siete sitemaps provinciales. No enviar previews. Verificar HTTPS, canonical, 404 y el sitemap en producción antes de solicitar rastreo.

## Antes de abrir al público

Titular indicado por el cliente: **D.C.G.**, bajo la denominación comercial Antenas Norte 24. Se utiliza esta identificación en aviso legal, privacidad, cookies y pie de página. El cliente indica que no aportará más datos. No se añaden textos de datos pendientes ni promesas de facilitar información posteriormente. La inclusión de estas iniciales no supone una certificación de cumplimiento legal.

SAT-TDT se presenta como consulta sujeta a cobertura, equipos específicos y procedimiento autorizado, sin atribuir homologaciones no acreditadas.

Fotos de catálogo y referencias: `assets/sources.json`. No son fotografías de trabajos del negocio. Sustituir o ampliar con instalaciones propias cuando estén disponibles.


## Auditoría de lanzamiento

Ver [AUDITORIA.md](AUDITORIA.md) y `audit/content-audit.json`. La base técnica pasa los controles; la similitud del contenido municipal y las pruebas de experiencia real requieren trabajo editorial adicional.


## Distritos de Madrid capital

Los 21 distritos tienen URLs `/madrid/distritos/<distrito>/`, contacto **614 78 99 45**, imágenes Televes y Fermax, formulario y servicios. Están en el sitemap de Madrid, el buscador, la página de la provincia y Madrid capital. Se mantienen separados de los 179 municipios de la Comunidad. Fuente: directorio oficial del Ayuntamiento, registrado en `data/madrid-distritos.json`.

### Datos locales con fuente

`data/contexto-local.json` contiene población del Censo anual INE 2025, superficie/capital y puntos IGN de los 1156 municipios. El build usa este archivo local; no consulta APIs en producción. `scripts/import-local-context.py` permite regenerar el conjunto (requiere `openpyxl` para leer el XLSX oficial IGN). Verificar la fecha y las fuentes antes de publicar una actualización. Los seis municipios próximos se calculan en línea recta entre puntos IGN, dentro de la cobertura publicada.


## Consultas por canal y horario · 22/10/2026

`scripts/channel_faults.py` selecciona tres consultas estables por municipio y distrito: canal nacional con horario, emisión de la zona y una situación de instalación. El bloque se muestra después de los servicios y antes de las frecuencias municipales. El acceso del hero permite llegar directamente a `#averias-canales`.

La selección adapta Telemadrid/laOtra a Madrid, ETB1/ETB2 a las provincias vascas, La 7 de CyLTV/La 8 Burgos a Burgos y TVR a La Rioja. Cantabria utiliza ejemplos nacionales. Las consultas describen síntomas posibles y comprobaciones; no son avisos de una avería confirmada ni testimonios. Las cadenas locales requieren comprobar emisión y cobertura en la dirección.

`data/guias-canales.json` contiene las guías compartidas de fallos por la tarde/noche y de instalación para ver Castilla-La Mancha Media por Hispasat. La segunda presenta el servicio propio confirmado por el titular: parabólica, receptor compatible, ajuste y sintonización. No fija parámetros de emisión ni equipos sin comprobar la instalación. Las fuentes técnicas y fecha de revisión figuran en cada guía.

El formulario ofrece datos opcionales de canal, franja y tomas afectadas. El botón del bloque abre esos campos y conserva municipio y contacto. La guía de Hispasat prepara el servicio de parabólicas y el texto de consulta correspondiente. El visitante revisa y envía el mensaje desde WhatsApp.

La auditoría `audit/channel-faults-2026-10-22.json` compara la misma muestra de 30 municipios y 435 pares antes y después. La similitud es un indicador editorial basado en secuencias de cinco palabras, no una medida de Google ni una previsión de posicionamiento. `npm test` comprueba también que las opciones de horario y alcance existan en el HTML generado y se incorporen al mensaje con el teléfono de la zona correcta.

## Consultas de ejemplo y orden de contenidos · 23/10/2026

Los 75 temas de `data/consultas-tecnicas.json` incluyen una pregunta breve en el campo `example`. Son situaciones redactadas para explicar el servicio, identificadas individualmente como **«Consulta de ejemplo»**. Los avatares son siluetas neutras: no representan clientes. No se publican nombres, valoraciones, cifras de viviendas atendidas ni trabajos locales sin documentación.

`scripts/diagnostics_content.py` presenta tres tarjetas por municipio y distrito, manteniendo la selección estable anterior, las explicaciones técnicas completas y sus enlaces. Los desplegables conservan los identificadores `consulta-local-*` y el acceso a la guía del servicio. «Consultar mi caso» selecciona el servicio en el formulario de esa página sin cambiar la localidad ni enviar mensajes. La portada presenta tres ejemplos de televisión, abrepuertas y Wi-Fi.

La estructura sigue estas prioridades:

- **Portada:** presentación, servicios, consultas y averías, especialidades, marcas, un único proceso de atención, zonas, preguntas, formulario y mapa.
- **Provincias:** presentación, buscador y municipios destacados, directorio completo, información TDT, formulario y mapa.
- **Municipios y distritos:** presentación y accesos rápidos, servicios, consultas de ejemplo, averías por canal, información técnica y guías, ubicación, preguntas, formulario, mapa y localidades o distritos relacionados al final.

Se conservan los catálogos de servicios con sus fotografías, los destinos existentes, las fuentes de información local y los contactos diferenciados de Norte y Madrid. La reorganización conserva las URLs anteriores. Las comprobaciones incluyen la identificación de los ejemplos, el orden esencial de las secciones y el funcionamiento de los enlaces internos.

## Montaje de ventiladores de techo

Servicio en `/servicios/montaje-ventiladores-techo/`, integrado en portada, catálogo, municipios, distritos, formularios y sitemap. Ofrece montaje de un ventilador aportado por el cliente o suministro del equipo con instalación; el modelo y las adaptaciones se concretan en el presupuesto. La ficha distingue ambas modalidades y adapta los datos previos y la ayuda del formulario.

La fotografía local `assets/ventilador-techo.webp` corresponde al Sulion ANNE M, referencia 2245294, y está identificada como imagen de catálogo. Procedencia y manual técnico en `assets/sources.json`. No acredita trabajos realizados ni una vinculación comercial con el fabricante. El servicio se añade al grupo «Internet, domótica y hogar» y queda fuera de la rotación principal para conservar el orden anterior de los servicios locales.

### Asturias (25/10/2026)

Incorpora los 78 concejos oficiales (código INE provincial 33) bajo `/asturias/`, con contacto Norte, 15 localidades destacadas visibles en portada y buscador de texto. Se incluyen formulario preseleccionado, servicios, mapa, datos INE/IGN, núcleos del Nomenclátor 2025 y municipios próximos. El sitemap provincial contiene el directorio y las 78 fichas.

La relación municipal usa el mismo snapshot CodeForSpain documentado, contrastado con los 78 códigos del anexo I del RD 250/2025. El área TDT ASTURIAS y sus canales proceden de los anexos I/II del BOE; las referencias autonómicas A7 (TPA)/A8 se contrastan con el [Principado](https://www.asturias.es/temas/infraestructuras-movilidad/telecomunicaciones-audiovisuales/tdt-difusion-adecuacion-4g-5g). Los datos se guardan en el repositorio; el build no descarga fuentes externas.

### Revisión de barrios y zonas residenciales (25/10/2026)

El Nomenclátor del INE no se utiliza como catálogo de barrios: se conserva el archivo de origen para trazabilidad, pero se retiran sus listas automáticas y sus sugerencias de formulario de las 1156 fichas municipales. Población, superficie, capital municipal y cercanías mantienen sus fuentes INE/IGN.

`data/zonas-capitales.json` contiene ahora una selección editorial revisada de barrios y zonas residenciales en 30 municipios, incluidos pueblos de Madrid y ciudades de todas las demás provincias. Cada municipio guarda fuentes y fecha. Los nombres aparecen siempre visibles, se incorporan al buscador y rellenan solo el detalle opcional de la dirección. La consulta conserva municipio, provincia y teléfono. En las demás fichas este campo admite texto libre, sin sugerir parajes o instalaciones como barrios. Los distritos de Madrid capital conservan sus páginas.
