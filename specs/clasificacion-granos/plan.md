# Plan de implementación: Clasificación personal de granos

Especificación: [spec.md](./spec.md)

## 1. Modelo y serialización

- Añadir `rating` con valor inicial `0` al estado de `useBeans`.
- Normalizar la puntuación al cargar, guardar, editar e importar granos.
- Ampliar el formato comprimido de compartición y la decodificación retrocompatible.

## 2. Interfaz

- Añadir selector de estrellas y opción para quitar la puntuación en `BeanFormModal`.
- Mostrar la valoración en `BeansTab` y `ImportBeanConfirmationModal`.
- Añadir controles de filtro y orden en `BeansTab` sin perder la búsqueda textual.
- Compactar buscador, filtro y orden en una única barra y añadir un diálogo de valoración rápida desde la tarjeta.

## 3. Pruebas

- Extender pruebas de granos para el flujo completo de creación, edición, importación y visualización.
- Extender pruebas de `coffeeUtils` para verificar la serialización.
- Añadir casos de filtro, orden y datos legacy sin valoración.
- Cubrir el cambio de valoración desde la tarjeta sin abrir el formulario completo.

## 4. Integración y documentación

- Mover la entrada correspondiente de Pendiente a Completado.
- Actualizar `package.json` a `1.21.0`.
- Ejecutar Bubblewrap para propagar `appVersionName`.
- Verificar `npm test`, `npm run lint` y `npm audit --omit=dev --audit-level=high`.

## 5. Entrega

- Revisar el diff completo y mantener los cambios solo en esta funcionalidad.
- No volver a `main`; dejar la rama corta lista para PR.
