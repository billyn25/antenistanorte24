# Auditoría de Antenas Norte 24 — 19 de octubre de 2026

## Dictamen

Las comprobaciones realizadas no encuentran un bloqueo técnico general de indexación ni errores de enlaces en el sitio generado. La muestra pública responde correctamente y coincide con la versión auditada. El principal punto débil es editorial: muchas fichas municipales siguen compartiendo gran parte del contenido y carecen de intervenciones propias documentadas. No se certifica posicionamiento ni ausencia futura de acciones de Google.

## Alcance y resultados

| Área | Evidencia | Resultado |
|---|---|---|
| Sitio generado | 1159 HTML, 1154 URLs indexables y 111455 enlaces internos | Cero errores en los controles automáticos |
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

- La muestra histórica de nueve municipios y 36 pares conserva extracción, normalización y Jaccard sobre secuencias de cinco palabras. Tras la biblioteca de consultas pasa de **61,20 % a 59,30 %** de mediana.
- La muestra ampliada mantiene los mismos 30 municipios y 435 pares: pasa de **59,60 % a 57,50 %**. Su nuevo mínimo es **44,30 %** y máximo **82,40 %**. Los pares con al menos el 80 % pasan de **14 a 1**. El 80 % es un punto de observación editorial, no un umbral de Google.
- El par de mayor coincidencia de esta muestra es ahora Igorre/Ziortza-Bolibar (82,4 %). La repetición no queda eliminada.
- La biblioteca contiene **37 consultas técnicas**. Cada ficha muestra dos seleccionadas mediante hash estable de su identificador y del tema; la selección no cambia al recargar ni depende del orden de la lista. En 1078 municipios aparecen **749 combinaciones ordenadas**; cada consulta aparece entre **35 y 72 veces** contando las dos posiciones.
- Esta distribución es editorial. No significa que esos fallos sean típicos, hayan sido medidos o se hayan reparado en el municipio. Los diagnósticos se expresan en condicional y los temas completos son accesibles desde los servicios existentes.
- La mediana de palabras municipales pasa de 927 a **951**, sin duplicar la biblioteca completa en cada ficha. La diferencia entre municipios continúa apoyándose también en sus datos oficiales, núcleos y municipios próximos.
- Ninguno de estos indicadores mide la probabilidad de penalización ni garantiza posiciones. No se cambia el método para aparentar una mejora, ni se presenta la muestra ampliada como comparable con la de nueve municipios.

## Correcciones aplicadas durante esta revisión

1. Numeración de tarjetas: 10 y 11, en lugar de 010 y 011.
2. Eliminación de la flecha literal duplicada cuando el estilo ya añade una flecha al enlace.
3. El buscador muestra «resultados», evitando llamar «localidades» a una mezcla de municipios, distritos y zonas.
4. Ajuste de la imagen LED: el bloque publicado ocupaba 1140 × 855 px en escritorio. Se prepara una introducción en dos columnas y se limita la figura a 480 px de ancho para no desplazar toda la explicación.
5. Tres apartados de comprobación en guías existentes: habitación sin TDT tras reforma, alimentación/humedad de amplificador y portero que no abre. Se redactan de forma condicional y se presentan como criterios de diagnóstico, sin asignarlos a pueblos ni convertirlos en trabajos de la empresa.
6. Auditoría pública con fecha dinámica y modo de muestra reproducible; comparación editorial ampliada separada del histórico.
7. Biblioteca de 37 consultas con dos temas fijos por ficha y explicaciones desplegables en páginas existentes. Incluye orientación, obstáculos, lluvia, LNB, Quad/Quattro, DiSEqC, SCR/dCSS, multiswitch, canales libres/codificados, radio, UHD, dos repetidores, señales españolas/francesas y otros servicios. Los enlaces abren la respuesta concreta.
8. Se amplía la página de parabólicas con Astra/Hispasat, TNTSAT/FRANSAT y distinción entre recepción y servicio contratado de Movistar. Las condiciones territoriales y de acceso no se sustituyen por la cobertura técnica del satélite.

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

## Ajuste de imágenes y lectura de tarjetas

- Los números de servicio ocupan una fila independiente encima de la imagen, con separación de 16 px (14 px en móvil). Las imágenes conservan su proporción.
- Los paneles de consulta separan imagen y título con margen y una línea de división.
- Las 11 tarjetas de servicios muestran resúmenes breves; las páginas de servicio conservan su explicación completa.
- La segunda consulta desplegable de cada ficha incluye comprobaciones y datos para preparar el aviso, además del enlace al servicio. No se atribuye el síntoma a esa localidad ni se presenta como trabajo realizado.
- Generación y pruebas: 1159 HTML, 1154 URLs indexables, 111455 enlaces internos, cero errores.
- Misma muestra ampliada de 30 municipios: mediana editorial de similitud de 57,5 % a 52,8 %. El máximo sube de 82,4 % a 83,2 % y sigue existiendo un par por encima del 80 %. No representa una probabilidad de penalización ni prueba una mejora de posición.
- Las comprobaciones automáticas no sustituyen una revisión visual en un móvil real.

## Ampliación a 44 consultas técnicas

Se añaden siete consultas: mástil desplazado o caído por viento, dipolo dañado o ausente, electrónica activa y alimentación, cable exterior de PE resistente a UV, conectores blindados, filtro LTE/5G selectivo y centrales programables con conversión. Se mantienen dos consultas por ficha, sin nuevas URLs ni atribuciones de incidencia local. Cada tema nuevo aparece en entre 44 y 61 fichas de municipio o distrito.

La conversión se describe para modelos que la admiten y entradas utilizables, sin prometer recuperar interferencias cocanal ya presentes antes de la central. Se enlazan documentos de Televes y Johansson en las respuestas centrales. El color del cable no se utiliza como garantía de resistencia UV ni el dipolo activo como solución universal.

Muestra editorial fija de 30 municipios: mediana de similitud de 52,8 % a 51,6 %; máximo de 83,2 % a 77,7 % y ningún par del muestreo por encima del 80 %. Estas cifras no son un umbral de Google, una probabilidad de penalización ni una medición de todos los pares de municipios.

## 20 de octubre: COFDM, HDMI y puestos de oficina

Se amplía la biblioteca a 49 consultas con cinco explicaciones prácticas: distribuir una fuente a varias televisiones mediante COFDM HD, mezcla de un modulador con TDT, HDMI según recorrido y formato, puestos de trabajo Efapel y canaleta técnica de oficina. Se reparten entre las fichas existentes, manteniendo dos consultas por ficha y sin nuevas URLs. Cada tema nuevo aparece en entre 37 y 59 fichas. Las referencias centrales enlazan documentación de Televes, HDMI Licensing Administrator y Efapel.

Se añaden tres opciones al formulario: distribución con modulador COFDM HD, conexión HDMI y puestos de trabajo/canaleta Efapel. El enlace de la consulta principal preselecciona el servicio específico conservando localidad y provincia. Las condiciones técnicas explican fuente compartida frente a contenido independiente, compatibilidad de vídeo y planificación de alimentación/datos.

Pruebas: 1159 HTML, 1154 URLs indexables y 111455 enlaces internos; cero errores. Verificada la existencia de las opciones de solicitud para los temas que las preseleccionan.

Comparación sobre la misma muestra ampliada de 30 municipios y 435 pares: mediana de 53,2 % a 52,5 %; máximo de 78,6 % a 69,7 %; cero pares por encima del 80 % en ambos casos. El punto de partida se recalcula tras las imágenes y pies de foto añadidos el día 20; no se compara directamente con el 51,6 % de la versión anterior sin esas leyendas. Es una medición editorial del texto, sin equivalencia con riesgo de penalización ni resultados de posicionamiento.
