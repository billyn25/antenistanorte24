# Antenas Norte 24 — revisión del informe Ahrefs del 4 noviembre 2026

Se revisan los 23 CSV del ZIP y su relación con el sitio generado. La revisión cubre los avisos exportados y controles completos de enlaces, schema, metadatos, indexabilidad, canonicals y sitemap; no demuestra la causa de una caída de posiciones ni acredita una penalización.

El sitio generado tiene 340 destinos indexables tras la consolidación: 252 páginas municipales, 904 municipios agrupados y 1156 municipios cubiertos en ocho provincias. No se modifica la selección de pueblos, la cobertura, las URLs, las fotos, los formularios ni los teléfonos en esta revisión.

| Archivo | Filas | Interpretación y tratamiento |
|---|---:|---|
| Clasificación de marca como catálogo de producto | 3 | Las tres fichas de marca describen asistencia/equipos; no son catálogos de productos vendidos. Se conserva WebPage con about:Brand. ItemList se añade donde hay una colección real: el índice de guías. |
| Clasificación de marca como producto | 3 | No corresponde Product a una página genérica de servicios por marca. No se añaden ofertas, precios ni reseñas ficticias. |
| Datos de organización | 1 | Organization tiene identidad, URL, logo y contactos. Se completa descripción y área atendida y se enlaza WebSite.publisher. No se añaden dirección, perfiles sociales ni identificadores no facilitados. El aviso depende de los campos que Ahrefs espere. |
| Artículos y colección | 20 | 19 guías con Article coherente con H1 y descripción; /guias/ con CollectionPage e ItemList. No se inventan autores personales ni fechas. |
| Descripciones largas | 99 | Ajustadas en las 340 páginas indexables: ninguna supera 160 caracteres. Es un criterio editorial para evitar resúmenes extensos, no un límite obligatorio de Google. |
| Descripciones cortas | 3 | Completadas las indexables con resúmenes específicos. Las tres páginas legales noindex conservan sus descripciones breves. |
| Descripciones cortas | 10 | Completadas las indexables con resúmenes específicos. Las tres páginas legales noindex conservan sus descripciones breves. |
| Notificaciones IndexNow | 282 | 282 cambios no notificados por ese protocolo. No es noindex ni un bloqueo de Google. IndexNow es opcional para buscadores participantes; Google no figura en su registro. No se activa un servicio ni se envían URLs en esta revisión. |
| Cambios en descripción | 252 | Cambio esperado de 252 páginas municipales tras consolidación. No es un error técnico. |
| Títulos largos | 45 | Ajustados títulos municipales, distritos, servicios y guías: ninguno de los 340 indexables supera 70 caracteres. Se conserva el nombre completo del municipio. |
| Estimación de contenido IA | 11 | 11 páginas señaladas por Ahrefs, no por Google. Revisados sus temas y estructura: servicios y guías técnicas sobre síntomas, mediciones y preparación del aviso. El CSV no acredita una penalización ni sustituye una revisión de veracidad. No se reescribe para perseguir la puntuación de un detector. |
| Cambios de título | 252 | 252 cambios esperados por el ajuste municipal. No es un error. |
| Noindex con enlaces permitidos | 3 | Son aviso legal, privacidad y cookies. No afectan a servicios ni a páginas municipales. No son seis bloqueos distintos: el aviso se repite en dos CSV. |
| Noindex de páginas legales | 3 | Las mismas tres páginas legales, exclusión deliberada. Los 340 destinos comerciales siguen indexables en producción. |
| Poco enlazado interno | 18 | Añadidos enlaces de servicios a sus marcas, lecturas relacionadas para dos guías y referencias de cobertura desde otro municipio de su provincia. Todas las indexables salvo inicio tienen al menos dos páginas internas de origen. |
| Cambio en cantidad de texto | 241 | 241 páginas modificadas por la cobertura cercana. Es una comparación entre rastreos, no un error. |
| Detalle de enlaces entrantes | 18 | Es el desglose de las mismas 18 páginas, no 18 incidencias adicionales. |
| Una respuesta lenta | 1 | El CSV registra 1645 ms hasta primera respuesta para /servicios/antenas-parabolicas/. Tres lecturas HTTPS de control en este entorno variaron: 5263/65/102 ms hasta cabeceras y 5394/109/103 ms totales. Incluyen conexión y la ruta del cliente; no son Core Web Vitals ni prueban un problema persistente del servidor. Mantener en seguimiento, sin darlo por resuelto ni cambiar caché a ciegas. |
| Menos URLs en ocho sitemaps | 8 | Reducción esperada por agrupación: 252 páginas municipales; 340 URLs indexables totales. El recuento se contrasta con los destinos y los nueve sitemaps hijos. |
| Redirecciones de dominio | 3 | HTTP/www redirigen al dominio HTTPS sin www. Normalización esperada; no son errores 404. |
| HTTPS | 2 | Redirecciones esperadas a HTTPS. No se retiran. |
| Un salto adicional HTTP + www | 1 | Se añade regla explícita directa al dominio canónico. La plataforma puede anteponer su propia actualización a HTTPS; debe comprobarse en producción. La cadena del informe afecta a la entrada HTTP+www, no a todas las páginas. |

## Resultado verificado en la compilación

- 340 URLs indexables, con canonical y sitemap coherentes; se mantienen los 904 destinos 301 y los 1156 municipios buscables.
- Ningún título supera 70 caracteres; las descripciones indexables quedan entre 110 y 160. Nombres completos, sin truncar municipios ni rellenar por alcanzar una cifra.
- Todas las páginas indexables salvo inicio reciben enlaces desde al menos dos páginas indexables distintas; no se cuentan enlaces a sí mismas.
- 19 Article, un CollectionPage con ItemList para el directorio de guías, Organization y WebSite conectados y fichas de marca descritas como Brand. No se añaden Product, ofertas, reseñas, sedes, autores o fechas inventadas.
- Pruebas originales de construcción y comportamiento, auditoría de cobertura y prueba del buscador/formulario en Chromium y WebKit a cuatro anchuras.

## Fuentes y límites

- IndexNow: https://www.indexnow.org/searchengines.json y https://help.ahrefs.com/en/articles/9317209-how-to-submit-pages-to-indexnow-within-site-audit
- Solicitudes a Google: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- IA y calidad: https://developers.google.com/search/blog/2023/02/google-search-and-ai-content
- Títulos y descripciones: https://developers.google.com/search/docs/appearance/title-link y https://developers.google.com/search/docs/appearance/snippet
- Article y Product: https://developers.google.com/search/docs/appearance/structured-data/article y https://developers.google.com/search/docs/appearance/structured-data/product-snippet

Los límites de caracteres son decisiones editoriales de este proyecto. Google no fija esos límites como requisitos de indexación. El campo de tráfico del CSV no sustituye las consultas, impresiones, clics e indexación de Search Console. La etiqueta de IA es una estimación del proveedor; este trabajo no promete eliminarla, ni garantiza posiciones. El rendimiento debe medirse repetidamente y con datos de usuarios cuando existan.
