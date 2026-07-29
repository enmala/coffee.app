# Backlog - Barista Timer

Este archivo registra el estado de las tareas del proyecto. 
Los agentes de IA deben leer este archivo para saber qué implementar a continuación y actualizarlo al finalizar una tarea.

---

## 📌 En Progreso (Sprint Actual)
*(No hay tareas en progreso actualmente)*

---

## ⏳ Pendiente (Backlog Priorizado)

- [ ] **Buscador de Recetas**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Baja]
  - *Descripción:* Barra de búsqueda en tiempo real dentro de la pestaña de recetas para filtrar por nombre de receta, método, autor o notas.

- [ ] **Calculadora Dinámica de Ratios**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Alta]
  - *Descripción:* Permitir al usuario modificar la cantidad de café inicial (`coffee_g`) en tiempo de ejecución (por ejemplo, desde el resumen o antes de iniciar el timer) y que la aplicación recalcule y escale proporcionalmente la cantidad de agua necesaria para cada paso individual basándose en la relación (ratio) original. Pendiente por definir estrategia de calculo teniendo en cuenta que no solamente se debe aumentar la cantidad de agua sino que ajustar los tiempos por cada etapa del proceso.

- [ ] **Internacionalización**
  - *Etiquetas:* [Prioridad: Alta] [Complejidad: Media]
  - *Descripción:* Ajuste de los mensajes y textos de la aplicación en multiples idiomas según la configuración del dispositivo o la selección del usuario. Al menos se debería soportar, ademas del español, ingles, portugues, aleman, frances e italiano.

- [ ] **Mejoras en el registro historico**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Alta]
  - *Descripción:* Al realizar una evaluación del resultado de una preparación, dependiendo de la puntuación (estrellas) y los descriptores de sabor seleccionados se pueda sugerir ajustes a la receta para la próxima preparación. Sería ideal ademas si se pudiera aplicar los ajustes sugeridos a la receta original, en este caso, la aplicación debería preguntar al usuario si desea aplicar los ajustes a la receta original o a una copia, para esta última, se deberia utilizar la fecha y hora actual mas la etiqueta " - copia" para diferenciarla de la original. Los ajustes sugeridos deberian ser realistas y coherentes with los descriptores de sabor y la puntuación obtenida. Por ejemplo: si la puntuación es baja y el descriptor es "ácido", se podría sugerir aumentar la temperatura del agua, si es "amargo", disminuir la temperatura del agua o el tiempo de infusión, si es "sin sabor", aumentar la cantidad de café o el tiempo de infusión, etc. Los parametros a ajustar son nivel de molido del grano, temperatura del agua, tiempos de infusión y ratio de café/agua.

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


---

## ✅ Completado
- [x] Corrección de observaciones de Google Play Console: habilitación de pantalla Edge-to-Edge mediante `WindowCompat` para Android 15 (SDK 35), alineación de dependencias de `androidbrowserhelper` y eliminación de restricciones de orientación/pantalla grande (`orientation: default`) para compatibilidad con Android 16 en dispositivos de pantalla grande y plegables (`v1.11.9`).
- [x] Extraer la lógica de recetas, granos, historial y navegación de `App.jsx` a custom hooks personalizados (`useRecipes`, `useBeans`, `useHistory`, `useNavigation`), reduciendo la complejidad del componente principal y manteniendo el 100% de la suite de tests en Vitest (`v1.11.8`).
- [x] Reutilización de instancia única de `AudioContext` en `playBeep` con `resume()` ante autoplay policy y `resetSharedAudioContext` para limpieza, evitando creación/cierre por cada pitido (`v1.11.7`).
- [x] Rediseño de acciones inferiores en modal de resumen (Opción A: botones secundarios sólo icono) para otorgar jerarquía primaria a "Iniciar Timer", e integración del cálculo dinámico del Ratio café/agua ($1:X$) en la vista de resumen y formulario de edición (`v1.11.6`).
- [x] Memorización con `useCallback` de handlers y funciones prop pasadas a componentes hijos (`RecipesTab`, `BeansTab`, `HistoryTab`, modales, etc.) en `App.jsx` eliminando re-renderizados innecesarios (`v1.11.5`).
- [x] Incremento de cobertura de pruebas unitarias para `RecipeSummaryModal.jsx` (100% líneas) y `coffeeUtils.jsx` (92.9% líneas), elevando la cobertura global del proyecto al 91.66% (`v1.11.4`).
- [x] Eliminación de emojis inconsistentes y creación del módulo `SvgIcons.jsx` con componentes React SVG reutilizables para acciones y etiquetas (`v1.11.3`).
- [x] Corrección de clases Tailwind no estándar reemplazando valores fuera de la paleta oficial por equivalentes estándar (50-950) en 11 archivos (`v1.11.2`).
- [x] Manejo defensivo con `try/catch` en operaciones de `localStorage` y validación de esquemas de datos al cargar mediante el módulo `storageUtils` (`v1.11.1`).
- [x] Reemplazo de IDs basados en `Date.now()` por `crypto.randomUUID()` en recetas, granos, beans importados e historial para eliminar riesgo de colisión (`v1.11.0`).
- [x] Unificación de la paleta de color de fondo en modo oscuro (Slate) para los modales de compartir e importar recetas y granos (`v1.10.2`).
- [x] Corrección de la expansión del título de receta en el modal de resumen activando el botón de alternancia chevron para nombres largos y aplicando ajuste multilínica (`v1.10.1`).
- [x] Ampliación de la ficha de granos de café agregando campos para región, finca, productor y año de cosecha junto con la fecha de tueste (v1.10.0).
- [x] Función para duplicar/copiar recetas como base para crear nuevas variaciones pre-cargando el formulario de receta (v1.9.2).
- [x] Mejora de contraste y legibilidad del distintivo del método de extracción en la vista del temporizador para el modo oscuro (v1.9.1).
- [x] Soporte para recetas de té (Matcha, Sencha, Gongfu, etc.), temporizador con flujo para pasos manuales untimed (`duration_s: 0`), iconografía adaptativa (🍵 vs ☕), etiquetas dinámicas de insumo/presentación y recetas predeterminadas de Té Verde y Matcha (v1.9.0).
- [x] Sección de contacto directo vía correo (`baristatimer@bitslab.cl`) en el modal "Acerca de" con función de copiado rápido al portapapeles y actualización del correo en la Política de Privacidad (v1.8.0).
- [x] Corrección en la gestión de favoritas: preservación del estado `is_favorite` al editar y guardar recetas existentes (v1.7.1).
- [x] Sistema de recetas favoritas con ordenamiento prioritario en el listado y botón de toggle en tarjetas y resumen de receta (v1.7.0).
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
- [x] Ocultamiento dinámico del botón de donaciones Ko-fi en el contexto de Android TWA para cumplimento con las políticas de Google Play Store (v1.6.2).
- [x] Inclusión de la receta predeterminada de Moka italiana estándar a la lista de recetas predeterminadas de la app (v1.6.3).
- [x] Corrección de la orientación de los iconos de los botones avanzar/retroceder en la vista del temporizador y ocultamiento visual al llegar al primer/último paso (v1.6.4).
- [x] Actualización del nivel de compatibilidad objetivo de Android a API 36 (Android 16) en la configuración TWA y Gradle (v1.6.5).
- [x] Refactorización de las listas de constantes predeterminadas (DEFAULT_RECIPES, DEFAULT_BEANS, DEFAULT_TASTING_NOTES) a src/constants/defaultData.js e inclusión de la receta por defecto para Prensa Francesa (Técnica Hoffmann) (v1.6.6).
- [x] Refactorización modular de `App.jsx` extrayendo componentes modales (`AboutModal`, `SettingsModal`, `RecipeSummaryModal`, `RecipeFormModal`, `BeanFormModal`) a `src/components/modals/` y componentes de pestañas (`RecipesTab`, `BeansTab`, `HistoryTab`) a `src/components/tabs/`, reduciendo la complejidad del archivo principal sin alterar la suite de tests (v1.6.7).
- [x] Configuración de RSA JWS para filtrado de instalaciones TWA en Google Play (v1.3.0).
- [x] Pruebas de accesibilidad y revisión de accesibilidad en modales y vistas de resumen (v1.2.0).
- [x] Sistema de favoritos con UI mejorada para el modal de resumen y formularios (v1.1.0).
- [x] Mejora de navegación con API History y manejo de estados de vistas (v1.0.0).
- [x] Implementación inicial: localStorage, agrupamiento por métodos, resumen de receta, temporizador por etapas, historial, temas, import/export JSON y configuracion PWA.


---

## 🛠️ Deuda Técnica

- [x] **Extraer lógica de `App.jsx` a custom hooks** (`v1.11.8`)
  - *Etiquetas:* [Prioridad: Alta] [Complejidad: Media]
  - *Descripción:* Mover la lógica de recipes, beans, history y navigation a hooks personalizados (`useRecipes`, `useBeans`, `useHistory`, `useNavigation`) para reducir la complejidad de `App.jsx`.

- [x] **Aumentar cobertura de `RecipeSummaryModal` y `coffeeUtils`**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Media]
  - *Descripción:* `RecipeSummaryModal` está en 100% statements / 98.75% branches. `coffeeUtils.jsx` está en 90.11% statements. Ambas pruebas unitarias garantizan robustez ante futuros cambios. (`v1.11.4`).

- [x] **Eliminar emojis inconsistentes y usar solo iconos SVG**
  - *Etiquetas:* [Prioridad: Baja] [Complejidad: Baja]
  - *Descripción:* Se mezclan emojis (🗑️, ⚠️, ✅) con iconos SVG. Definir iconos SVG para acciones de confirmación/eliminación o usar emojis en todo para consistencia visual.

- [x] **Corregir clases Tailwind no estándar**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Baja]
  - *Descripción:* Aparecen clases como `text-slate-655`, `dark:bg-emerald-650`, `dark:text-slate-450`, `dark:hover:bg-red-750`. Usar la paleta estándar de Tailwind (50-950) para evitar errores de compilación o suciedad en el bundle.

- [x] **Usar `useCallback` en handlers pasados a componentes hijos**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Baja]
  - *Descripción:* Funciones como `handleSaveRecipe`, `handleEditRecipe`, `handleDeleteRecipe`, etc., se recrean en cada render. Memorizarlas con `useCallback` evitaría re-renderizados innecesarios en `RecipesTab`, `BeansTab`, modales y tab components. (`v1.11.5`).

- [x] **Gestión y reutilización de `AudioContext` en Web Audio API**
  - *Etiquetas:* [Prioridad: Media] [Complejidad: Baja]
  - *Descripción:* En `src/utils/coffeeUtils.jsx`, `playBeep` instancia un `new AudioContext()` y lo cierra en cada sonido. Reutilizar una única instancia de `AudioContext` previene consumo innecesario de memoria y bloqueos de audio en móviles/TWA. (`v1.11.7`).

- [ ] **Memorización (`useMemo`) en filtrado y búsqueda de recetas y granos**
  - *Etiquetas:* [Prioridad: Baja] [Complejidad: Baja]
  - *Descripción:* En `RecipesTab.jsx` y `BeansTab.jsx`, el filtrado por texto de búsqueda y método/categoría se evalúa en cada render. Memorizar las listas filtradas con `useMemo` optimizará la fluidez en dispositivos móviles.

- [ ] **Refactorizar patrones repetidos de vibración en `TimerComponent`**
  - *Etiquetas:* [Prioridad: Baja] [Complejidad: Baja]
  - *Descripción:* La lógica de selección de patrón de vibración se repite 3 veces. Extraer a una función auxiliar como `getVibrationPattern(type, isCompletion)`.

- [ ] **Centralizar configuración de tamaños y espaciados**
  - *Etiquetas:* [Prioridad: Baja] [Complejidad: Media]
  - *Descripción:* Los tamaños de fuente y espaciados están hardcodeados en cada componente. Considerar un archivo `src/utils/breakpoints.js` o variables CSS para facilitar ajustes de responsive.


