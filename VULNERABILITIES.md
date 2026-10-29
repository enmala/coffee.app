# Registro de Vulnerabilidades de Dependencias

Este documento registra las vulnerabilidades reportadas por `npm audit` en el entorno de desarrollo. Conforme a las reglas del repositorio, el pipeline de verificación y control de calidad ejecuta `npm audit --omit=dev --audit-level=high`, el cual reporta **0 vulnerabilidades** en las dependencias de producción de la aplicación.

Las vulnerabilidades detalladas a continuación corresponden exclusivamente a dependencias de desarrollo y construcción (`devDependencies` / herramientas de build local) que no pueden ser actualizadas automáticamente sin romper la compatibilidad o violar la antigüedad mínima en `.npmrc` (`min-release-age=3`).

---

## Vulnerabilidades Detectadas

### 1. `vite` (8.0.0 - 8.1.5)
- **Severidad:** Alta
- **Advisories:**
  - GHSA-698v-4r3x-3vcv (launch-editor command escaping en Windows)
  - GHSA-r825-w8mm-5pxw (launch-editor flag misinterpretation)
  - GHSA-587h-7wmj-h5pm (launch-editor existence check)
  - GHSA-9jrq-w75r-8gcw (Vite cross-origin script execution)
  - GHSA-rq7h-c2jc-7f22 (Vite server.fs.allow path matching)
- **Motivo de no resolución inmediata:** La actualización a versiones superiores (`>=8.3.x`) requiere dependencias transitivas con releases recientes que entran en conflicto con la política de antigüedad de paquetes (`min-release-age=3`).
- **Impacto en Barista Timer:** Nulo en producción. Afecta exclusivamente al servidor de desarrollo local de Vite (`npm run dev`) y no al bundle estático distribuido a clientes/PWA.

---

### 2. `deepmerge` / `vite-plugin-pwa` / `workbox-build`
- **Severidad:** Moderada / Alta
- **Advisories:**
  - GHSA-gcqx-w48m-w2h4 (`deepmerge` mergeObject prototype poisoning)
- **Motivo de no resolución inmediata:** La resolución forzada (`npm audit fix --force`) degradaría `vite-plugin-pwa` a la versión `0.2.1` (versión incompatible con Vite 8/React 19), rompiendo la generación del Service Worker y las capacidades offline de la PWA.
- **Impacto en Barista Timer:** Nulo. Es una dependencia de compilación/empaquetado en tiempo de build de Workbox, sin exposición en runtime a entradas no confiables.

---

### 3. `brace-expansion`, `source-map-js`, `undici`, `zod`
- **Severidad:** Alta / Moderada
- **Advisories:**
  - `brace-expansion`: GHSA-q2hr-2g5m-vwhr, GHSA-qhr7-859c-m2p7, GHSA-6j4f-fj2g-mc7p (DoS por recursión)
  - `source-map-js`: GHSA-68fv-2mgg-jv7q (DoS en source-map offsets)
  - `undici`: GHSA-3wwx-pv8p-q78v y relacionados (DoS/caching en cliente HTTP)
  - `zod`: GHSA-mrhx-c7xc-m3w5 (validación de colecciones constrained)
- **Motivo de no resolución inmediata:** Dependencias indirectas de desarrollo/build. Las versiones fijadas requieren sincronización con el ciclo de vida de los paquetes raíz respetando `min-release-age=3`.
- **Impacto en Barista Timer:** Mínimo/Inexistente. La app es una PWA cliente pura que opera sobre `localStorage` y no procesa entradas remotas no sanitizadas con estas bibliotecas.
