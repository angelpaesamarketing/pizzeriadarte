import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Con PREVIEW=1 se compila todo en un solo fichero.
 *
 * La vista previa se sirve como un unico HTML con todo incrustado, y ahi un
 * import dinamico no tiene de donde descargar su trozo. En el despliegue
 * normal si interesa que el mapa vaya aparte.
 */
const enUnSoloFichero = process.env.PREVIEW === '1';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: enUnSoloFichero ? 'dist-preview' : 'dist',
    cssCodeSplit: !enUnSoloFichero,
    rollupOptions: { output: { inlineDynamicImports: enUnSoloFichero } },
  },
});
