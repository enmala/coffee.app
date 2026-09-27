# 🛠️ Plan de Implementación: Calculadora Dinámica de Ratios

**Proyecto:** Barista Timer PWA  
**Feature:** Calculadora Dinámica de Ratios y Escalado de Recetas  
**Especificación:** [`specs/calculadora-dinamica-ratios/spec.md`](file:///home/enmala/coffee.app/specs/calculadora-dinamica-ratios/spec.md)  
**Versión Objetivo:** `1.17.0`  

---

## 1. 🌿 Gestión de Ramas y Flujo Git

1. **Sincronización:** Asegurar sincronización de `main` con el repositorio remoto (`git fetch origin`, `git pull origin main`).
2. **Creación de rama:** Crear y cambiar a la rama de corta duración:
   ```bash
   git checkout -b feat/dynamic-ratio-calculator
   ```
3. **Flujo de trabajo:**
   * Todos los commits seguirán el estándar de **Conventional Commits** (`feat: ...`, `test: ...`, `docs: ...`, `chore: ...`).
   * No retornar a la rama `main` hasta que la PR haya sido creada, revisada y aprobada.

---

## 2. 🧩 Cambios Propuestos por Módulo

### 2.1. Utilidades de Negocio y Cálculo Barista
* **Archivo:** [`src/utils/coffeeUtils.jsx`](file:///home/enmala/coffee.app/src/utils/coffeeUtils.jsx)
* **Acciones:**
  * Implementar función pura `scaleRecipe(recipe, targetCoffeeG)`:
    * Calcula el factor $S = \text{targetCoffeeG} / \text{originalRecipe.coffee\_g}$.
    * Escala el agua total y el agua de cada paso (`water_g`).
    * Preserva pasos con `water_g === 0` (pasos manuales o de agitación).
    * Corrige cualquier discrepancia de redondeo en el último paso con agua para que la suma exacta de pasos coincida con el agua total calculada.
    * Retorna un nuevo objeto inmutable con la receta escalada.
  * Implementar función `getGrindAdjustmentSuggestion(originalCoffeeG, targetCoffeeG)`:
    * Calcula la variación porcentual $\Delta = \frac{C_{\text{nuevo}} - C_{\text{orig}}}{C_{\text{orig}}}$.
    * Retorna `null` si $|\Delta| < 0.15$.
    * Retorna objeto descriptivo `{ type: 'warning' | 'info', message: string, deltaPercent: number }` para aumentos o disminuciones significativas.

---

### 2.2. Iconografía Reutilizable
* **Archivo:** [`src/components/icons/SvgIcons.jsx`](file:///home/enmala/coffee.app/src/components/icons/SvgIcons.jsx)
* **Acciones:**
  * Incorporar componentes SVG consistentes:
    * `SparklesIcon` o `LightBulbIcon` para las sugerencias baristas.
    * `ArrowPathIcon` o `ResetIcon` para el botón de restablecer dosis original.

---

### 2.3. Interfaz de Usuario y Vista de Resumen
* **Archivo:** [`src/components/modals/RecipeSummaryModal.jsx`](file:///home/enmala/coffee.app/src/components/modals/RecipeSummaryModal.jsx)
* **Acciones:**
  * Añadir estado local `customCoffeeG` inicializado en `summaryRecipe.coffee_g` y sincronizado mediante el patrón canónico de **State-during-render** ante cambios de `summaryRecipe.id` o `summaryRecipe.coffee_g` (evitando renders en cascada y cumpliendo con la regla `react-hooks/set-state-in-effect` de React 19).
  * Integrar `useMemo` para computar `scaledRecipe` y la sugerencia de molienda en tiempo real.
  * Rediseñar la sección de Parámetros Físicos:
    * Stepper interactivo (`-` / `+`) con input numérico directo (rango 5g a 100g).
    * Botón de reseteo rápido al valor original cuando difiera de `summaryRecipe.coffee_g`.
    * Visualización del agua total recalculada y el agua original de referencia.
  * Renderizar el banner animado de sugerencia barista sobre la molienda cuando proceda.
  * Conectar la lista de pasos para que renderice los gramos de agua escalados (`step.water_g`).
  * Actualizar el botón de acción `"Iniciar Timer"` para despachar `onStartTimer(scaledRecipe)`.

---

### 2.4. Flujo de Navegación y Cronómetro
* **Archivo:** [`src/hooks/useNavigation.js`](file:///home/enmala/coffee.app/src/hooks/useNavigation.js)
* **Acciones:**
  * Verificar que `handleStartTimerFromSummary(recipe)` reciba y conserve la instancia de `scaledRecipe` en `activeRecipe`, en lugar de buscar la receta por `id` en el catálogo local y sobreescribir la dosis personalizada.
* **Archivo:** [`src/components/TimerComponent.jsx`](file:///home/enmala/coffee.app/src/components/TimerComponent.jsx)
  * Comprobar que la vista del temporizador reciba correctamente `scaledRecipe` y que al llamar a `onComplete` registre en el historial la dosis y agua reales preparadas.

---

## 3. 🧪 Plan de Pruebas y Validación (Vitest)

* **Pruebas unitarias de utilidades:** [`__tests__/coffeeUtils.test.jsx`](file:///home/enmala/coffee.app/__tests__/coffeeUtils.test.jsx)
  1. Escalado proporcional exacto con diferentes factores (ej. $15\text{g} \rightarrow 30\text{g}$, $20\text{g} \rightarrow 15\text{g}$).
  2. Preservación de pasos en 0g (sin agua).
  3. Corrección de redondeos en el último paso para evitar sumas descuadradas.
  4. Evaluación de umbrales en `getGrindAdjustmentSuggestion` (sin alerta en $\pm 10\%$, sugerencia moderada en $+20\%$, sugerencia fuerte en $+50\%$, sugerencia de molienda fina en $-20\%$).
* **Pruebas de componentes e integración:** [`__tests__/dynamicRatioCalculator.test.jsx`](file:///home/enmala/coffee.app/__tests__/dynamicRatioCalculator.test.jsx)
  1. Renderizado de dosis inicial igual a la receta.
  2. Modificación mediante botones stepper (`-` y `+`).
  3. Modificación mediante input de texto directo.
  4. Aparición y desaparición del botón Reset; restauración correcta del valor original.
  5. Aparición del banner de molienda al superar $\pm 15\%$.
  6. Envío de `scaledRecipe` al pulsar "Iniciar Timer".
* **Validación de calidad:**
  * `npm test` (100% pruebas pasando con cobertura $\ge 80\%$).
  * `npm run lint` (0 errores y 0 warnings).
  * `npm audit --audit-level=high` (0 vulnerabilidades).

---

## 4. 📦 Versionamiento y Documentación

1. **Actualizar [`package.json`](file:///home/enmala/coffee.app/package.json):** Incrementar versión de `1.16.0` a `1.17.0`.
2. **Actualizar [`BACKLOG.md`](file:///home/enmala/coffee.app/BACKLOG.md):**
   * Mover la tarea "Calculadora Dinámica de Ratios" de `⏳ Pendiente` a `✅ Completado` (versión `v1.17.0`).
3. **Actualización TWA con Bubblewrap:**
   ```bash
   npx @bubblewrap/cli update --appVersionName="1.17.0"
   ```
