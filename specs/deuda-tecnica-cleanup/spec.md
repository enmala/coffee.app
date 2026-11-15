# 📋 Especificación Técnica: Saneamiento de Deuda Técnica (Puntos 6, 7, 8 y 9)

**Proyecto:** Barista Timer PWA  
**Área:** Deuda Técnica / Refactorización / Consistencia Visual y Testing  
**Estado:** Propuesta de Especificación / Lista para Implementación  
**Versión:** 1.0.0  
**Fecha:** 15 de Noviembre de 2026  

---

## 1. 🎯 Resumen Ejecutivo y Objetivos

Esta especificación detalla el trabajo de saneamiento y modernización técnica para cuatro ítems clave del backlog de **Barista Timer**:

1. **Punto 6 (Identidad Visual PWA/TWA e Idioma):** Alinear los metadatos y colores del Web App Manifest, Vite PWA y Bubblewrap con la identidad de diseño ámbar/pizarra de la aplicación, y corregir la etiqueta de idioma HTML.
2. **Punto 7 (Unificación de Modales de Confirmación):** Extraer un componente genérico y reutilizable `ConfirmModal.jsx`, reemplazando 4 bloques de modales duplicados en `App.jsx` y eliminando más de 120 líneas de código repetitivo.
3. **Punto 8 (Limpieza de Emojis y Clases no Estándar):** Erradicar los emojis restantes en las pestañas y modales reemplazándolos por iconos SVG coherentes de `SvgIcons.jsx`, y corregir las clases Tailwind residuales inexistentes (`text-amber-805`).
4. **Punto 9 (Aislamiento de la Suite de Pruebas):** Configurar `include` y `exclude` explícitos en `vitest.config.js` para blindar la ejecución de pruebas unitarias frente a worktrees, carpetas temporales o directorios de herramientas (`.kilo`, `work`, `dist`).

---

## 2. 📱 Punto 6: Identidad Visual PWA / TWA e Idioma HTML

### 2.1. Diagnóstico del Problema
* `index.html` declara `<html lang="en">` en una aplicación cuyos textos son 100% en español.
* No existe `<meta name="theme-color">` declarado en el `<head>` de `index.html`.
* `vite.config.js` y `twa-manifest.json` definen `theme_color` y `background_color` con `#1e1b4b` (índigo oscuro genérico de plantillas).
* En Android o escritorio, la barra de estado del sistema operativo y la pantalla de carga (splash screen) muestran un color azul/índigo discordante con la paleta ámbar/slate de la app.

### 2.2. Cambios Requeridos

#### A. `index.html`
* Modificar el atributo del elemento raíz: `<html lang="es">`.
* Añadir etiquetas `<meta name="theme-color">` adaptadas a esquemas de color claro y oscuro:
  ```html
  <meta name="theme-color" content="#78350f" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#020617" media="(prefers-color-scheme: dark)" />
  ```

#### B. `vite.config.js`
* Actualizar la configuración del plugin `VitePWA`:
  ```javascript
  theme_color: '#78350f',      // amber-900 para barra de navegación / UI
  background_color: '#020617', // slate-950 para pantalla de carga
  ```

#### C. `twa-manifest.json`
* Alinear los colores para el empaquetado de Android con Bubblewrap:
  ```json
  "themeColor": "#78350F",
  "themeColorDark": "#020617",
  "navigationColor": "#78350F",
  "navigationColorDark": "#020617",
  "navigationDividerColor": "#000000",
  "navigationDividerColorDark": "#000000",
  "backgroundColor": "#020617"
  ```

---

## 3. 🧩 Punto 7: Unificación y Extracción de Modales de Confirmación (`ConfirmModal`)

### 3.1. Diagnóstico del Problema
En `src/App.jsx` (líneas 724 a 865) coexisten 4 modales de confirmación estructurados casi de forma idéntica:
1. `beanToDelete`: Confirmación de eliminación de grano (con listado condicional de recetas vinculadas si el grano está en uso).
2. `recipeToDelete`: Confirmación de eliminación de receta.
3. `historyEntryToDelete`: Confirmación de eliminación de registro de extracción.
4. `showClearHistoryConfirm`: Confirmación de vaciado total del historial.

Cada bloque duplica el backdrop oscurecido con `backdrop-blur-sm`, el contenedor modal con `rounded-2xl`, la cabecera con icono SVG, el título, la descripción, y la botonera inferior con "Cancelar" y "Sí, Eliminar".

### 3.2. Diseño del Componente `ConfirmModal.jsx`
Crear `src/components/modals/ConfirmModal.jsx` con una API flexible, limpia y accesible:

```jsx
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Sí, Eliminar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger', // 'danger' | 'warning'
  icon = 'trash',            // 'trash' | 'warning' | ReactNode
  onConfirm,
  onCancel,
  children
})
```

#### Estilos y Comportamiento de Variantes:
* **Icono:**
  * `'trash'`: `<TrashIcon className="w-10 h-10 text-red-500 dark:text-red-400" />`
  * `'warning'`: `<WarningTriangleIcon className="w-10 h-10 text-amber-500 dark:text-amber-400" />`
* **Botón de Confirmación:**
  * `'danger'`: `bg-red-600 hover:bg-red-700 text-white`
  * `'warning'`: `bg-amber-600 hover:bg-amber-700 text-white`
* **Soporte para Contenido Personalizado (`children`):**
  * Para el caso de eliminación de granos en uso, el cuerpo renderizará las recetas asociadas dentro de `children`, manteniendo la lógica limpia y modular.
* **Accesibilidad (a11y):**
  * Atributos `role="dialog"`, `aria-modal="true"`, `aria-labelledby` y `aria-describedby`.
  * IDs generados con `useId()` de React para `aria-labelledby` / `aria-describedby`, evitando colisiones de IDs si se montan varias instancias.
  * **Gestión del foco:** al abrir, el foco se mueve al primer elemento focusable (botón Cancelar); al cerrar, el foco se restaura al elemento que lo tenía antes.
  * **Focus trap:** la tecla `Tab` / `Shift+Tab` cicla únicamente dentro del modal (evita que el foco escape al contenido de fondo).
  * **Bloqueo de scroll:** se fija `document.body.style.overflow = 'hidden'` mientras el modal está abierto y se restaura al cerrar.
  * Soporte para cierre con la tecla `Escape`.

---

## 4. 🎨 Punto 8: Limpieza Integral de Emojis Residuales y Clases Tailwind no Estándar

### 4.1. Diagnóstico del Problema
1. **Clases no estándar:** `text-amber-805` existe en 3 ubicaciones. Además, tras un escaneo exhaustivo se detectaron clases de color con sufijos fuera de la escala estándar de Tailwind (50–950): `emerald-250`, `amber-250` y `slate-405`. Estas clases no existen en la paleta y generan estilos rotos o inconsistentes.
2. **Emojis residuales:** A pesar de haber creado `SvgIcons.jsx`, persisten emojis en textos y botones de navegación en `RecipesTab.jsx`, `HistoryTab.jsx`, `ImportBeanConfirmationModal.jsx`, `RecipeSummaryModal.jsx` y `RecipeFormModal.jsx`. Tras la primera pasada, se detectaron emojis adicionales en archivos no incluidos en el alcance original: `RecipeLibraryTab.jsx`, `StepFormModal.jsx`, `RecipeSummaryModal.jsx` (badge) y `App.jsx` (botón "Volver al listado").

> **Nota sobre Tailwind v4:** El proyecto usa Tailwind CSS `v4` (`^4.3.1`), cuyas escalas de espaciado y opacidad son dinámicas. Se verificó empíricamente (compilando el CSS) que `opacity-85` y `py-0.25` **sí se generan** y son válidas; por tanto NO se consideran clases inválidas y no requieren corrección. Solo las clases de **color** con sufijo numérico no estándar (`250`, `405`) son inválidas, ya que la paleta de colores es fija.

### 4.2. Plan de Corrección

#### A. Clases Tailwind Inválidas
* `src/components/modals/RecipeFormModal.jsx:131`:
  Reemplazar `text-amber-805 dark:text-amber-500` por `text-amber-800 dark:text-amber-400`.
* `src/components/tabs/HistoryTab.jsx:84`:
  Reemplazar `text-amber-805 dark:text-amber-500` por `text-amber-800 dark:text-amber-400`.
* `src/components/tabs/HistoryTab.jsx:93`:
  Reemplazar `text-amber-805 dark:text-amber-300` por `text-amber-800 dark:text-amber-300`.
* `src/components/modals/RecipeSummaryModal.jsx:396`:
  Reemplazar `border-emerald-250/10` por `border-emerald-200/10`.
* `src/components/modals/BeanFormModal.jsx:230`:
  Reemplazar `text-slate-405` por `text-slate-400`.
* `src/components/ImportBeanConfirmationModal.jsx:135`:
  Reemplazar `border-amber-250/20` por `border-amber-200/20`.

#### B. Nuevos Iconos SVG en `src/components/icons/SvgIcons.jsx`
Incorporar los componentes SVG que faltan para reemplazar los emojis:
* `BookOpenIcon`: Para el botón `📖 Biblioteca` en `RecipesTab.jsx` y `RecipeLibraryTab.jsx`.
* `GlobeIcon`: Para el chip `🌐 Todas` en `RecipesTab.jsx` y `RecipeLibraryTab.jsx`.
* `ScaleIcon`: Para el indicador de ratio `⚖️ Ratio` en `RecipeFormModal.jsx`.
* `ArrowDownTrayIcon`: Para la acción `📥 Agregar a Mis Recetas` en `RecipeSummaryModal.jsx`.
* `BoltIcon`: Para el `⚡` del header de `StepFormModal.jsx` y el banner offline de `RecipeLibraryTab.jsx`.
* `CheckIcon`: Para los `✓ En tu catálogo` / `✓ Guardar Cambios en Paso` en `RecipeLibraryTab.jsx`, `RecipeSummaryModal.jsx` y `StepFormModal.jsx`.
* `ArrowLeftIcon`: Para el `← Volver al listado` en `App.jsx`.

#### C. Sustitución de Emojis en Componentes
1. **`RecipesTab.jsx`:**
   * Reemplazar `📖 Biblioteca` por `<BookOpenIcon className="w-3.5 h-3.5" /> Biblioteca`.
   * Reemplazar `<span>☕</span>` en chip Activas por `<CupIcon className="w-3.5 h-3.5" />`.
   * Reemplazar `<span>🌐</span>` en chip Todas por `<GlobeIcon className="w-3.5 h-3.5" />`.
   * Reemplazar texto `📦 Archivada` en tarjeta por `<ArchiveIcon className="w-3 h-3" /> Archivada`.
2. **`HistoryTab.jsx`:**
   * Reemplazar `🫘 {entry.bean_name}` por `<CoffeeBeanIcon className="w-3.5 h-3.5 inline-block text-amber-800 dark:text-amber-400" /> {entry.bean_name}`.
3. **`ImportBeanConfirmationModal.jsx`:**
   * Reemplazar los emojis de los metadatos del grano (`🫘`, `📍`, `🏡`, `🧑‍🌾`, `🔥`, `🌱`, `🌾`, `🏆`) por sus respectivos componentes de `SvgIcons.jsx` (`CoffeeBeanIcon`, `MapPinIcon`, `HomeIcon`, `UserIcon`, `FireIcon`, `PlantIcon`, `CalendarIcon`, `TrophyIcon`).
4. **`RecipeSummaryModal.jsx`:**
   * Reemplazar `📥 Agregar a Mis Recetas` por `<ArrowDownTrayIcon className="w-4 h-4" /> Agregar a Mis Recetas`.
   * Reemplazar `✓ En tu catálogo` por `<CheckIcon className="w-3.5 h-3.5" /> En tu catálogo`.
5. **`RecipeFormModal.jsx`:**
   * Reemplazar `⚖️ Ratio` por `<ScaleIcon className="w-3 h-3" /> Ratio`.

#### D. Extensión de la Fase 2 (clases y emojis adicionales detectados)
1. **`RecipeLibraryTab.jsx`:**
   * Reemplazar `📖 Biblioteca Pública` por `<BookOpenIcon /> Biblioteca Pública`.
   * Reemplazar `⚡` del banner offline por `<BoltIcon />`.
   * Reemplazar `🌐 Todos` por `<GlobeIcon /> Todos`.
   * Reemplazar `✓ En tu catálogo` por `<CheckIcon className="w-3 h-3" /> En tu catálogo`.
2. **`StepFormModal.jsx`:**
   * Reemplazar `⚡` del header por `<BoltIcon />`.
   * Reemplazar `✓ Guardar Cambios en Paso` por `<CheckIcon /> Guardar Cambios en Paso`.
3. **`App.jsx`:**
   * Reemplazar `← Volver al listado` por `<ArrowLeftIcon /> Volver al listado`.

> **Emojis/Símbolos preservados intencionalmente (decisión de diseño):**
> * `★`/`☆` en `HistoryTab.jsx`: son glifos de **calificación de estrellas** (rating 1–5), un patrón legítimo y funcional, no un emoji decorativo de interfaz.
> * `☕` en `AboutModal.jsx`: es **branding** ("Hecho con ☕"), no un icono de acción/etiqueta de interfaz.

---

## 5. 🧪 Punto 9: Aislamiento de la Suite de Pruebas en `vitest.config.js`

### 5.1. Diagnóstico del Problema
En `vitest.config.js`, la sección `test:` no tiene directivas `include` ni `exclude` explícitas para las suites de prueba (solo para coverage). Por ende, Vitest escanea recursivamente todo el directorio raíz del repositorio.

Cuando existen worktrees (por ejemplo, carpetas de agentes o ramas auxiliares como `.kilo/worktrees/...`, `work/` o compilaciones en `dist/`), Vitest ejecuta los archivos de prueba de esas carpetas en simultáneo, provocando:
* Duplicación del tiempo de ejecución de las pruebas.
* Fallos esporádicos por colisiones en puertos o mocks globales en jsdom.
* Ruido en reportes locales de cobertura.

### 5.2. Solución en `vitest.config.js`
Añadir configuración explícita bajo `test:`:

```javascript
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './__tests__/setup.js',
  include: ['__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.kilo/**',
    '**/work/**',
    '**/.git/**'
  ],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    include: ['src/**/*.jsx', 'src/**/*.js'],
    exclude: ['src/main.jsx', 'src/App.css', 'src/index.css'],
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    }
  }
}
```

---

## 6. 📂 Archivos Afectados

| Archivo | Tipo de Cambio | Propósito |
| :--- | :--- | :--- |
| `index.html` | Modificación | `lang="es"` y `<meta name="theme-color">` |
| `vite.config.js` | Modificación | `theme_color` / `background_color` PWA y exclusiones en `vitest` |
| `twa-manifest.json` | Modificación | Sincronización de colores TWA para Android |
| `src/components/modals/ConfirmModal.jsx` | Creación | Componente reutilizable para modales de confirmación |
| `src/components/icons/SvgIcons.jsx` | Modificación | Incorporación de `BookOpenIcon`, `GlobeIcon`, `ScaleIcon`, `ArrowDownTrayIcon`, `BoltIcon`, `CheckIcon`, `ArrowLeftIcon` |
| `src/App.jsx` | Refactorización | Reemplazo de los 4 modales repetidos por `ConfirmModal` y `←` por `ArrowLeftIcon` |
| `src/components/tabs/RecipesTab.jsx` | Modificación | Reemplazo de emojis por SVG |
| `src/components/tabs/RecipeLibraryTab.jsx` | Modificación | Reemplazo de emojis (`📖`, `🌐`, `⚡`, `✓`) por componentes SVG |
| `src/components/tabs/HistoryTab.jsx` | Modificación | Reemplazo de emojis por SVG y corrección de `text-amber-805` |
| `src/components/modals/RecipeFormModal.jsx` | Modificación | Corrección de `text-amber-805` y reemplazo de emoji de báscula |
| `src/components/modals/RecipeSummaryModal.jsx` | Modificación | Reemplazo de emojis (`📥`, `✓`), corrección de `border-emerald-250` |
| `src/components/modals/StepFormModal.jsx` | Modificación | Reemplazo de emojis (`⚡`, `✓`) por componentes SVG |
| `src/components/modals/BeanFormModal.jsx` | Modificación | Corrección de clase inválida `text-slate-405` |
| `src/components/ImportBeanConfirmationModal.jsx` | Modificación | Reemplazo de 8 emojis de ficha de grano por componentes SVG y corrección de `border-amber-250` |
| `__tests__/ConfirmModal.test.jsx` | Creación | Suite de pruebas unitarias para `ConfirmModal` |

---

## 7. ✅ Criterios de Aceptación y Validación

1. **Identidad Visual:**
   * La PWA en modo claro y oscuro expone la paleta ámbar y pizarra en `index.html`, `manifest.webmanifest` y `twa-manifest.json`.
   * El atributo `lang` en `index.html` es `es`.
   * **Despliegue TWA (operacional):** el proyecto Android (`app/`, gitignored) embebe `app/src/main/res/raw/web_app_manifest.json`, generado por Bubblewrap desde el manifiesto **publicado**. Tras redesplegar el sitio con los nuevos colores, debe reejecutarse `npx @bubblewrap/cli update` para que la app Android refleje `theme_color`/`background_color` e idioma actualizados (el artefacto local aún contendrá los valores previos hasta entonces).
2. **Componente `ConfirmModal`:**
   * Cobertura de pruebas unitarias al 100% (statements, branches, functions y lines) para `ConfirmModal.jsx`.
   * Los 4 flujos de confirmación en `App.jsx` (borrar grano, borrar receta, borrar historial y vaciar historial) funcionan exactamente igual que antes, sin regresiones visuales ni de comportamiento.
   * El modal gestiona el foco (foco inicial en Cancelar, restauración al cerrar, focus trap con Tab/Shift+Tab) y bloquea el scroll del `body` mientras está abierto.
3. **Consistencia Visual (Iconos y Tailwind):**
   * Cero clases de color Tailwind con sufijo numérico no estándar (`805`, `250`, `405`) en todo el proyecto (`grep` de sufijos de color solo arroja la escala 50–950).
   * Cero emojis de interfaz en botones, chips, cabeceras y badges. Se preservan únicamente `★`/`☆` (rating en `HistoryTab`) y `☕` (branding en `AboutModal`) como decisión de diseño documentada.
4. **Testing y Calidad:**
   * `npm test` ejecuta exclusivamente las pruebas de `__tests__/`.
   * `npm run lint` pasa con 0 errores y 0 advertencias.
   * Cobertura global de pruebas se mantiene por encima del umbral del 80%.
   * `npm audit --omit=dev --audit-level=high` reporta 0 vulnerabilidades.

