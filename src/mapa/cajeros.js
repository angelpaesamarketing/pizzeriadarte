/**
 * Los cajeros de pizza de Zaragoza.
 *
 * Coordenadas tomadas de pizzeriadarte24h.com, que es el mapa que ya tenia la
 * pizzeria. Si abre o cierra alguno, se toca solo esta lista.
 */
export const CAJEROS = [
  {
    id: 'claret',
    calle: 'Antonio María Claret 66',
    nota: 'Obrador y pizzería 24 h',
    obrador: true,
    lat: 41.6436793,
    lng: -0.8962318,
  },
  { id: 'fernando', calle: 'Fernando el Católico 6', lat: 41.6438525, lng: -0.8926005 },
  { id: 'vitoria', calle: 'Francisco de Vitoria 27', lat: 41.6451367, lng: -0.8788904 },
  { id: 'manif', calle: 'Manifestación 44', lat: 41.6554479, lng: -0.8799529 },
  { id: 'madrid', calle: 'Av. Madrid 161', lat: 41.653008, lng: -0.9055535 },
  { id: 'coso', calle: 'Coso 20', lat: 41.6535968, lng: -0.8834311 },
  { id: 'actur', calle: 'Poeta Rosalía de Castro 2', lat: 41.6668056, lng: -0.8881389 },
];

/**
 * Enlace de indicaciones de Google Maps.
 *
 * Se usa el esquema oficial de URL (`/maps/dir/?api=1`), que en movil abre la
 * aplicacion si esta instalada y en escritorio la web, sin necesitar clave.
 * Se manda la direccion ademas de las coordenadas para que el destino salga
 * con su nombre y no como un punto suelto.
 */
export function comoLlegar(c) {
  const destino = encodeURIComponent(`${c.calle}, Zaragoza`);
  // Sin travelmode: que Google use el que cada cual tenga por costumbre, que
  // a un cajero se puede ir andando o en coche segun donde estes.
  return `https://www.google.com/maps/dir/?api=1&destination=${destino}`;
}

/** El mismo sitio, pero para verlo en el mapa en vez de para ir. */
export function verEnMapa(c) {
  return `https://www.google.com/maps/search/?api=1&query=${c.lat}%2C${c.lng}`;
}
