import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { SITIO, datosEstructurados } from './src/seo/negocio.js';

/**
 * Con PREVIEW=1 se compila todo en un solo fichero.
 *
 * La vista previa se sirve como un unico HTML con todo incrustado, y ahi un
 * import dinamico no tiene de donde descargar su trozo. En el despliegue
 * normal si interesa que el mapa vaya aparte.
 */
const enUnSoloFichero = process.env.PREVIEW === '1';

/**
 * Mete en el HTML lo que un buscador necesita y una aplicacion de una sola
 * pagina no le da sola.
 *
 * Se hace al compilar y no desde React a proposito: asi viaja en el HTML que
 * sirve el servidor, y no depende de que el rastreador ejecute el JavaScript.
 */
function seo() {
  return {
    name: 'seo-local',
    transformIndexHtml(html) {
      const trozos = [`    <script type="application/ld+json">${JSON.stringify(
        datosEstructurados()
      )}</script>`];
      // Sin dominio propio, fuera del indice: ver SITIO.indexable.
      if (!SITIO.indexable) {
        trozos.unshift('    <meta name="robots" content="noindex, nofollow" />');
      }
      return html.replace('</head>', `${trozos.join('\n')}\n  </head>`);
    },
    generateBundle() {
      if (!SITIO.indexable) {
        this.emitFile({
          type: 'asset',
          fileName: 'robots.txt',
          source: 'User-agent: *\nDisallow: /\n',
        });
        return;
      }
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITIO.url}/sitemap.xml\n`,
      });
      const hoy = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `  <url>\n    <loc>${SITIO.url}/</loc>\n    <lastmod>${hoy}</lastmod>\n` +
          '    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n' +
          '</urlset>\n',
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), seo()],
  build: {
    outDir: enUnSoloFichero ? 'dist-preview' : 'dist',
    cssCodeSplit: !enUnSoloFichero,
    rollupOptions: { output: { inlineDynamicImports: enUnSoloFichero } },
  },
});
