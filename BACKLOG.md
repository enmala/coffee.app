# Backlog - Barista Timer

Este archivo registra el estado de las tareas del proyecto. 
Los agentes de IA deben leer este archivo para saber qué implementar a continuación y actualizarlo al finalizar una tarea.

---

## 📌 En Progreso (Sprint Actual)
*(No hay tareas en progreso actualmente)*

---

## ⏳ Pendiente (Backlog Priorizado)

- [ ] **Calculadora Dinámica de Ratios**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Alta]
  - *Descripción:* Permitir al usuario modificar la cantidad de café inicial (`coffee_g`) en tiempo de ejecución (por ejemplo, desde el resumen o antes de iniciar el timer) y que la aplicación recalcule y escale proporcionalmente la cantidad de agua necesaria para cada paso individual basándose en la relación (ratio) original. Pendiente por definir estrategia de calculo teniendo en cuenta que no solamente se debe aumentar la cantidad de agua sino que ajustar los tiempos por cada etapa del proceso.

- [ ] **Internacionalización**
  - *Etiquetas:* [Prioridad: Alta] [Complejidad: Media]
  - *Descripción:* Ajuste de los mensajes y textos de la aplicación en multiples idiomas según la configuración del dispositivo o la selección del usuario. Al menos se debería soportar, ademas del español, ingles, portugues, aleman, frances e italiano.

- [ ] **Mejoras en el registro historico**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Alta]
  - *Descripción:* Al realizar una evaluación del resultado de una preparación, dependiendo de la puntuación (estrellas) y los descriptores de sabor seleccionados se pueda sugerir ajustes a la receta para la próxima preparación. Sería ideal ademas si se pudiera aplicar los ajustes sugeridos a la receta original, en este caso, la aplicación debería preguntar al usuario si desea aplicar los ajustes a la receta original o a una copia, para esta última, se deberia utilizar la fecha y hora actual mas la etiqueta " - copia" para diferenciarla de la original. Los ajustes sugeridos deberian ser realistas y coherentes con los descriptores de sabor y la puntuación obtenida. Por ejemplo: si la puntuación es baja y el descriptor es "ácido", se podría sugerir aumentar la temperatura del agua, si es "amargo", disminuir la temperatura del agua o el tiempo de infusión, si es "sin sabor", aumentar la cantidad de café o el tiempo de infusión, etc. Los parametros a ajustar son nivel de molido del grano, temperatura del agua, tiempos de infusión y ratio de café/agua.

- [ ] **Sincronización en la nube**
  - *Etiquetas:* [Prioridad: Baja] [Complejidad: Alta]
  - *Descripción:* Como alternativa al almacenamiento puramente local (localStorage), permitir hacer un respaldo y sincronización automáticos de recetas e historial usando las cuentas personales del usuario en la nube sin necesidad de montar una infraestructura de backend compleja.

- [ ] **Disponibilidad en tiendas de aplicaciones**
  - *Etiquetas:* [Prioridad: Baja] [Complejidad: Media]
  - *Descripción:* Publicar la PWA en Google Play Store (como TWA) y en Microsoft Store.

- [ ] **Mejoras de Interfaz**
  - En los formularios de edición de recetas y granos agregar un indicador de cambios sin guardar.
  - En la edición de recetas mostrar un resumen en tiempo real (pasos totales, agua acumulada, tiempo total)
  - Mejorar la visualización del timer especialmente en pantallas muy pequeñas
  - Diferenciar tab de historial de los de recetas y granos
  - Mejorar el icono svg del tab de historial

---

## ✅ Completado
- [x] Acceso directo y visible a la vista "Acerca de" desde el encabezado, manteniendo la estética del diseño.
- [x] Refactor del enlace "Acerca de" en el modal de Configuración a diseño de pill badge con icono informativo.
- [x] Agrupamiento dinámico de recetas por método en la lista principal.
- [x] Botón discreto de importación de JSON al lado de "Nueva Receta".
- [x] Modal de resumen de receta con lista de pasos detallados.
- [x] Alertas sonoras sintetizadas mediante Web Audio API en el temporizador.
- [x] Edición de Recetas Existentes (modificar parámetros y pasos de recetas guardadas en `localStorage`).
- [x] Gestión de granos de café (registro de granos con origen, variedad, tostaduría asociados a recetas).
- [x] Opciones para compartir recetas (Exportación a .json, enlace a portapapeles, código QR).
- [x] Mejoras UI: Reemplazar diálogos de alerta del navegador por modales nativos estilizados.
- [x] Ajustes UI menores: Reducción del timer SVG, tarjetas ámbar para verter agua y soluciones de superposición del menú de opciones (z-index).
- [x] Gestión de Navegación de Retroceso (History API) para vistas y diálogos internos, permitiendo salir de la aplicación directamente con el gesto nativo.
- [x] Mejoras de UI/UX y accesibilidad en el editor de recetas (autoguardado de pasos en progreso, totales dinámicos en tiempo real y aumento de tamaño de tipografía).
- [x] Optimización UX/UI de la vista de resumen de receta, auto-start en el temporizador y acordeón de grano de café asociado (v1.4.0).
- [x] Configuración, documentación y preparación de empaquetado TWA (Google Play Store) usando Bubblewrap (v1.4.2).
- [x] Opciones para compartir granos de café (Base64 URL, código QR, descarga JSON, copiado de enlace e importación automática desde la URL) (v1.5.0).
- [x] Opción para importar granos de café desde archivos JSON locales y coherencia visual en los botones de la pestaña Granos (v1.5.1).
- [x] Mejoras técnicas de UX/UI: Contraste mejorado en modo oscuro, estandarización de tamaños de fuente, reemplazo de emojis con SVG, mejora de estados deshabilitados y optimización de overflow en listas (v1.5.2).
- [x] Unificación de importación de JSON (recetas y granos) a un único botón en Configuración con detección automática de tipo de archivo (v1.6.0).
- [x] Rediseño estético y mejora de representatividad de los iconos SVG en el header y los selectores de pestañas (v1.6.1).
- [x] Ocultamiento dinámico del botón de donaciones Ko-fi en el contexto de Android TWA para cumplimiento con las políticas de Google Play Store (v1.6.2).

