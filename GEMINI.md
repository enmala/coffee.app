# Contexto del Proyecto: Barista Timer PWA

Este archivo contiene el contexto técnico, la arquitectura y el estado actual del desarrollo del proyecto **Barista Timer** para continuar su evolución mediante herramientas de asistencia de IA (como Gemini CLI).

## 1. Descripción del Proyecto
**Barista Timer** es una Aplicación Web Progresiva (PWA) diseñada para asistir a los amantes del café de especialidad a seguir y cronometrar sus recetas de extracción utilizando diferentes métodos (V60, Aeropress, Chemex, Origami, Moka, etc.). 

### Características Principales Implementadas:
*   **Gestión Local:** Creación, edición, listado y eliminación de recetas guardadas directamente en el dispositivo (`localStorage`).
*   **Agrupamiento por Métodos:** Clasificación visual y dinámica de las recetas de acuerdo con el método de preparación empleado.
*   **Resumen de Receta:** Un modal de vista previa rápida de cada receta para verificar parámetros físicos (peso de café, molienda, temperatura del agua, tiempo total estimado) y la lista de pasos secuenciales antes de iniciar la preparación.
*   **Temporizador Interactivo por Etapas:** Cronómetro secuencial con instrucciones paso a paso, visualización del agua acumulada sugerida, pitido de alerta sintetizado (usando Web Audio API para evitar dependencias externas) y soporte para vibración háptica en dispositivos móviles compatibles.
*   **Importación y Exportación:** Herramienta para descargar cualquier receta local como archivo de estructura estructurada `.json` e importar nuevas recetas externas de manera nativa.
*   **Capacidad PWA:** Configurado con un manifiesto web e iconos dedicados para permitir su instalación en dispositivos móviles y de escritorio (Android, iOS, Windows, macOS) y funcionamiento sin conexión a Internet.

---

## 2. Stack Tecnológico y Entorno de Desarrollo
*   **Sistema Operativo del Desarrollador:** Windows (utilizando terminales emuladas/Linux como Git Bash o WSL).
*   **Entorno de Ejecución:** Node.js (versión 20+).
*   **Herramienta de Construcción:** Vite + React (JavaScript moderno ES6+).
*   **Estilos:** Tailwind CSS.
*   **Gestor de PWA:** `vite-plugin-pwa` para la autogeneración del Service Worker y el Web Manifest.
*   **Plataforma de Despliegue de Producción:** Plataformas de hosting estático con HTTPS automático (como Netlify o Vercel).

---

## 3. Esquema de Datos (JSON Schema)
Las recetas se estructuran siguiendo este formato JSON:

```json
{
  "id": "string (identificador único)",
  "name": "string (nombre descriptivo de la receta)",
  "method": "string (V60, Aeropress, Chemex, Origami, Moka, etc.)",
  "coffee_g": "number (cantidad de café en gramos)",
  "grind_size": "string (tipo de molienda o clics del molino)",
  "water_temp_c": "number (temperatura del agua en °C)",
  "steps": [
    {
      "step_number": "number (índice correlativo del paso)",
      "title": "string (título del paso, ej: Preinfusión)",
      "water_g": "number (agua a verter en esta etapa específica)",
      "duration_s": "number (duración en segundos de la etapa)",
      "instruction": "string (instrucción corta de asistencia)"
    }
  ]
}
```

---

## 4. Estructura de Archivos Clave

- `vite.config.js` (Configuración de Vite y PWA)
- `src/App.jsx` (Código Fuente Completo de la Aplicación)


---

## 5. Próximas Características y Mejoras Pendientes (Backlog de Desarrollo)

1.  **Edición de Recetas Existentes:** Implementar una interfaz para permitir modificar los parámetros y los pasos de una receta ya guardada en `localStorage` (actualmente solo se pueden crear y eliminar).
2.  **Calculadora Dinámica de Ratios:** Permitir al usuario modificar la cantidad de café inicial (`coffee_g`) en tiempo de ejecución (por ejemplo, desde el resumen o antes de iniciar el timer) y que la aplicación recalcule y escale proporcionalmente la cantidad de agua necesaria para cada paso individual basándose en la relación (ratio) original.
3.  **Historial de Preparaciones:** Crear un registro local que guarde la fecha, hora y receta de cada extracción completada exitosamente, permitiendo al usuario añadir notas sobre el resultado de su taza (ej: "Salió un poco amargo, moler más grueso la próxima vez").
4.  **Temas Visuales / Modo Oscuro:** Añadir un selector para alternar entre modo claro y modo oscuro para mejorar la visibilidad de madrugada o en ambientes con iluminación tenue.
5.  **Ajuste de Alertas:** Permitir al usuario habilitar/deshabilitar los pitidos de audio de cambio de etapa y configurar la duración o frecuencia de la vibración.

---

## 6. Reglas de trabajo en el repositorio

1. Todos los cambios se deben trabajar en ramas independientes de corta duración
2. La integración de cambios a la rama principal siempre se realizará utilizando Pull Requests
3. Una vez integrados los cambios en la rama principal la rama de trabajo de corta duración debe ser eliminada
4. Seguir las recomendaciones de Conventional Commits [https://www.conventionalcommits.org/en/v1.0.0/]