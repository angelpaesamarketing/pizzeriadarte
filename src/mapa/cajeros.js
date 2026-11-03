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
 * Mismo esquema que usa pizzeriadarte24h.com: el oficial (`/maps/dir/?api=1`),
 * a pie, y con el origen puesto cuando sabemos donde esta quien mira. En movil
 * abre la aplicacion si esta instalada, y no necesita clave.
 */
export function comoLlegar(c, desde = null) {
  const destino = `${c.lat},${c.lng}`;
  const origen = desde ? `&origin=${desde.lat},${desde.lng}` : '';
  return `https://www.google.com/maps/dir/?api=1${origen}&destination=${destino}&travelmode=walking`;
}

/** Distancia en linea recta entre dos puntos, en metros. */
export function distancia(a, b) {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** 840 m, o 1,2 km. Como lo escribe su web. */
export function enMetros(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

/** Los cajeros ordenados por cercania, si sabemos desde donde. */
export function porCercania(desde) {
  const lista = CAJEROS.map((c) => ({ ...c, d: desde ? distancia(desde, c) : null }));
  return desde ? lista.sort((a, b) => a.d - b.d) : lista;
}
