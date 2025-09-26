<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1TEmIpfuUafeVyVwMDbcRhB6CVmFjWUN9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key if you plan to use Gemini-powered features.
3. Run the app locally with hot reload:
   `npm run dev`
4. Build a static bundle that can be opened directly in the browser:
   `npm run build`
   The optimized files will be placed inside `dist/`. Thanks to the relative asset base configuration you can open `dist/index.html` with a file URL or serve the folder from any static host and the game will boot correctly.

## Jugar en el navegador

Una vez construido el proyecto, abre directamente el juego desde el siguiente enlace local:

➡️ [Abrir el juego](./web-game/index.html)

El vínculo anterior apunta a una copia del paquete generado en `web-game/index.html`. Si clonas el repositorio y ejecutas `npm run build`, podrás actualizar el contenido de esa carpeta (copiando los archivos de `dist/`) y hacer clic en el enlace para lanzar el juego desde tu navegador sin necesidad de un servidor adicional.
