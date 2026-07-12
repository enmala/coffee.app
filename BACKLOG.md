# Backlog - Barista Timer

Este archivo registra el estado de las tareas del proyecto. 
Los agentes de IA deben leer este archivo para saber qué implementar a continuación y actualizarlo al finalizar una tarea.

---

## 📌 En Progreso (Sprint Actual)
*(No hay tareas en progreso actualmente)*

---

## ⏳ Pendiente (Backlog Priorizado)

- [ ] **Calculadora Dinámica de Ratios**
  - *Etiquetas:* [Prioridad: Alta] [Complejidad: Alta]
  - *Descripción:* Permitir al usuario modificar la cantidad de café inicial (`coffee_g`) en tiempo de ejecución (por ejemplo, desde el resumen o antes de iniciar el timer) y que la aplicación recalcule y escale proporcionalmente la cantidad de agua necesaria para cada paso individual basándose en la relación (ratio) original. Pendiente por definir estrategia de calculo teniendo en cuenta que no solamente se debe aumentar la cantidad de agua sino que ajustar los tiempos por cada etapa del proceso.

- [ ] **Internacionalización**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Media]
  - *Descripción:* Ajuste de los mensajes y textos de la aplicación en multiples idiomas según la configuración del dispositivo o la selección del usuario. Al menos se debería soportar, ademas del español, ingles, portugues, aleman, frances y italiano.

- [ ] **Mejoras en el registro historico**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Media]
  - *Descripción:* Al realizar una evaluación del resultado de una preparación, dependiendo de la puntuación (estrellas) y los descriptores de sabor seleccionados se pueda sugerir ajustes a la receta para la próxima preparación.

- [ ] **Sincronización en la nube**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Alta]
  - *Descripción:* Como alternativa al almacenamiento puramente local (localStorage), permitir hacer un respaldo y sincronización automáticos de recetas e historial usando las cuentas personales del usuario en la nube sin necesidad de montar una infraestructura de backend compleja.

- [ ] **Disponibilidad en tiendas de aplicaciones**
  - *Etiquetas:* [Prioridad: Baja] [Complejidad: Media]
  - *Descripción:* Publicar la PWA en Google Play Store (como TWA) y en Microsoft Store.

---

## ✅ Completado
- [x] Agrupamiento dinámico de recetas por método en la lista principal.
- [x] Botón discreto de importación de JSON al lado de "Nueva Receta".
- [x] Modal de resumen de receta con lista de pasos detallados.
- [x] Alertas sonoras sintetizadas mediante Web Audio API en el temporizador.
- [x] Edición de Recetas Existentes (modificar parámetros y pasos de recetas guardadas en `localStorage`).
- [x] Gestión de granos de café (registro de granos con origen, variedad, tostaduría asociados a recetas).
- [x] Opciones para compartir recetas (Exportación a .json, enlace a portapapeles, código QR).
- [x] Mejoras UI: Reemplazar diálogos de alerta del navegador por modales nativos estilizados.
- [x] Ajustes UI menores: Reducción del timer SVG, tarjetas ámbar para verter agua y soluciones de superposición del menú de opciones (z-index).
