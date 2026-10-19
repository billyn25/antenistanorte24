# Auditoría de Antenas Norte 24 — 19 de octubre de 2026

## Dictamen

Las comprobaciones realizadas no encuentran un bloqueo técnico general de indexación ni errores de enlaces en el sitio generado. La muestra pública responde correctamente y coincide con la versión auditada. El principal punto débil es editorial: muchas fichas municipales siguen compartiendo gran parte del contenido y carecen de intervenciones propias documentadas. No se certifica posicionamiento ni ausencia futura de acciones de Google.

## Alcance y resultados

| Área | Evidencia | Resultado |
|---|---|---|
| Sitio generado | 1159 HTML, 1154 URLs indexables y 109371 enlaces internos | Cero errores en los controles automáticos |
| Publicación | 70 páginas de la versión `dc9bbed`, incluidas páginas centrales, siete provincias, dos municipios por provincia y dos distritos | Todas HTTP 200, sin incidencias de canonical/noindex/IDs/JSON-LD y coincidentes con el HTML local |
| Recursos publicados | 17 recursos referenciados por esa muestra | Sin errores HTTP |
| Dominio | HTTP, www y subdominio Netlify | Redirección 301 directa al dominio HTTPS principal |
| URLs alternativas | Portada y municipio terminados en index.html | Redirección 301 al equivalente correcto |
| Ruta inexistente | URL creada para probar el estado HTTP | 404 real; no responde como página válida |
| robots.txt y sitemaps | Rastreo permitido en producción; 1154 URLs sin duplicación en sitemaps | Correcto |
| Previsualizaciones | Generación separada como deploy-preview | Los 1159 HTML llevan noindex, robots bloquea rastreo y se añade X-Robots-Tag; se restaura producción después |
| Metadatos | Todas las URLs indexables | Cero títulos/descripciones duplicados; 29 títulos superan 65 caracteres, lo que no constituye por sí solo un error de indexación |
| Accesibilidad del rastreo | Enlaces HTML y recorrido desde portada | Sin páginas huérfanas; municipios a dos clics como máximo |
| Formularios | Pruebas automáticas e interacción pública en Zalla | Elección LED conserva Zalla/Bizkaia; contacto rápido cambia entre Norte y Madrid sin enviar mensajes |
| Imágenes y favicon | Existencia, alternativa textual y dimensiones; imagen LED observada en publicación | Correcto en los controles realizados |
| Navegador de escritorio | Portada y Zalla a 1363 px; sección LED y filtros | Sin desbordamiento horizontal en los estados observados; filtro de Internet/domótica/luz y elección LED funcionan |
| Contenido técnico | TDT, alimentación, reparto, humedad, interferencias, accesos, Wi-Fi, Shelly y LED | Explicaciones centrales y referencias identificadas; no se inventan trabajos locales |

No se ha hecho un rastreo HTTP de las 1154 URLs públicas en esta sesión: el rastreo completo es del sitio generado y el público utiliza una muestra de 70. La prueba visual de escritorio no sustituye a una prueba real en móvil. No se han medido Core Web Vitals de usuarios, PageSpeed Insights ni datos de Search Console. Los errores de consola observados pertenecían a una extensión del navegador de auditoría, no a scripts del sitio.

## Similitud: datos completos y límites

- La muestra histórica de nueve municipios y 36 pares mantiene la misma extracción, normalización y Jaccard de secuencias de cinco palabras: mediana **61,20 %**.
- Una muestra independiente ampliada de 30 municipios, siete provincias y 435 pares tiene mediana **59,60 %**, mínimo **44,50 %** y máximo **85,40 %**. Hay **14 pares de 435** con al menos el 80 %.
- La muestra ampliada añade a los nueve municipios originales el primero, central y último por URL de cada provincia. No sustituye al histórico para afirmar una bajada.
- Ejemplos del grupo más parecido: Abaltzisketa/Hernialde (85,4 %), Nava de Roa/Zuñeda (85,0 %), Haro/Torrelaguna (84,0 %).
- No es una medición de similitud de Google, no cubre todos los pares de municipios y no permite calcular probabilidad de penalización.
- Ordenar o destacar servicios diferentes no convierte la página en una intervención local auténtica. Los datos de población y núcleos ayudan a identificar la dirección, pero no demuestran experiencia ni condiciones de recepción.

## Correcciones aplicadas durante esta revisión

1. Numeración de tarjetas: 10 y 11, en lugar de 010 y 011.
2. Eliminación de la flecha literal duplicada cuando el estilo ya añade una flecha al enlace.
3. El buscador muestra «resultados», evitando llamar «localidades» a una mezcla de municipios, distritos y zonas.
4. Ajuste de la imagen LED: el bloque publicado ocupaba 1140 × 855 px en escritorio. Se prepara una introducción en dos columnas y se limita la figura a 480 px de ancho para no desplazar toda la explicación.
5. Tres ejemplos diagnósticos en guías existentes, expresamente rotulados «EJEMPLO ORIENTATIVO · NO ES UN TRABAJO REALIZADO»: habitación sin TDT tras reforma, alimentación/humedad de amplificador y portero que no abre. No se asignan a pueblos ni se presentan como trabajos de la empresa.
6. Auditoría pública con fecha dinámica y modo de muestra reproducible; comparación editorial ampliada separada del histórico.

Las correcciones de esta lista se verifican con la generación final y las pruebas automáticas. La evidencia pública de 70 páginas corresponde a `dc9bbed`, anterior a estas correcciones menores. Su publicación se verifica por separado; un commit no equivale automáticamente a un despliegue público.

## Prioridades pendientes

1. **Experiencia local verificable.** Incluir intervenciones realmente realizadas: municipio, síntoma, comprobación, solución y resultado. Anonimizar personas y domicilios. Una fotografía propia es útil si existe; no es requisito para contar un caso verdadero.
2. **Revisar las fichas más parecidas.** Mantener los servicios disponibles, retirar explicaciones redundantes y añadir únicamente información local que ayude a preparar o contratar la intervención. No sustituir sinónimos ni inventar sedes, averías frecuentes o trabajos para bajar el indicador.
3. **Medir visibilidad real.** Search Console: consultas, URLs con impresiones, evolución, indexación y acciones manuales/seguridad. Sin esos datos no se puede atribuir una caída a una causa concreta ni demostrar mejora de posicionamiento.
4. **Móvil y rendimiento real.** Comprobar visualmente tamaños pequeños y dispositivos reales, además de medir rendimiento. El CSS adaptable y las pruebas de interacción no equivalen a una medición de experiencia móvil.
5. **Evitar crecimiento sin valor.** Se mantienen las 1154 URLs indexables. El LED y los ejemplos amplían páginas existentes; no se han creado nuevos pueblos ni nuevas guías en esta revisión.

## Evidencias reproducibles

- `npm run build:production` y `npm test`.
- `python3 scripts/audit-content.py`: histórico y muestra ampliada en `audit/content-audit.json`.
- `python3 scripts/audit-live.py --sample`: resumen en `audit/live-summary.json`; el detalle de páginas se genera localmente.
- Redirecciones, robots y 404: `audit/routing-audit.json`.
- Referencias editoriales: políticas de spam de Google (`https://developers.google.com/search/docs/essentials/spam-policies?hl=es`) y documentación sobre caídas de tráfico (`https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops?hl=es`).
