# Especificación: Clasificación personal de granos con estrellas

## Objetivo

Permitir que cada grano tenga una valoración personal opcional de 1 a 5 estrellas, independiente de la puntuación SCA y de la puntuación de cada preparación guardada en el historial.

## Requisitos funcionales

1. El formulario de creación y edición ofrece un selector accesible de 1 a 5 estrellas.
2. La puntuación puede quitarse; el valor `0` representa un grano aún sin evaluar.
3. Las tarjetas de granos muestran cinco estrellas y un texto accesible con la puntuación. Los granos sin valorar muestran una indicación discreta.
4. La biblioteca permite:
   - filtrar por valoración exacta;
   - ordenar alfabéticamente o por valoración descendente/ascendente;
   - conservar la búsqueda textual existente.
   - mantener buscador, filtro y orden en una barra compacta.
5. El campo `rating` se persiste en `coffee_beans_v1`.
6. Los granos existentes sin campo de valoración se tratan como `0` sin migración destructiva.
7. El valor debe aceptar únicamente enteros de 0 a 5.
8. La puntuación se mantiene al:
   - importar desde JSON o enlace compartido;
   - descargar o compartir el grano;
   - editar el grano;
   - confirmar una importación.
9. El modal de confirmación de importación muestra la valoración cuando está presente.
10. La valoración puede editarse desde la tarjeta mediante un diálogo compacto, sin abrir el formulario completo.

## Modelo

```json
{
  "rating": 4
}
```

- Tipo: entero.
- Rango: `0..5`.
- Ausencia, `null`, texto inválido o valores fuera de rango: se normalizan a `0`.

## Alcance de UI

- Selector de estrellas en `BeanFormModal`.
- Acciones de filtro y orden sobre el listado de `BeansTab`.
- Estrellas visibles en tarjetas y vista previa de importación.
- Acción rápida y accesible “Editar valoración” desde la tarjeta y el menú contextual.
- Controles de filtro y orden representados con iconos compactos y menús desplegables.
- Botones con `aria-label` y texto accesible para lectores de pantalla.
- Diseño responsive coherente con modo claro/oscuro.

## Pruebas

- Normalización de datos en almacenamiento e importación.
- Creación y edición de valoración.
- Eliminación de valoración.
- Preservación al comprimir y descomprimir enlaces.
- Visualización, filtro exacto y ordenamiento.
- Retrocompatibilidad de granos sin `rating`.

## Fuera de alcance

- Puntuaciones calculadas desde el historial.
- Promedios automáticos.
- Integración con sugerencias o ajustes de recetas.
- Modificación de la puntuación SCA.

## Versión

Versión objetivo: `1.21.0` (feature compatible, incremento menor de SemVer).
