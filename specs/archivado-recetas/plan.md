# 🛠️ Plan de Implementación: Sistema de Archivado de Recetas

**Proyecto:** Barista Timer PWA  
**Feature:** Sistema de Archivado de Recetas con Filtros Rápidos (Opción 3 Mejorada)  
**Especificación:** [`specs/archivado-recetas/spec.md`](file:///home/enmala/coffee.app/specs/archivado-recetas/spec.md)  
**Versión Objetivo:** `1.15.0`  

---

## 1. 🌿 Gestión de Ramas y Flujo Git

1. **Sincronización:** Verificar sincronización de `main` con el repositorio remoto.
2. **Creación de rama:** Crear y alternar a la rama `feat/recipe-archiving-system`.
3. **Flujo de trabajo:** Todos los commits seguirán el formato de *Conventional Commits* (`feat: ...`, `test: ...`, `docs: ...`).

---

## 2. 🧩 Cambios Propuestos por Componente

### 2.1. Iconografía Reutilizable
* **Archivo:** [`src/components/icons/SvgIcons.jsx`](file:///home/enmala/coffee.app/src/components/icons/SvgIcons.jsx)
* **Acciones:**
  * Crear y exportar componente SVG `ArchiveIcon` (para chip, badge y acción de archivar).
  * Crear y exportar componente SVG `ArchiveRestoreIcon` (para acción de desarchivar/restaurar).
  * Crear y exportar componente SVG `InboxEmptyIcon` (para estados vacíos).

---

### 2.2. Estado y Lógica del Hook de Recetas
* **Archivo:** [`src/hooks/useRecipes.js`](file:///home/enmala/coffee.app/src/hooks/useRecipes.js)
* **Acciones:**
  * Introducir estado `recipeFilterMode` con valor inicial `'active'` (valores posibles: `'active'`, `'archived'`, `'all'`), **persistido en `localStorage` bajo la clave `coffee_recipe_filter_mode_v1`** con valor por defecto `'active'` (patrón `safeGetItem`/`safeSetItem`, consistente con `theme`, `collapsed_methods_v1`, etc.).
  * Calcular contadores en tiempo real memoizados o calculados: `activeCount`, `archivedCount`, `totalCount`.
  * Filtrar la agrupación `groupedRecipes` según `recipeFilterMode`:
    * `'active'`: filtra `!recipe.is_archived`.
    * `'archived'`: filtra `!!recipe.is_archived`.
    * `'all'`: incluye todas las recetas sin filtrar.
  * Crear handlers de acción:
    * `handleArchiveRecipe(recipeId)`: marca `is_archived: true` siguiendo el patrón de `handleToggleFavorite` (`safeSetItem` dentro del updater + sincroniza `summaryRecipe` si coincide), y dispara el undo toast.
    * `handleUnarchiveRecipe(recipeId)`: marca `is_archived: false`.
    * `handleUndoArchive(recipeId)`: restaura el estado previo.
  * Introducir estado `undoArchiveToast` (patrón `saveSuccessMessage`): `{ recipeId, recipeName }` con timeout automático de 4s; renderizado en `App.jsx`.
  * Modificar `handleSaveRecipe` para **preservar** el valor de `is_archived` al editar recetas existentes.
  * Asegurar retrocompatibilidad: tratar recetas sin `is_archived` como `false` de forma transparente (normalización en el lazy initializer de `useState` + fallback defensivo en `groupedRecipes`).

---

### 2.3. Interfaz de Usuario y Pestaña de Recetas
* **Archivo:** [`src/components/tabs/RecipesTab.jsx`](file:///home/enmala/coffee.app/src/components/tabs/RecipesTab.jsx)
* **Acciones:**
  * Agregar la barra de chips de filtro (`Activas`, `Archivadas`, `Todas`) con sus respectivos iconos SVG y contadores dinámicos.
  * Agregar micro-animación `scale-105` en contadores al actualizar valores.
  * Actualizar renderizado de tarjetas de receta:
    * Tarjetas archivadas: borde punteado `border-2 border-dashed border-slate-300 dark:border-slate-600`, opacidad reducida y badge `[📦 Archivada]`.
    * Menú contextual `•••`: opción condicional `Archivar` o `Desarchivar`.
  * Diseñar e integrar *Empty States* contextualmente específicos para `'active'`, `'archived'` y `'all'`.

---

### 2.4. Modales de Resumen y Edición
* **Archivo:** [`src/components/modals/RecipeSummaryModal.jsx`](file:///home/enmala/coffee.app/src/components/modals/RecipeSummaryModal.jsx)
  * Mostrar badge `[📦 Receta Archivada]` en el encabezado si la receta está archivada.
  * Agregar botón secundario `[Desarchivar]` / `[Archivar]`.
* **Archivo:** [`src/components/modals/RecipeFormModal.jsx`](file:///home/enmala/coffee.app/src/components/modals/RecipeFormModal.jsx)
  * Mostrar badge informativo `"Editando receta archivada"` en el header del modal cuando corresponda.

---

### 2.5. Conexión Principal en App
* **Archivo:** [`src/App.jsx`](file:///home/enmala/coffee.app/src/App.jsx)
  * Conectar `recipeFilterMode`, `setRecipeFilterMode`, `handleArchiveRecipe`, `handleUnarchiveRecipe` con `RecipesTab` y los modales.
  * Renderizar `undoArchiveToast` (patrón `saveSuccessMessage`): toast fijo en bottom-center con `[Deshacer]` y timeout de 4s.

---

## 3. 🧪 Plan de Pruebas y Validación (Vitest)

* **Archivo nuevo de tests:** [`__tests__/recipeArchiving.test.jsx`](file:///home/enmala/coffee.app/__tests__/recipeArchiving.test.jsx)
* **Casos de prueba automatizados:**
  1. **Filtro por defecto:** La app inicia en modo `active` y muestra solo recetas no archivadas.
  2. **Contadores precisos:** Los chips reflejan exactamente la cantidad de activas, archivadas y totales.
  3. **Flujo de archivar:** Al archivar desde el menú `•••`, la receta se oculta de `active`, sube el contador de `archived` y se emite el toast.
  4. **Acción Deshacer (Undo):** Presionar deshacer restaura inmediatamente la receta al estado activo.
  5. **Flujo de desarchivar:** Desde el filtro `archived`, desarchivar devuelve la receta al filtro `active`.
  6. **Vista Todas:** Muestra tanto activas como archivadas, aplicando a estas últimas el badge y borde punteado.
  7. **Preservación en edición:** Editar y guardar una receta archivada no altera su estado `is_archived: true`.
  8. **Retrocompatibilidad:** Cargar datos legacy sin propiedad `is_archived` se interpreta como activas.
  9. **Importación / Exportación JSON:** El campo `is_archived` se preserva intacto en las operaciones de I/O.
* **Comandos de validación:**
  * `npm test` (100% de tests pasando).
  * `npm run lint` (0 errores/advertencias).
  * `npm audit --audit-level=high`.

---

## 4. 📦 Versionamiento y Documentación

1. **Actualizar versión en [`package.json`](file:///home/enmala/coffee.app/package.json):** Incrementar a `1.15.0`.
2. **Actualizar [`BACKLOG.md`](file:///home/enmala/coffee.app/BACKLOG.md):** Registrar la nueva funcionalidad en la sección `✅ Completado` bajo la versión `1.15.0`.
3. **Actualización TWA:** Ejecutar `npx @bubblewrap/cli update --appVersionName="1.15.0"`.
