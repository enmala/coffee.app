# Guía de Publicación PWA a TWA (Google Play Store)

Esta guía explica paso a paso cómo compilar, firmar y empaquetar **Barista Timer** como una **Trusted Web Activity (TWA)** para su publicación en Google Play Store utilizando la herramienta oficial **Bubblewrap CLI**.

---

## 📋 Prerrequisitos en tu Máquina

Dado que la compilación se realiza localmente por seguridad de firmas, necesitas tener instalado:
1. **Node.js** (v18 o superior).
2. **Java Development Kit (JDK 17+)**: Ya instalado en el entorno (`default-jdk`).
3. **Android SDK Command-Line Tools**:
   - Descarga e instala [Android Studio](https://developer.android.com/studio) o descarga los [Command Line Tools de Android](https://developer.android.com/studio#command-tools) directamente.
   - Asegúrate de que las herramientas del SDK estén en tu ruta de entorno (variables `ANDROID_HOME`).

---

## 🛠️ Paso 1: Inicializar el Proyecto Android TWA

Bubblewrap lee el archivo de configuración `twa-manifest.json` para generar toda la estructura nativa de Android:

```bash
# Inicializa el proyecto Android a partir de la configuración
npx @bubblewrap/cli init --manifest=twa-manifest.json
```

**Durante el proceso:**
- Bubblewrap te preguntará dónde están instalados el **JDK** y el **Android SDK** en tu máquina (ej: `/usr/lib/jvm/...` y `/home/usuario/Android/Sdk`).
- Te pedirá confirmar los datos (nombre, versión, colores) definidos en el JSON.

---

## 🔑 Paso 2: Crear la Llave de Firma (.keystore)

En el paso de inicialización, Bubblewrap te preguntará si deseas generar un nuevo archivo de firmas (`android.keystore`).

1. Selecciona **Generar nueva clave (Generate new key)**.
2. Ingresa los datos solicitados:
   - **Password del Keystore** (anótalo en un lugar seguro).
   - **Password de la Clave/Alias**.
   - Tus datos organizacionales.
3. Esto generará el archivo `android.keystore` en la raíz del proyecto.

> [!CAUTION]
> **RESPALDA EL ARCHIVO `android.keystore` Y LAS CONTRASEÑAS:**
> Si pierdes el archivo `.keystore` o las contraseñas, **nunca** podrás actualizar tu aplicación en Google Play Store. Guárdalo de forma segura en un gestor de archivos o bóveda cifrada. **No lo subas a GitHub.** (Está excluido del control de versiones).

---

## 📦 Paso 3: Compilar la Aplicación (.apk y .aab)

Para compilar el proyecto y generar el instalador para producción:

```bash
# Compilar el proyecto
npx @bubblewrap/cli build
```

**Este comando creará:**
1. Un archivo **`.apk`** (instalador de prueba local).
2. Un archivo **`.aab`** (Android App Bundle, el archivo requerido para subir a Google Play Console).

Al finalizar la compilación, Bubblewrap imprimirá por consola la **Huella Digital SHA-256 (SHA-256 Fingerprint)** de la clave de firmas. Se verá similar a esto:
`SHA-256 Fingerprint: AB:CD:EF:01:23:45...`

---

## 🔗 Paso 4: Configurar Digital Asset Links

Para que la app se abra en pantalla completa sin la barra de direcciones del navegador, debes verificar la propiedad del dominio:

1. Copia la huella digital **SHA-256** impresa por Bubblewrap al final del build.
2. Abre el archivo [public/.well-known/assetlinks.json](file:///home/enmala/coffee.app/public/.well-known/assetlinks.json) en tu editor.
3. Reemplaza `"REPLACE_WITH_YOUR_SHA256_FINGERPRINT_FROM_KEYSTORE"` con tu huella digital SHA-256 en mayúsculas.
4. Realiza un build web y despliégalo:
   ```bash
   npm run build
   # (Despliega la carpeta /dist a tu hosting barista.bitslab.cl)
   ```
5. Verifica que el archivo sea accesible públicamente desde el navegador en:
   `https://barista.bitslab.cl/.well-known/assetlinks.json`

---

## 🚀 Paso 5: Publicar en Google Play Console

1. Inicia sesión en tu cuenta de desarrollador en [Google Play Console](https://play.google.com/console).
2. Crea una nueva aplicación:
   - **Nombre:** Barista Timer
   - **Idioma:** Español
   - **Tipo:** Aplicación (App)
   - **Precio:** Gratis
3. Completa la configuración básica (declaración de anuncios, contenido, etc.).
4. **Política de Privacidad:** Agrega el enlace a la política de privacidad de tu sitio.
5. Sube el archivo **`.aab`** generado en la carpeta del proyecto a la sección de **Producción** (o Pruebas Internas).
6. ¡Envía a revisión! Una vez aprobada, tu PWA estará disponible de forma nativa en Google Play.
