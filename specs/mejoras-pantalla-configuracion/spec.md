# 📋 Especificación Funcional y de UI/UX: Mejoras en la Pantalla de Configuración

**Proyecto:** Barista Timer PWA
**Feature:** Rediseño compacto y accesible de Configuración
**Estado:** Aprobado e Implementado
**Versión Objetivo:** `1.20.4`

---

## 1. 🎯 Objetivo y Declaración del Problema

### 1.1. Problema

La pantalla de Configuración concentra todas sus opciones en un único contenedor desplazable. En dispositivos móviles, cada preferencia se presenta como una tarjeta independiente con título, descripción, padding, borde y control, lo que produce:

- exceso de información visible simultáneamente;
- necesidad de desplazamiento para alcanzar las opciones de importación;
- separación del usuario respecto de las acciones críticas;
- desplazamiento también del encabezado y del botón de cierre;
- redundancia del enlace “Acerca de”, disponible desde el encabezado principal;
- controles activado/desactivado que ocupan más espacio del necesario.

En una verificación con viewport de `390 × 667 px`, el bloque **Importar Datos** aparece cerca del límite inferior y el botón final **Cerrar** queda fuera del viewport.

### 1.2. Objetivo

Rediseñar la pantalla para que:

1. El encabezado y el cierre sean visibles siempre.
2. Las opciones de importación estén entre las primeras acciones accesibles.
3. Las preferencias puedan recorrerse y modificarse sin tarjetas repetitivas.
4. Sólo el cuerpo de preferencias tenga desplazamiento cuando sea necesario.
5. La pantalla conserve todas las funcionalidades actuales.
6. La experiencia sea accesible mediante teclado y tecnologías de asistencia.
7. La estructura pueda incorporar más adelante las opciones de copia de seguridad completa.

### 1.3. Resultado esperado

En un viewport móvil típico, el usuario debe identificar inmediatamente:

- el título de la pantalla;
- cómo cerrarla;
- dónde importar una receta o un grano;
- las preferencias principales.

El usuario no deberá desplazarse para cerrar la pantalla ni para encontrar las acciones de importación.

---

## 2. 📦 Alcance

### 2.1. Incluido

- Reorganización visual del modal de configuración.
- Cabecera fija y cuerpo desplazable independiente.
- Botones o área de importación siempre visibles.
- Conversión de ajustes binarios a switches.
- Compactación de títulos, descripciones y espaciado.
- Agrupación de preferencias por contexto.
- Eliminación del acceso redundante a “Acerca de”.
- Modal adaptado a viewport móvil y escritorio.
- Mejoras de accesibilidad del diálogo y de sus controles.
- Actualización de pruebas relacionadas con Configuración.

### 2.2. Excluido

- Añadir nuevas preferencias.
- Modificar la lógica de importación de archivos o portapapeles.
- Cambiar el formato o validación de datos JSON.
- Implementar exportación o copia de seguridad completa.
- Reemplazar `localStorage` por almacenamiento remoto.
- Modificar la navegación principal o el contenido del modal “Acerca de”.
- Cambiar la persistencia actual de las preferencias.

---

## 3. 🧭 Jerarquía y Estructura Propuesta

### 3.1. Zonas del modal

El modal se dividirá en las siguientes zonas:

```text
┌────────────────────────────────────────────┐
│ Configuración                         [×] │  Cabecera fija
│ Personaliza tu experiencia                │
├────────────────────────────────────────────┤
│ IMPORTAR                                   │
│ [ Archivo JSON ]  [ Portapapeles ]         │  Acción prioritaria
├────────────────────────────────────────────┤
│ PREPARACIÓN                                │  Cuerpo desplazable
│ Modo manos libres                 [switch] │
│ Alertas de sonido                 [switch] │
│ Vibración háptica                 [switch] │
│   Duración                         [Normal]│
│                                            │
│ APLICACIÓN                                 │
│ Tema visual                    [Claro/Oscuro]│
└────────────────────────────────────────────┘
```

### 3.2. Cabecera fija

La cabecera:

- permanecerá visible mientras se desplaza el cuerpo;
- mostrará el título “Configuración”;
- podrá conservar el subtítulo actual con un tamaño compacto;
- incluirá un único botón de cierre en la esquina superior derecha;
- tendrá un área táctil mínima de `44 × 44 px`;
- no requiere un botón inferior adicional llamado “Cerrar”.

### 3.3. Acciones de importación

Las acciones de importación se ubicarán inmediatamente después de la cabecera.

- Etiqueta de sección: `Importar recetas o granos`.
- Acción primaria: `Archivo JSON`.
- Acción secundaria equivalente: `Portapapeles`.
- Ambas acciones permanecerán visibles aunque el cuerpo de preferencias haga scroll.
- Se conservarán los handlers existentes:
  - `onUnifiedImportJson`;
  - `onImportFromClipboard`.
- No se cambia la detección automática del tipo de entidad importada.

Si la altura disponible es muy reducida, la sección de importación pasará a formar parte de la zona fija superior; no se colocará al final del contenido.

### 3.4. Cuerpo desplazable

Solo el área de preferencias podrá desplazarse:

```css
contenedor del modal: flex, overflow: hidden
cabecera: flex-shrink: 0
importación: flex-shrink: 0
cuerpo: flex: 1, min-height: 0, overflow-y: auto
```

No se usará `overflow-y-auto` sobre todo el modal.

El desplazamiento será vertical y respetará gestos táctiles. No deberán existir dos contenedores de scroll anidados salvo que una necesidad futura lo justifique.

### 3.5. Agrupación

#### Preparación

1. Modo manos libres.
2. Alertas de sonido.
3. Vibración háptica.
4. Duración de vibración, visible solamente cuando la vibración está activa.

#### Aplicación

1. Tema visual.

La agrupación debe mostrarse con encabezados de sección discretos. Las futuras opciones de respaldo o sincronización se incorporarán en una tercera sección llamada `Datos`.

---

## 4. 🎨 Especificación Visual

### 4.1. Lista de preferencias

Las preferencias dejarán de presentarse como tarjetas individuales con borde completo.

Se utilizará una lista compacta:

- fondo común;
- filas con separador sutil;
- título en una sola línea cuando sea posible;
- control alineado a la derecha;
- descripción únicamente cuando aporte información necesaria;
- padding vertical reducido, manteniendo una altura táctil suficiente.

Diseño de referencia:

```text
Modo manos libres
Narración de pasos mientras corre el timer [●────]
──────────────────────────────────────────────────
Alertas de sonido                           [────●]
```

### 4.2. Descripciones

- Se conserva una descripción corta para **Modo manos libres**, porque no es evidente a partir del nombre que narra los pasos del temporizador.
- Las descripciones de **Alertas de sonido**, **Vibración háptica** y **Tema visual** pueden eliminarse si el título comunica suficientemente la acción.
- La sección `Duración` tendrá etiqueta visible sólo mientras la vibración esté habilitada.

### 4.3. Switches

Los estados binarios usarán un control de switch consistente:

- `Desactivado`: fondo neutro y perilla al inicio.
- `Activado`: acento ámbar y perilla al final.
- `:focus-visible`: anillo de foco visible.
- Estados y transiciones compatibles con modo claro y oscuro.

No se mostrará texto `Activado` o `Desactivado` dentro de cada fila. El estado debe comunicarse visualmente y mediante `aria-checked`.

### 4.4. Tema visual

El control existente de tema puede conservar:

- botón compacto con el destino de cambio, por ejemplo `Oscuro` desde tema claro;
- icono de sol o luna;
- persistencia y handler actuales.

No se introduce un tercer modo `Sistema` en este alcance.

### 4.5. Duración de vibración

- Se mantiene el selector con valores `Corta`, `Normal` y `Larga`.
- Se muestra únicamente cuando `vibrationEnabled` es verdadero.
- Al desactivar vibración, el selector desaparece sin afectar el valor guardado.
- El rediseño no cambia los patrones ni la lógica de vibración.

### 4.6. Responsividad

#### Móvil

- El modal se presenta como bottom sheet.
- Esquinas superiores redondeadas.
- Ancho completo con un margen lateral reducido cuando corresponda.
- Altura máxima limitada por la ventana visible.
- Zona de cabecera e importación fija.
- Cuerpo desplazable.

#### Escritorio y tablet

- El modal permanece centrado.
- Se conserva un ancho máximo compacto, coherente con el diseño actual.
- No debe ampliarse innecesariamente sólo para absorber contenido.
- Las mismas zonas y prioridades se mantienen.

---

## 5. ♿ Accesibilidad

El rediseño debe considerar las siguientes reglas:

1. El contenedor tendrá:
   - `role="dialog"`;
   - `aria-modal="true"`;
   - `aria-labelledby` vinculado al título;
   - opcionalmente `aria-describedby` para el subtítulo.
2. El botón superior tendrá:
   - `aria-label="Cerrar configuración"`;
   - `title="Cerrar configuración"`;
   - área táctil mínima de `44 × 44 px`.
3. El foco se trasladará a un elemento dentro del diálogo al abrirlo.
4. La navegación por teclado quedará contenida dentro del diálogo.
5. Al cerrar, el foco volverá al botón de Configuración que abrió el modal.
6. `Escape` cerrará el diálogo.
7. Los switches usarán:
   - `role="switch"`;
   - `aria-checked`;
   - una etiqueta accesible asociada al nombre visible.
8. El input oculto para importar archivos seguirá siendo activable mediante teclado desde su etiqueta visible.
9. Los iconos decorativos tendrán `aria-hidden="true"`.
10. El orden visual y de tabulación coincidirá:
    - cerrar;
    - importar desde archivo;
    - importar desde portapapeles;
    - preferencias.
11. El scroll del documento de fondo quedará bloqueado mientras el modal esté abierto.
12. El contraste de textos, bordes y estados activos cumplirá WCAG AA en ambos temas.

---

## 6. 🔄 Comportamiento Funcional

### 6.1. Abrir y cerrar

- Abrir Configuración no altera los valores de preferencias.
- El botón `×`, la tecla `Escape` y cualquier flujo existente de navegación atrás cierran el modal.
- Cerrar no revierte cambios, porque las preferencias continúan con su persistencia inmediata actual.
- El botón inferior “Cerrar” se elimina del DOM.

### 6.2. Cambios de preferencia

- Cada switch continúa invocando únicamente a su setter actual.
- No se añade confirmación ni botón global de “Guardar”.
- El control reacciona visualmente de inmediato.
- Los valores persisten con el mismo mecanismo existente.

### 6.3. Importación

- “Archivo JSON” mantiene el selector de archivos con `accept=".json"`.
- “Portapapeles” mantiene la llamada actual de lectura.
- Después de iniciar una importación, se conserva el comportamiento actual de cierre, confirmación y notificaciones.
- Si la importación requiere un modal secundario, la carga del nuevo contenido no debe provocar saltos ni scroll inesperado.

### 6.4. Acerca de

- El bloque “Acerca de la aplicación” se retira de Configuración.
- El enlace existente en el encabezado principal sigue operativo.
- No se modifica el modal `AboutModal`.

---

## 7. 🧩 Impacto Técnico Previsto

La implementación principal debería concentrarse en:

- `src/components/modals/SettingsModal.jsx`.

Podrían requerirse ajustes menores en:

- `src/App.jsx`, si se incorporan propiedades de gestión de foco o cierre;
- `src/hooks/useNavigation.js`, si se refuerza el comportamiento de `Escape` o la restauración de foco;
- `__tests__`, para cubrir la nueva estructura, accesibilidad y comportamiento responsive;
- `src/components/icons/SvgIcons.jsx`, sólo si se necesita un icono reutilizable nuevo.

No se esperan cambios en hooks de persistencia de preferencias, importación de JSON o temporizador.

---

## 8. 🧪 Criterios de Aceptación

```gherkin
Escenario: Cierre visible en pantalla pequeña
  Dado un viewport móvil de 390 × 667 px
  Cuando se abre Configuración
  Entonces el botón para cerrar está visible sin desplazar el contenido
  Y permanece visible al desplazar el cuerpo del modal

Escenario: Importación visible sin scroll
  Dado un viewport móvil de 390 × 667 px
  Cuando se abre Configuración
  Entonces "Archivo JSON" y "Portapapeles" están visibles sin desplazamiento
  Y ambas acciones preceden a las preferencias

Escenario: Sólo el cuerpo se desplaza
  Dado que el contenido excede la altura disponible
  Cuando el usuario desplaza dentro del modal
  Entonces sólo cambia la posición del cuerpo de preferencias
  Y la cabecera y la sección de importación permanecen fijas

Escenario: Preferencias compactadas
  Cuando se abre Configuración
  Entonces manos libres, sonido y vibración aparecen como switches
  Y no se muestran botones con los textos "Activado" o "Desactivado"

Escenario: Duración de vibración condicional
  Dado que la vibración está activada
  Cuando se abre Configuración
  Entonces se muestra el selector de duración
  Cuando se desactiva la vibración
  Entonces el selector desaparece
  Y el valor seleccionado se conserva

Escenario: Tema visual
  Dado que el tema actual es claro
  Cuando se hace clic en el control de tema
  Entonces se activa el tema oscuro mediante el setter existente
  Y el control muestra la acción inversa

Escenario: Sin acceso redundante a Acerca de
  Cuando se abre Configuración
  Entonces no contiene el enlace "Acerca de la aplicación"
  Y el botón "Acerca de" del encabezado principal sigue existiendo

Escenario: Cierre con Escape
  Dado que Configuración está abierta y tiene el foco
  Cuando se pulsa Escape
  Entonces se cierra Configuración
  Y el foco vuelve al botón que abrió el diálogo

Escenario: Foco contenido en el diálogo
  Dado que Configuración está abierta
  Cuando se navega repetidamente con Tab
  Entonces el foco permanece dentro del diálogo
  Y no alcanza controles de la página de fondo

Escenario: Semántica de switches
  Dado un lector de pantalla
  Cuando inspecciona una preferencia binaria
  Entonces la identifica como switch
  Y anuncia su estado mediante aria-checked

Escenario: Importación mantiene compatibilidad
  Cuando el usuario selecciona un archivo JSON o usa el portapapeles
  Entonces se ejecutan los mismos handlers de importación existentes
  Y el comportamiento de validación y confirmación no cambia
```

---

## 9. 🔬 Pruebas Recomendadas

### 9.1. Pruebas de comportamiento

- apertura y cierre;
- cierre con botón superior;
- cierre con `Escape`;
- switch de manos libres;
- switch de sonido;
- switch de vibración;
- aparición y ocultación del selector de duración;
- cambio de duración;
- cambio de tema;
- importación desde archivo;
- importación desde portapapeles;
- ausencia del bloque “Acerca de”.

### 9.2. Pruebas de estructura

- existencia de un contenedor de diálogo accesible;
- cabecera fuera del área desplazable;
- importación antes de las preferencias;
- cuerpo con overflow propio;
- ausencia del botón inferior “Cerrar”.

### 9.3. Pruebas de accesibilidad

- nombre accesible del diálogo;
- nombre accesible del botón de cierre;
- estado `aria-checked` de los switches;
- gestión de foco al abrir y al cerrar;
- retención de foco con tabulación circular;
- cierre mediante teclado.

### 9.4. Validación visual

Comprobar manualmente:

- 390 × 667 px;
- 360 × 640 px;
- viewport corto en paisaje;
- tablet o escritorio;
- tema claro;
- tema oscuro;
- vibración activada y desactivada.

---

## 10. 🚦 Riesgos y Mitigaciones

| Riesgo | Mitigación |
|---|---|
| La zona fija ocupa demasiado espacio en pantallas bajas | Mantener importación compacta y permitir que sólo el cuerpo reduzca su altura |
| El switch pierde claridad sin texto `Activado/Desactivado` | Mantener contraste de estado, perilla posicionada y `aria-checked` |
| Se dificulta el selector de archivo accesible con teclado | Usar una etiqueta vinculada al input, no un `div` o span interactivo |
| Se rompe el cierre por History API | Reutilizar `closeSettings`; la UI no debe crear una ruta de cierre alternativa |
| El modal secundario de importación entra en conflicto | Mantener la coordinación actual de navegación y modales |
| El foco vuelve a un elemento incorrecto | Capturar el elemento activo al abrir y restaurarlo al cerrar |

---

## 11. ✅ Definición de Terminado

La mejora se considerará completada cuando:

- las acciones de importación sean visibles sin scroll en los viewports objetivo;
- el botón de cierre permanezca visible durante el scroll;
- no exista un botón final redundante de cierre;
- el contenido desplazable sea únicamente el cuerpo;
- los tres ajustes binarios sean switches accesibles;
- la duración sólo aparezca con vibración activa;
- “Acerca de” haya sido retirado sin desaparecer de la aplicación;
- navegación con teclado, foco y `Escape` funcionen correctamente;
- modo claro y oscuro conserven legibilidad;
- las pruebas automatizadas relevantes pasen;
- `npm run lint` no reporte errores;
- `npm audit --omit=dev --audit-level=high` no reporte vulnerabilidades altas;
- la versión se incremente al implementar el cambio conforme a SemVer.
