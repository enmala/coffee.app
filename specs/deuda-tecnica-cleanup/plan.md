# 🗺️ Plan de Implementación: Saneamiento de Deuda Técnica (Puntos 6, 7, 8 y 9)

**Feature:** Saneamiento de Deuda Técnica (PWA Identity, ConfirmModal, Emojis/Tailwind y Vitest Isolation)  
**Rama de trabajo:** `refactor/deuda-tecnica-cleanup`  
**Documento de Especificación:** [spec.md](./spec.md)  

---

## Fases de Ejecución

### Fase 1: Aislamiento de Vitest y Configuración Base (Puntos 6 y 9)
- [x] Actualizar `vitest.config.js` agregando `include` (`__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)`) y `exclude` (`node_modules`, `dist`, `.kilo`, `work`, `.git`).
- [x] Ejecutar `npm test` para verificar que el tiempo de ejecución se reduzca y no se escaneen worktrees externos.
- [x] Actualizar `index.html`: `lang="es"` y etiquetas `<meta name="theme-color">`.
- [x] Actualizar `vite.config.js`: `theme_color: '#78350f'`, `background_color: '#020617'`.
- [x] Actualizar `twa-manifest.json`: alinear colores de Android.

### Fase 2: Componentes SVG Faltantes y Limpieza de Estilos (Punto 8)
- [x] Añadir en `src/components/icons/SvgIcons.jsx`:
  - `BookOpenIcon`
  - `GlobeIcon`
  - `ScaleIcon`
  - `ArrowDownTrayIcon`
  - `CoffeeCupIcon` (`CupIcon`, preexistente)
  - `BoltIcon`
  - `CheckIcon`
  - `ArrowLeftIcon`
- [x] Sustituir emojis en:
  - `src/components/tabs/RecipesTab.jsx`
  - `src/components/tabs/HistoryTab.jsx`
  - `src/components/modals/RecipeFormModal.jsx`
  - `src/components/modals/RecipeSummaryModal.jsx`
  - `src/components/ImportBeanConfirmationModal.jsx`
- [x] **Extensión Fase 2** — emojis adicionales detectados fuera del alcance original:
  - `src/components/tabs/RecipeLibraryTab.jsx` (`📖`, `🌐`, `⚡`, `✓`)
  - `src/components/modals/StepFormModal.jsx` (`⚡`, `✓`)
  - `src/components/modals/RecipeSummaryModal.jsx` (`✓`)
  - `src/App.jsx` (`←`)
- [x] Reemplazar clases Tailwind inválidas por clases estándar:
  - `text-amber-805` → `text-amber-800` (3 instancias en `RecipeFormModal` / `HistoryTab`)
  - `border-emerald-250/10` → `border-emerald-200/10` (`RecipeSummaryModal`)
  - `text-slate-405` → `text-slate-400` (`BeanFormModal`)
  - `border-amber-250/20` → `border-amber-200/20` (`ImportBeanConfirmationModal`)
- [x] Verificar empíricamente (compilando el CSS con Tailwind v4) que `opacity-85` y `py-0.25` son válidas y no requieren corrección.

### Fase 3: Unificación y Extracción de `ConfirmModal` (Punto 7)
- [x] Crear el componente `src/components/modals/ConfirmModal.jsx`.
- [x] Crear la suite de pruebas unitarias `__tests__/ConfirmModal.test.jsx`.
- [x] Refactorizar `src/App.jsx` reemplazando los modales inline `beanToDelete`, `recipeToDelete`, `historyEntryToDelete` y `showClearHistoryConfirm` por `<ConfirmModal />`.
- [x] Validar que las pruebas unitarias existentes (`App.test.jsx`, `beans.test.jsx`, etc.) sigan pasando al 100%.
- [x] Accesibilidad completa de `ConfirmModal`: gestión de foco (abrir foco al botón Cancelar, restaurar al cerrar), focus trap (Tab/Shift+Tab dentro del modal), bloqueo de scroll del `body`, IDs dinámicos con `useId()` para `aria-labelledby`/`aria-describedby`.
- [x] Cobertura de pruebas al 100% de `ConfirmModal.jsx` (statements, branches, functions, lines).

### Fase 4: Verificación Integral, Backlog y Preparación de PR
- [x] Ejecutar suite completa con `npm test` (validar coverage $\ge 80\%$).
- [x] Ejecutar linter con `npm run lint` (0 errores).
- [x] Ejecutar auditoría de seguridad `npm audit --omit=dev --audit-level=high`.
- [x] Actualizar `BACKLOG.md` reflejando el progreso / tareas completadas.
- [x] Actualizar versión si aplica y sincronizar con Bubblewrap según las normas.
- [x] Documentar el paso de despliegue TWA: tras redesplegar el sitio con el nuevo manifiesto, reejecutar `npx @bubblewrap/cli update` para que el Android embebido (`app/src/main/res/raw/web_app_manifest.json`) refleje los nuevos colores e idioma.