# Reglas de Desarrollo y Buenas Prácticas

## Manejo de Archivos JSX y Extensiones en Vite
* **Extensión de Archivos:** Todo archivo que contenga sintaxis JSX (incluyendo iconos SVG inline representados como componentes React) **debe** tener la extensión `.jsx`. Evitar el uso de `.js` para módulos que retornen o manejen JSX para prevenir fallos de compilación durante el bundle de producción.
* **Limpieza de Importaciones (Linting):** Antes de finalizar una refactorización o commit, validar que no queden importaciones sin usar (`no-unused-vars`), ya que el proyecto tiene configurado el linter de manera estricta y fallará al compilar en producción si existen advertencias activas.
