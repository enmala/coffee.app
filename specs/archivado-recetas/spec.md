# 📋 Especificación Funcional y de UI/UX: Sistema de Archivado de Recetas

**Proyecto:** Barista Timer PWA  
**Feature:** Sistema de Archivado de Recetas con Filtros Rápidos (Opción 3 Mejorada)  
**Estado:** Especificación Aprobada / Lista para Implementación  
**Versión:** 1.0.0  

---

## 1. 🎯 Objetivo y Declaración del Problema

### Problema
A medida que el usuario crea, ajusta o importa múltiples recetas para diversos métodos de extracción (V60, Aeropress, Chemex, Origami, etc.), la pantalla principal de recetas experimenta **sobrecarga visual**. Los usuarios desean conservar recetas experimentales, antiguas o estacionales sin que compitan visualmente con sus recetas de uso frecuente.

### Objetivo
Permitir a los usuarios **archivar y desarchivar recetas** fácilmente, estableciendo una vista predeterminada limpia (**"Activas"**) con acceso inmediato a las recetas archivadas (**"Archivadas"**) y a la colección completa (**"Todas"**), garantizando que ninguna receta se pierda y reduciendo la fricción en la rutina diaria.

---

## 2. 🗄️ Modelo de Datos y Compatibilidad

### 2.1. Atributo en el Esquema de Receta
Se extiende la estructura de datos de la receta con la propiedad booleana `is_archived`:

```json
{
  "id": "recipe_1714000000000",
  "name": "V60 4:6 Tetsu Kasuya",
  "method": "V60",
  "coffee_g": 20,
  "grind_size": "Gruesa",
  "water_temp_c": 90,
  "is_favorite": false,
  "is_archived": false,
  "steps": [
    {
      "step_number": 1,
      "title": "Preinfusión",
      "water_g": 60,
      "duration_s": 45,
      "instruction": "Verter en círculos concéntricos"
    }
  ]
}
```

### 2.2. Retrocompatibilidad
* Cualquier receta existente en `localStorage` o importada desde archivos `.json` que no posea la propiedad `is_archived` se evaluará como `false` por defecto (`Boolean(recipe.is_archived)`).
* La exportación e importación JSON preservará el campo `is_archived`.

---

## 3. 🎨 Especificación de Componentes e Interfaz (UI/UX)

### 3.1. Barra de Filtros (Chips de Estado)
Ubicada en la parte superior de `RecipesTab.jsx`, justo debajo del encabezado *"Tus Recetas"*.

```text
┌───────────────────────────────────────────────────────────┐
│ Tus Recetas                       [📖 Biblioteca] [+ Nueva]│
│                                                           │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│ │ ● Activas 14  │ │ 📦 Archivadas 6  │ │   Todas 20    │     │
│ └───────────────┘ └───────────────┘ └───────────────┘     │
└───────────────────────────────────────────────────────────┘
```

#### Comportamiento y Estilos de los Chips:
1. **Estados del Chip:**
   * **Activo / Seleccionado:** Fondo sólido ámbar (`bg-amber-800 text-white dark:bg-amber-700`), tipografía en negrita (`font-bold`), elevación sutil.
   * **Inactivo:** Fondo neutro (`bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700`), borde sutil (`border border-slate-200 dark:border-slate-700`).
> **Nota de implementación:** Los iconos `📦` (Archivo), `📭` (vacío) y `☕` (sin recetas) deben implementarse como **componentes SVG reutilizables** (`ArchiveIcon`, `ArchiveRestoreIcon`, `InboxEmptyIcon`) en `src/components/icons/SvgIcons.jsx`, siguiendo el patrón existente de `TrashIcon`, `ShareIcon`, etc. Consistente con la migración de emojis a SVG documentada en el BACKLOG.
2. **Contadores Dinámicos:**
   * Cada chip muestra el recuento en tiempo real: `Activas (N)`, `Archivadas (N)`, `Todas (N)`.
   * Si `Archivadas` tiene 0 elementos, el chip se mantiene visible para permitir descubrir la función.
3. **Estado Inicial:** `filterMode = 'active'` (Activas) de forma predeterminada al cargar la vista.

---

### 3.2. Tarjetas de Receta (`Recipe Card`)

#### A. Tarjeta Activa (Estado Normal)
* **Visual:** Fondo estándar, borde nítido, botón de inicio rápido `[▶]` con acento ámbar.
* **Menú `•••`:**
  * ✏️ Editar
  * 🔗 Compartir
  * 📋 Duplicar
  * 📦 **Archivar** *(Nueva opción)*
  * 🗑️ Eliminar

#### B. Tarjeta Archivada (en Vistas *"Archivadas"* o *"Todas"*)
* **Visual:**
  * Tratamiento atenuado (`opacity-80 dark:opacity-85`) y borde punteado grisáceo (`border-2 border-dashed border-slate-300 dark:border-slate-600`) para diferenciar de las activas sin perder legibilidad.
  * **Badge identificador:** Chip pequeño en la esquina superior izquierda de la tarjeta:
    `[📦 Archivada]` (`text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium`).
  * Botón de inicio rápido `[▶]` funcional con tono neutro.
* **Menú `•••`:**
  * ✏️ Editar
  * 🔗 Compartir
  * 📋 Duplicar
  * 📂 **Desarchivar** *(Restaura la receta a la vista principal)*
  * 🗑️ Eliminar

---

### 3.3. Modal de Resumen de Receta (`RecipeSummaryModal`)
* Si la receta seleccionada está archivada:
  * Mostrar el badge `[📦 Receta Archivada]` en el encabezado del modal.
  * Añadir en la barra de acciones un botón secundario **`[Desarchivar]`** accesible junto a `[Iniciar Cronómetro]`.

---

### 3.4. Micro-interacción y Notificación con Deshacer (*Undo Toast*)
* Al hacer clic en **"Archivar"**:
  1. La receta desaparece de la vista "Activas".
  2. Se actualizan los contadores de los chips con animación suave (`transition-transform` + `scale-105` por 150ms) para reforzar el feedback visual del cambio.
  3. Se muestra una notificación flotante (toast) inferior:
     > 📦 **"V60 Hoffman 4:6" archivada.** &nbsp;&nbsp; `[Deshacer]`
  4. Si el usuario presiona **Deshacer** (en una ventana de 4 segundos), se restaura el estado anterior inmediatamente sin recargar.

---

### 3.5. Estados Vacíos (*Empty States*)

| Vista | Condición | Mensaje / Acción sugerida |
| :--- | :--- | :--- |
| **Activas** | No hay recetas activas (pero hay archivadas) | 📭 **No tienes recetas activas**<br><span class="text-xs text-slate-400">Tienes {N} recetas en el archivo. Puedes desarchivarlas o crear una nueva.</span><br>`[Ver Archivadas]` `[+ Nueva Receta]` |
| **Archivadas** | 0 recetas archivadas | 📦 **Sin recetas archivadas**<br><span class="text-xs text-slate-400">Archiva las recetas que uses con poca frecuencia desde el menú (•••) para mantener limpia tu pantalla principal.</span> |
| **Todas** | 0 recetas en total | ☕ **No tienes recetas guardadas**<br>`[+ Crear Receta]` `[📖 Explorar Biblioteca]` |

---

## 4. ⚙️ Casos de Borde y Reglas de Negocio

1. **Interacción con Favoritas (⭐):**
   * Una receta puede estar marcada como favorita y archivada al mismo tiempo.
   * En la vista **Activas**, las recetas archivadas no se mostrarán aunque sean favoritas.
   * Al desarchivar una receta que era favorita, recupera su estrella y posición destacada de inmediato.
2. **Ejecución del Cronómetro:**
   * Una receta archivada **se puede ejecutar directamente** si el usuario la consulta desde la pestaña de archivo o el historial, sin obligación de desarchivarla previamente.
3. **Historial de Preparaciones:**
   * Al completar una preparación con una receta archivada, el historial registra la extracción normalmente sin alterar el estado de archivado de la receta.
4. **Eliminación:**
   * Eliminar una receta archivada sigue requiriendo la confirmación modal habitual.
5. **Edición de Receta Archivada:**
   * Al editar y guardar una receta archivada, el estado `is_archived` se **preserva**. La receta permanece archivada después de guardar.
   * Esto es consistente con el comportamiento existente de `is_favorite` (ver BACKLOG v1.7.1).
   * El formulario de edición mostrará un badge sutil `"Editando receta archivada"` en el header del modal para mantener el contexto.

---

## 5. 🧪 Criterios de Aceptación (Test Scenarios)

```gherkin
Escenario: Filtrar por recetas activas (por defecto)
  Dado que el usuario tiene 5 recetas activas y 2 archivadas
  Cuando abre la pestaña "Tus Recetas"
  Entonces ve seleccionado el filtro "Activas"
  Y visualiza únicamente las 5 recetas activas agrupadas por método
  Y los contadores muestran "Activas (5)", "Archivadas (2)", "Todas (7)"

Escenario: Archivar una receta desde el menú de opciones
  Dado que el usuario está en la vista "Activas"
  Cuando hace clic en el menú ••• de la receta "Aeropress Express" y selecciona "Archivar"
  Entonces la receta desaparece de la vista "Activas"
  Y el contador de "Activas" disminuye a 4 y "Archivadas" aumenta a 3
  Y se muestra una notificación con la opción "Deshacer"

Escenario: Desarchivar una receta
  Dado que el usuario está en el filtro "Archivadas"
  Cuando hace clic en ••• y selecciona "Desarchivar"
  Entonces la receta vuelve a la lista de "Activas"
  Y los contadores se actualizan correspondientemente

Escenario: Vista "Todas" muestra distintivos
  Dado que el usuario selecciona el filtro "Todas"
  Entonces visualiza las recetas activas y archivadas agrupadas por método
  Y las recetas archivadas muestran el badge "[📦 Archivada]" y estilos diferenciados

Escenario: Migración de recetas legacy sin is_archived
  Dado que el usuario tiene recetas previamente guardadas en localStorage sin la propiedad is_archived
  Cuando la aplicación se inicia y carga las recetas
  Entonces todas las recetas se tratan como no archivadas (is_archived = false)
  Y aparecen correctamente en la vista "Activas"

Escenario: Receta importada desde JSON preserva estado de archivado
  Dado que el usuario exporta una receta archivada con is_archived = true
  Cuando importa el archivo .json nuevamente
  Entonces la receta importada mantiene is_archived = true
  Y no aparece en la vista "Activas" hasta que se desarchive
```
