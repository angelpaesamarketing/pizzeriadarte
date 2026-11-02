import { CAJEROS } from '../mapa/cajeros.js';
import { MENU } from '../menu/menuData.js';

/**
 * Los datos del negocio, en un solo sitio.
 *
 * De aqui salen los datos estructurados, el sitemap y el pie de la web, de
 * modo que no puedan contradecirse entre si. Para el SEO local eso importa:
 * Google compara el nombre, la direccion y el telefono de todos los sitios
 * donde aparece el negocio, y una sola discrepancia le resta confianza.
 */
export const SITIO = {
  // OJO: cambiar por el dominio definitivo cuando lo haya. Un subdominio de
  // pages.dev no acumula autoridad y Google lo trata como provisional.
  url: 'https://pizzeriadarte.pages.dev',

  /**
   * Mientras no haya dominio propio, la web NO se indexa.
   *
   * Si Google indexa ahora la direccion de pages.dev y manana se muda al
   * dominio bueno, quedan dos versiones del mismo sitio compitiendo y hay que
   * montar redirecciones para arreglarlo. Un subdominio de pages.dev no va a
   * posicionar de todas formas, asi que no se pierde nada esperando.
   *
   * Poner en `true` el mismo dia que el dominio apunte aqui. Es lo unico que
   * hay que tocar: de aqui salen robots.txt, el sitemap y la etiqueta robots.
   */
  indexable: false,
  nombre: "Pizzería D'Arte",
  titulo: "Pizzería D'Arte · Pizza 24 horas en Zaragoza",
  descripcion:
    'Pizza artesana y bocadillos recién hechos en máquina, 24 horas al día, en 7 puntos de Zaragoza. Tu pizza en 3 minutos a cualquier hora.',
  ciudad: 'Zaragoza',
  provincia: 'Zaragoza',
  pais: 'ES',
  imagen: '/assets/calle.webp',
};

/** Abierto siempre: los siete dias, de 00:00 a 23:59. */
const SIEMPRE_ABIERTO = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ],
  opens: '00:00',
  closes: '23:59',
};

function carta() {
  const seccion = (titulo, secciones) =>
    secciones.map((s) => ({
      '@type': 'MenuSection',
      name: `${titulo} · ${s.name}`,
      hasMenuItem: s.items.map((i) => ({
        '@type': 'MenuItem',
        name: i.nombre,
        ...(i.desc ? { description: i.desc } : {}),
        ...(i.foto ? { image: SITIO.url + i.foto } : {}),
      })),
    }));

  return {
    '@type': 'Menu',
    '@id': `${SITIO.url}/#carta`,
    name: `Carta de ${SITIO.nombre}`,
    inLanguage: 'es',
    hasMenuSection: [
      ...seccion('Pizzas', MENU.pizza.sections),
      ...seccion('Bocadillos', MENU.bocadillos.sections),
    ],
  };
}

function local(c) {
  return {
    '@type': 'Restaurant',
    '@id': `${SITIO.url}/#cajero-${c.id}`,
    name: `${SITIO.nombre} · ${c.calle}`,
    description: c.obrador
      ? 'Obrador y pizzería 24 horas.'
      : 'Cajero de pizza artesana y bocadillos, abierto 24 horas.',
    url: SITIO.url,
    image: SITIO.url + SITIO.imagen,
    parentOrganization: { '@id': `${SITIO.url}/#negocio` },
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.calle,
      addressLocality: SITIO.ciudad,
      addressRegion: SITIO.provincia,
      addressCountry: SITIO.pais,
    },
    geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng },
    openingHoursSpecification: SIEMPRE_ABIERTO,
    servesCuisine: ['Pizza', 'Italiana', 'Bocadillos'],
    priceRange: '€',
    hasMenu: { '@id': `${SITIO.url}/#carta` },
    publicAccess: true,
    smokingAllowed: false,
  };
}

/**
 * Los datos estructurados de la web.
 *
 * Es lo que le dice a Google que esto no es una pizzeria, sino siete puntos
 * con sus coordenadas, abiertos a todas horas, y con esta carta. Sin esto,
 * una web de una sola pagina como esta no tiene forma de contarselo.
 */
export function datosEstructurados() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITIO.url}/#negocio`,
        name: SITIO.nombre,
        url: SITIO.url,
        description: SITIO.descripcion,
        areaServed: { '@type': 'City', name: SITIO.ciudad },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITIO.url}/#web`,
        url: SITIO.url,
        name: SITIO.titulo,
        inLanguage: 'es',
        publisher: { '@id': `${SITIO.url}/#negocio` },
      },
      ...CAJEROS.map(local),
      carta(),
    ],
  };
}
