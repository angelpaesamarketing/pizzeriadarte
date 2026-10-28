/**
 * Geometria de la escena.
 *
 * Hay DOS juegos de plancha: uno apaisado para pantallas anchas y otro
 * vertical para moviles. No es solo recortar: la panoramica apaisada arranca a
 * media fachada, sin tejado ni cielo, asi que en un movil alto el edificio
 * aparece cortado por arriba porque no hay nada que ensenar ahi. La vertical
 * trae el edificio entero.
 *
 * Dentro de cada juego, el "mundo" es una caja con la relacion de aspecto
 * EXACTA de su plancha, de modo que cualquier porcentaje dentro de esa caja
 * cae sobre el mismo pixel de la imagen y las capas quedan clavadas.
 *
 * Las cifras de `facade` estan MEDIDAS, no estimadas: se renderizan la plancha
 * y la fachada por separado en el navegador y se ajusta hasta que el rotulo de
 * una cae sobre el de la otra. El metodo esta explicado en el README.
 */

export const PLATE_SETS = {
  horizontal: {
    w: 1672,
    h: 941,
    edge: { dia: { sky: '#a49187', floor: '#a89a95' }, noche: { sky: '#161a24', floor: '#1b1f28' } },
    art: {
      dia: {
        calle: '/assets/calle.webp',
        desenfocada: '/assets/calle-desenfocada.webp',
        primerPlano: '/assets/calle-primer-plano.webp',
      },
      noche: {
        calle: '/assets/calle-noche.webp',
        desenfocada: '/assets/calle-noche-desenfocada.webp',
        primerPlano: '/assets/calle-primer-plano-noche.webp',
      },
    },
    facade: { left: 0.4209, top: 0.5161, width: 0.2201, height: 0.3205 },
    focus: { y: 0.655 },
  },
  vertical: {
    w: 1024,
    h: 1536,
    edge: { dia: { sky: '#8fb4d8', floor: '#b9b2a8' }, noche: { sky: '#12182a', floor: '#1d2230' } },
    art: {
      dia: {
        calle: '/assets/calle-vertical.webp',
        desenfocada: '/assets/calle-vertical-desenfocada.webp',
        primerPlano: '/assets/calle-vertical-primer-plano.webp',
      },
      noche: {
        calle: '/assets/calle-vertical-noche.webp',
        desenfocada: '/assets/calle-vertical-noche-desenfocada.webp',
        primerPlano: '/assets/calle-vertical-primer-plano-noche.webp',
      },
    },
    facade: { left: 0.4095, top: 0.6132, width: 0.4359, height: 0.2379 },
    focus: { y: 0.7163 },
  },
};

/** El tranvia pasa por delante de todo; no comparte lienzo con nada. */
export const TRAM = {
  dia: '/assets/tranvia.webp',
  noche: '/assets/tranvia-noche.webp',
  w: 1983,
  h: 793,
};

export function plateSetFor(vw, vh) {
  return vw / vh < 1.1 ? 'vertical' : 'horizontal';
}

export function setGeometry(name) {
  const set = PLATE_SETS[name];
  const ar = set.w / set.h;
  const focus = { x: set.facade.left + set.facade.width / 2, y: set.focus.y };
  return { ...set, ar, focus };
}

// --- Los dos huecos de la fachada (fracciones de la caja de fachada) -------
// Medidos sobre el canal alfa de fachada.webp.
export const OPENINGS = {
  pizza: { x0: 0.2114, x1: 0.4784, y0: 0.4247, y1: 0.8485 },
  bocadillos: { x0: 0.5303, x1: 0.785, y0: 0.4308, y1: 0.8467 },
};

/**
 * Alto/ancho de la caja de fachada medido en pixeles de pantalla. Hace falta
 * porque dentro de esa caja los porcentajes horizontales y verticales no valen
 * lo mismo: sin esta correccion las maquinas saldrian aplastadas.
 *
 * Sale igual en los dos juegos de plancha, porque en ambos la caja conserva el
 * aspecto del propio asset de fachada.
 */
export const FACADE_BOX_AR = (() => {
  const s = PLATE_SETS.horizontal;
  return s.facade.height / (s.w / s.h) / s.facade.width;
})();

export const FIGURE_AR = 1024 / 1536; // los assets verticales, todos iguales
const MACHINE_BODY_BOTTOM = 0.9505; // borde real del cuerpo en el asset

function placeMachine(open, fill = 0.95) {
  const height = (open.y1 - open.y0) * fill;
  const width = height * FACADE_BOX_AR * FIGURE_AR;
  return {
    left: (open.x0 + open.x1) / 2 - width / 2,
    top: open.y1 - MACHINE_BODY_BOTTOM * height,
    width,
    height,
  };
}

export const MACHINE_BOX = {
  pizza: placeMachine(OPENINGS.pizza),
  bocadillos: placeMachine(OPENINGS.bocadillos),
};

/** Boca del horno de cada maquina, en fracciones de la caja de la maquina. */
export const OVEN_MOUTH = {
  pizza: { x: 0.445, y: 0.655 },
  bocadillos: { x: 0.435, y: 0.7 },
};

// --- Encuadres de la camara ------------------------------------------------
/**
 * vwf = "visible width fraction": que porcion del ancho del mundo entra en
 * pantalla. Moverla es avanzar la camara; no hay dos imagenes distintas.
 */
export function framing(vw, vh) {
  const name = plateSetFor(vw, vh);
  const g = setGeometry(name);
  const portrait = name === 'vertical';

  // Lejos: se deja ver la calle lo mas ancha posible sin descubrir los bordes.
  // El 0,94 es un poco de margen para poder centrar el local sin que asome
  // el fondo por un lado.
  const coverVwf = Math.min(1, vw / (vh * g.ar));
  const vwfFar = coverVwf * 0.94;

  // Cerca: la fachada ocupa ~50% del ancho en apaisado, ~92% en vertical.
  const vwfNear = g.facade.width / (portrait ? 0.92 : 0.5);

  /**
   * En vertical el recorte sobrante se manda ABAJO, no se reparte.
   *
   * Arriba esta el tejado, que es lo que da a entender que es un edificio
   * entero; abajo solo hay acera. Centrando el sobrante se come el tejado y
   * el edificio vuelve a verse cortado, que es justo lo que la plancha
   * vertical venia a arreglar.
   */
  const worldHFar = vw / vwfFar / g.ar;
  const farY = portrait ? Math.min(0.95, (g.focus.y * worldHFar) / vh) : g.focus.y;

  return {
    name,
    g,
    portrait,
    vwfFar,
    vwfNear,
    focusScreen: { farX: 0.5, farY, nearX: 0.5, nearY: 0.47 },
  };
}

// --- Fases ----------------------------------------------------------------
/**
 * El scroll manda de principio a fin: estas son lecturas del progreso, no
 * animaciones que se disparan una vez. Al subir, todo vuelve atras solo.
 */
export const PHASE = {
  wideUntil: 0.05,
  readyFrom: 0.9,
};

/** El tranvia cruza en este tramo del acercamiento, y se va enseguida. */
export const TRAM_PASS = { from: 0.1, to: 0.34 };

export function phaseOf(p) {
  if (p < PHASE.wideUntil) return 'wide';
  if (p < PHASE.readyFrom) return 'approach';
  return 'ready';
}
