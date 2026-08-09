# Plan: Rediseño de RecipeSummaryModal y estandarización de tabs

## Objetivo
Reducir la carga cognitiva del modal de resumen, reactivar los menús contextuales en las tarjetas y estandarizar el uso de iconos SVG eliminando emojis.

---

## Tareas de implementación

### 1. Reactivar menú contextual en RecipesTab
**Archivo:** `src/components/tabs/RecipesTab.jsx`

- Eliminar el wrapper `<div className="hidden" aria-hidden="true">` (línea 119).
- Eliminar `aria-hidden="true"` del contenedor del menú.
- Asegurar que el trigger "•••" sea visible en cada tarjeta.
- Asegurar que `menuOpenRecipeId`/`setMenuOpenRecipeId` se propague desde `App.jsx`.
- El menú contiene: Ver Resumen, Editar, Compartir, Duplicar, Eliminar.
- El botón de favorito sigue en la tarjeta (no se mueve al menú).

### 2. Agregar menú contextual en BeansTab
**Archivo:** `src/components/tabs/BeansTab.jsx`

- Reemplazar los 3 botones visibles (Compartir, Editar, Eliminar) por un único trigger de menú "•••" alineado a la derecha.
- El menú contiene: Editar, Compartir, Eliminar.
- Manejar estado local `menuOpenBeanId` para alternar visibilidad del menú.
- Estructura similar a RecipesTab con `stopPropagation`.

### 3. Rediseñar header de RecipeSummaryModal
**Archivo:** `src/components/modals/RecipeSummaryModal.jsx`

- Eliminar `truncate` del `<h3>` y aplicar siempre `whitespace-normal break-words leading-sug`.
- Eliminar el estado `isRecipeNameExpanded` y el botón de chevron (no hay truncación, el nombre se expande automáticamente a 2+ líneas).
- Eliminar la condición `summaryRecipe.name.length > 18` y el botón asociado.
- Mantener favorito y compartir en una fila secundaria visible debajo del título (Opción A elegida).
- El botón de cerrar se mantiene en la esquina superior derecha.
- El método se mantiene como badge debajo del título.
- El `max-h-[85vh]` del modal con `overflow-y-auto` en el cuerpo absorbe el crecimiento del header sin romper el layout.

### 4. Reducir footer de RecipeSummaryModal
**Archivo:** `src/components/modals/RecipeSummaryModal.jsx`

- Eliminar los botones de Editar y Duplicar del footer.
- Mantener solo:
  - **Iniciar Timer** como botón primario (ancho completo, estilo actual).
  - **Eliminar** como botón secundario menos prominente (borde rojo sutil, icono de basura).

### 5. Simplificar cuerpo del modal
**Archivo:** `src/components/modals/RecipeSummaryModal.jsx`

- Reducir el grid de parámetros físicos a lo esencial: Café (g), Temperatura (°C), Ratio (badge prominente).
- Mover Molienda, Agua Total y Tiempo Total a un acordeón colapsable "Detalles" debajo del resumen principal.
- El acordeón de grano de café se mantiene, reemplazando emojis por iconos SVG.
- Limpiar clases Tailwind no estándar en el acordeón de grano (`text-slate-405` → `text-slate-500`).

### 6. Estandarizar emojis en beans
**Archivos:** `src/components/modals/RecipeSummaryModal.jsx`, `src/components/tabs/BeansTab.jsx`

- Reemplazar emojis en badges de grano por iconos SVG desde `SvgIcons.jsx`:
  - 📍 origen → `MapPinIcon`
  - 🏡 finca → icono de casa
  - 🧑‍🌾 productor → icono de usuario
  - 🔥 tueste → mantener texto o icono de fuego
  - 🌱 variedad → icono de planta
  - 🌾 cosecha → icono de calendario
  - 🏆 SCA → icono de trofeo

### 7. Ajustes en App.jsx
**Archivo:** `src/App.jsx`

- Eliminar props `onEdit` y `onDuplicate` del `RecipeSummaryModal`.
- Eliminar callbacks `onEditFromSummary` y `onDuplicateFromSummary` si quedan sin uso.
- Asegurar que `menuOpenRecipeId` se propaga a `RecipesTab`.
- Verificar que no hay props sin usar ni warnings del linter.

### 8. Tests
**Archivos:** `__tests__/RecipeSummaryModal.test.jsx`, `__tests__/RecipesTab.test.jsx`, `__tests__/BeansTab.test.jsx`

- Eliminar tests de botones Editar y Duplicar en footer de RecipeSummaryModal.
- Verificar que el título no se trunca y que nombres largos ocupan 2+ líneas.
- Verificar que el botón Eliminar sigue presente y funcional.
- Verificar que el acordeón de detalles funciona.
- Verificar que el menú contextual es visible y funcional en RecipesTab.
- Verificar que el menú contextual reemplaza los botones visibles en BeansTab.

---

## Validación final
- `npm test` pasa sin errores.
- `npm run lint` pasa sin errores.
- `npm run test:coverage` mantiene cobertura ≥80%.
- `npm audit --audit-level=high` sin vulnerabilidades altas.
