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

1110 páginas indexables: 1078 municipios, siete provincias, siete servicios, siete marcas, seis guías y páginas principales. Aviso legal, privacidad y cookies son accesibles, con noindex.

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
- Estrellas decorativas; sin valoraciones ni reseñas inventadas.
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
