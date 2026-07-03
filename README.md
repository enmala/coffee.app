# ☕ Barista Timer

**Barista Timer** es una aplicación web interactiva y responsiva diseñada para entusiastas del café de especialidad. Permite administrar recetas personalizadas y guiar el proceso de extracción paso a paso mediante un cronómetro automatizado con alertas sonoras, vibración y control de bloqueo de pantalla.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Progressive%20Web%20App-0070f3?style=for-the-badge&logo=progressive-web-apps&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3f3f3f?style=for-the-badge&logo=vitest&logoColor=FCC72B)

---

## ✨ Características Principales

* **⏱️ Cronómetro Inteligente por Pasos:** Guía visual detallada que calcula el tiempo restante por etapa, el agua a verter en cada vertido y el agua total acumulada en tiempo real.
* **🗣️ Modo Manos Libres:** Narración por voz en tiempo real de las instrucciones y pasos de preparación utilizando la *Web Speech API* nativa, permitiendo concentrarse en el vertido sin tener que mirar la pantalla constantemente.
* **📱 Experiencia PWA e Instalación Offline:** Configuración completa como Aplicación Web Progresiva (PWA). Es instalable en dispositivos móviles y de escritorio, y funciona sin conexión a Internet gracias al Service Worker autogenerado.
* **💾 Gestión Completa de Recetas:**
    * Recetas preconfiguradas de fábrica (como el Método 4:6 de Tetsu Kasuya para V60 y Aeropress Tradicional).
    * Creador y **editor** de recetas personalizadas (ajustando molienda, temperatura, café y pasos ilimitados).
    * Clasificación y agrupación visual dinámica de las recetas según el método de preparación (V60, Aeropress, Chemex, Moka, Origami, etc.).
* **📓 Historial de Preparaciones (Coffee Journal):** Registro local que almacena la fecha, hora y receta empleada en cada preparación exitosa, permitiendo calificar con estrellas, seleccionar descriptores de sabor (ej. afrutado, amargo, balanceado) y guardar notas sobre el resultado.
* **📥 Importación y Exportación JSON:** Exportación e importación de recetas mediante archivos estructurados `.json`, con validación de IDs únicos y prevención de nombres duplicados.
* **⚙️ Ajuste y Personalización de Alertas:** Panel de configuración para activar/desactivar alertas sonoras y configurar la duración o el tipo de vibración háptica (para dispositivos móviles compatibles).
* **🌓 Modo Claro / Oscuro:** Selector manual y soporte adaptativo automático que respeta el tema preferido del sistema operativo.
* **🔒 Persistencia Local:** Resguardo seguro y automático de todas las recetas, el historial y los ajustes del usuario a través de `localStorage`.

---

## 🛠️ Tecnologías Utilizadas

* **Entorno & Compilación:** [Vite](https://vite.dev/) y Node.js (versión 20+).
* **Frontend:** [React](https://react.dev/) (React 19+, Hooks avanzados y modularidad en componentes como `TimerComponent`).
* **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) (utilizando el nuevo compilador integrado con Vite para un rendimiento y diseño responsivo óptimos).
* **PWA & Offline:** `vite-plugin-pwa` para el registro del Service Worker y generación del manifiesto de la aplicación.
* **Pruebas:** [Vitest](https://vitest.dev/) y React Testing Library para la suite de pruebas unitarias.
* **APIs Web Nativas:** Web Audio API (para síntesis de pitidos de cambio de etapa sin archivos externos), Web Vibration API (hápticos), Screen Wake Lock API (mantener pantalla encendida) y FileReader API (importación de JSON).

---

## 🚀 Instalación y Desarrollo Local

Este proyecto fue estructurado usando **Vite**. Sigue estos pasos para ejecutarlo localmente:

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/enmala/coffee.app.git](https://github.com/enmala/coffe.app.git)
    cd barista-timer
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

4.  **Abre el navegador:** Visita `http://localhost:5173` para ver la aplicación en acción.

---

## 🧪 Pruebas Unitarias

El proyecto cuenta con una sólida suite de pruebas unitarias implementada con **Vitest** y **React Testing Library**, alcanzando una cobertura de código superior al **80%** en componentes, utilidades y lógica del temporizador.

Puedes ejecutar los siguientes comandos para interactuar con las pruebas:

*   **Ejecutar todas las pruebas:**
    ```bash
    npm test
    ```
*   **Iniciar el panel interactivo (UI de Vitest):**
    ```bash
    npm run test:ui
    ```
*   **Generar reporte de cobertura de código:**
    ```bash
    npm run test:coverage
    ```

Los archivos de prueba se ubican dentro de la carpeta `__tests__/` y validan el correcto comportamiento de la app, el flujo del temporizador, la persistencia en `localStorage`, la importación/exportación de JSON y la configuración del usuario.

---

## 📋 Estructura de Datos de una Receta (JSON)

Si deseas diseñar o compartir tus recetas de forma externa para importarlas en la app, utiliza la siguiente estructura estándar:

```json
{
  "id": "aeropress-standard",
  "name": "Aeropress Tradicional",
  "method": "Aeropress",
  "coffee_g": 15,
  "grind_size": "Medio-Fina",
  "water_temp_c": 85,
  "steps": [
    {
      "step_number": 1,
      "title": "Llenado y agitación",
      "water_g": 220,
      "duration_s": 10,
      "instruction": "Vierte todo el agua rápidamente y agita durante 10 segundos."
    },
    {
      "step_number": 2,
      "title": "Reposo",
      "water_g": 0,
      "duration_s": 50,
      "instruction": "Coloca el émbolo ligeramente para hacer vacío y espera."
    },
    {
      "step_number": 3,
      "title": "Prensado",
      "water_g": 0,
      "duration_s": 30,
      "instruction": "Presiona el émbolo suavemente hacia abajo durante 30 segundos."
    }
  ]
}
```
