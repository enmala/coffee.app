# ☕ Barista Timer

**Barista Timer** es una aplicación web interactiva y responsiva diseñada para entusiastas del café de especialidad. Permite administrar recetas personalizadas y guiar el proceso de extracción paso a paso mediante un cronómetro automatizado con alertas sonoras, vibración y control de bloqueo de pantalla.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## ✨ Características Principales

* **⏱️ Cronómetro Inteligente por Pasos:** Guía visual detallada que calcula el tiempo restante por etapa, el agua a verter en cada vertido y el agua total acumulada en tiempo real.
* **💾 Gestión Completa de Recetas:** * Viene con recetas preconfiguradas (Método 4:6 de Tetsu Kasuya para V60 y Aeropress Tradicional).
    * Creador de recetas personalizadas (molienda, temperatura, peso de café y múltiples pasos dinámicos).
    * Organización y colapso de recetas agrupadas por método (V60, Aeropress, Chemex, Prensa Francesa, etc.).
* **📥 Importación y Exportación JSON:** Copia de seguridad o intercambio de tus recetas favoritas mediante archivos JSON con un solo clic.
* **🌓 Modo Oscuro Nativo:** Interfaz adaptativa que respeta las preferencias del sistema operativo o permite el cambio manual.
* **📱 Experiencia Mobile Optimizada:**
    * **Screen Wake Lock API:** Evita que la pantalla de tu teléfono se apague automáticamente en pleno vertido.
    * **Vibration API:** Feedback táctil al cambiar de paso o finalizar la extracción (en dispositivos compatibles).
    * **Audio Sintetizado:** Alertas auditivas nítidas generadas mediante la *Web Audio API* nativa sin necesidad de cargar archivos de audio pesados.
* **🔒 Persistencia Local:** Todas tus recetas y configuraciones visuales se guardan automáticamente en el navegador vía `localStorage`.

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** [React](https://react.dev/) (Hooks: `useState`, `useEffect`, composición de componentes).
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (Diseño responsivo, transiciones suaves y soporte estricto de modo oscuro).
* **APIs del Navegador:** Web Audio API, Web Vibration API, Screen Wake Lock API y FileReader API.

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
