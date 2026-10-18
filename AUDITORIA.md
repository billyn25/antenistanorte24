# Auditoría de Antenas Norte 24 — 18 de octubre de 2026

## Resultado

**La base técnica pasa las comprobaciones realizadas. El contenido de servicios es útil como punto de partida; el contenido municipal todavía necesita más diferenciación y pruebas de experiencia real para competir con fuerza. No se considera que el SEO esté terminado por tener muchas páginas.**

La web está disponible en el subdominio de Netlify. No se ha podido verificar el funcionamiento de `https://antenasnorte24.com/`: las peticiones desde este entorno devuelven 502 y la consulta mediante el servicio web tampoco permite acceder. Esto no demuestra por sí solo un error de DNS del dominio, pues la resolución directa está limitada también para el subdominio funcional de Netlify. Debe comprobarse la configuración del dominio y HTTPS desde Netlify.

## Cobertura incorporada

| Provincia | Municipios | Teléfono |
| --- | ---: | --- |
| Bizkaia | 113 | 670 042 626 |
| Álava | 51 | 670 042 626 |
| Gipuzkoa | 88 | 670 042 626 |
| Burgos | 371 | 670 042 626 |
| Cantabria | 102 | 670 042 626 |
| La Rioja | 174 | 670 042 626 |
| Madrid | 179 | 614 78 99 45 |
| **Total** | **1078** | |

La Rioja figura en portada, directorio provincial, 174 páginas locales, mapa, formulario, buscador, enlaces de pie, área de servicio del marcado y sitemap provincial. El mapa permite abrir el directorio de cada provincia desde su etiqueta. Se amplió el encuadre para no cortar el sur de la silueta de España.

## Comprobaciones técnicas locales

| Comprobación | Resultado |
| --- | --- |
| HTML generado | 1115 documentos, incluidos legales y dos variantes del 404 |
| URLs indexables de producción | 1110 |
| URLs de sitemaps | 1110, coinciden con las indexables |
| Enlaces internos comprobados | 67465; sin destinos o anclas rotos |
| Títulos y descripciones duplicados | 0 / 0 |
| H1, idioma y canonical | Presentes y consistentes en las páginas comprobadas |
| Imágenes | Archivos existentes, textos alternativos y dimensiones declaradas |
| Marcado JSON-LD | Sintaxis válida; Organization, WebPage, WebSite, Service y BreadcrumbList según página |
| Reseñas y valoraciones inventadas | No se publican; las estrellas son decorativas |
| Navegación a municipios | Todos a un máximo de dos clics desde portada |
| Teléfonos de contacto | Norte y Madrid comprobados; La Rioja usa Norte |
| Formulario | Provincia/localidad preseleccionadas; prepara WhatsApp sin almacenar el formulario |
| Caché de CSS/JS | Nombres de archivo con huella del contenido, enlazados desde el HTML |
| Producción y previews | Producción indexable; previews con noindex y robots bloqueado |
| Cookies de analítica/publicidad | No se incluyen estas herramientas en la versión revisada |

La validación de JSON-LD no equivale a una certificación de elegibilidad de resultados enriquecidos de Google. No se inventa una dirección para obtener marcado LocalBusiness.

**Límite de verificación:** estas comprobaciones son de generación, rastreo de archivos e interacciones de contacto. No se ha realizado una auditoría visual completa en navegador real, ni mediciones de Core Web Vitals con usuarios, ni comprobación de indexación en Search Console. No se asigna una puntuación Lighthouse ficticia.

## Auditoría del contenido

Recuento del contenido principal, excluyendo contacto, mapa, navegación y SVG:

| Tipo de contenido | Palabras observadas |
| --- | ---: |
| Antenas TDT | 391 |
| Antenas parabólicas | 370 |
| Amplificación TDT/SAT | 423 |
| Porteros automáticos y cerraduras eléctricas | 449 |
| Videoporteros | 385 |
| Montaje Starlink | 386 |
| SAT-TDT | 429 |
| Municipios | 941–1101; mediana 990 |

Estos recuentos describen la web; **no son umbrales de calidad ni requisitos de Google**. Las páginas de servicios explican diagnóstico, alcance, síntomas, equipos, compatibilidad y preguntas frecuentes. Separan Starlink de SAT-TDT y porteros automáticos de videoporteros. También explican amplificación y abrepuertas.

### Debilidad principal: similitud municipal

Una muestra de nueve municipios y 36 pares, comparada mediante Jaccard de secuencias de cinco palabras, muestra una mediana del 82,95 %. Tras normalizar nombres de municipio/provincia, teléfono e INE, los pares de la misma provincia se sitúan entre 93,2 % y 95,1 %.

Es un indicador editorial propio, no una medición de Google ni una prueba de penalización. Los detalles reproducibles están en `audit/content-audit.json`; el cálculo se ejecuta con `python3 scripts/audit-content.py`.

**Interpretación:** una parte importante del texto es información compartida de servicios. La localidad, el teléfono, los enlaces y el formulario cambian, pero todavía no hay experiencia de campo documentada para cada municipio. Añadir más palabras genéricas o sustituir sinónimos no resolvería esa debilidad.

### Qué conviene reforzar

1. Casos reales, empezando por los municipios prioritarios: síntoma, diagnóstico, solución, equipos y fotografías propias. Sin inventar instalaciones ni clientes.
2. Información de atención confirmada: disponibilidad, alcance y condiciones de desplazamiento por área, cuando el negocio las concrete. Evitar prometer tiempos de llegada que no estén establecidos.
3. Material propio del negocio: imágenes de trabajos, presentación del servicio y acreditaciones solo si existen. Las fotos de catálogo actuales identifican equipos, pero no prueban experiencia del negocio.
4. Usar Search Console para decidir qué municipios y servicios merecen ampliaciones primero. No multiplicar automáticamente páginas marca × avería × pueblo.

El criterio editorial debe ser resolver la consulta del visitante y aportar hechos verificables. Documentación de referencia:

- [Contenido útil y fiable — Google Search Central](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Títulos de resultados — Google Search Central](https://developers.google.com/search/docs/appearance/title-link)
- [Campañas de páginas puerta — Google Search Central](https://developers.google.com/search/blog/2015/03/an-update-on-doorway-pages)

## Qué falta para el lanzamiento con el dominio final

1. **Comprobar dominio y HTTPS:** en Netlify, `antenasnorte24.com` debe ser el principal; configurar `www` como alias con redirección. Confirmar que ambos resuelven y el certificado funciona.
2. **Revisar el resultado publicado en móvil:** portada y foto, estrellas, menú, formulario y contacto fijo; confirmar ausencia de desbordamiento en diferentes anchos y en Safari.
3. **Verificación pública del dominio:** portada, una localidad Norte, una de Madrid, una de La Rioja, robots, sitemap y una URL inexistente que debe devolver 404.
4. **Search Console:** verificar el dominio y enviar `https://antenasnorte24.com/sitemap.xml` cuando funcione. Inspeccionar URLs de ejemplo y observar indexación; un sitemap enviado no garantiza indexación.

El titular indicado por el cliente, **D.C.G.**, está aplicado a aviso legal, privacidad, cookies y pie de página. No se han añadido textos de datos pendientes ni solicitado más datos. Esta revisión técnica y editorial no certifica cumplimiento jurídico.

Se puede lanzar una web y seguir mejorando su contenido. Esta auditoría distingue entre tener una base publicable y haber demostrado una ventaja de contenido suficiente para superar a competidores: lo segundo todavía no está acreditado.
