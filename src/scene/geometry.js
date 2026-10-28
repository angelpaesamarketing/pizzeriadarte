/**
 * Geometria de la escena.
 *
 * Todas las cifras de este fichero estan MEDIDAS sobre los assets reales
 * (no estimadas a ojo). El metodo: localizar el rotulo de seto verde en la
 * panoramica y en la fachada recortada, y encajar uno sobre otro. De ahi sale
 * el encaje exacto entre la vista lejana y las capas del local, que es lo que
 * evita el salto al cambiar de una a otra.
 *
 * El "mundo" es una caja con la relacion de aspecto EXACTA de la panoramica
 * (1672 x 941 = 1,7768 ~ 16:9). Por eso cualquier porcentaje dentro de esa
 * caja cae sobre el mismo pixel de la imagen, y las capas quedan clavadas.
 */

// --- Plancha panoramica ----------------------------------------------------
export const PLATE = { w: 1672, h: 941 };
export const PLATE_AR = PLATE.w / PLATE.h; // 1.7768

/** Franja de acera + vias recortada para el paralaje de primer plano. */
export const FOREGROUND_TOP = 0.735;

/** Colores muestreados de los bordes de la plancha, para alargarla en alto. */
export const PLATE_EDGE = { sky: '#a49187', floor: '#a89a95' };

// --- La fachada dentro del mundo ------------------------------------------
// Rotulo verde en la panoramica:  x 0.4342..0.6256   y 0.5080..0.6281
// Rotulo verde en fachada.webp:   x 0.0671..0.9343   y 0.0273..0.3736
// Escala uniforme ajustada por el ancho del rotulo y anclada en su BORDE
// INFERIOR. El borde superior no sirve: en la panoramica el rotulo es un panel
// plano y en fachada.webp es un seto con volumen, cuya cara de arriba se ve.
// Si se encajan por arriba aparecen dos rotulos durante el fundido.
// Los valores de abajo salen de medir ambas capas renderizadas por separado
// en el navegador, no de estimar sobre el fichero.
export const FACADE = {
  left: 0.4188,
  top: 0.5158,
  width: 0.2224, // fraccion del ANCHO del mundo
  height: 0.3238, // fraccion del ALTO del mundo (conserva el aspecto 1.2211)
};

/** Punto al que apunta la camara: el centro del local, no el de la imagen. */
export const FOCUS = {
  x: FACADE.left + FACADE.width / 2, // 0.5298
  y: 0.655,
};

// --- Los dos huecos de la fachada (fracciones de la caja de fachada) -------
// Medidos sobre el canal alfa de fachada.webp.
export const OPENINGS = {
  pizza: { x0: 0.2114, x1: 0.4798, y0: 0.4238, y1: 0.8493 },
  bocadillos: { x0: 0.5281, x1: 0.7835, y0: 0.43, y1: 0.8476 },
};

// --- Las maquinas dentro de los huecos ------------------------------------
// Los assets de maquina son 1024x1536 con aire transparente alrededor:
// el cuerpo visible ocupa y 0.040..0.9505 de la caja. Apoyamos ese borde
// inferior real en el suelo del hueco para que no queden flotando.
export const FIGURE_AR = 1024 / 1536; // los assets verticales, todos iguales
const MACHINE_BODY_BOTTOM = 0.9505; // borde real del cuerpo en el asset
/**
 * Alto/ancho de la caja de fachada medido en pixeles de pantalla. Hace falta
 * porque dentro de esa caja los porcentajes horizontales y verticales no valen
 * lo mismo: sin esta correccion las maquinas saldrian aplastadas.
 */
export const FACADE_BOX_AR = FACADE.height / PLATE_AR / FACADE.width;

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
 * pantalla. 1 = la calle entera; 0,25 = un cuarto, es decir, mucho mas cerca.
 * Mover esto es avanzar la camara; no hay dos imagenes distintas.
 */
export function framing(vw, vh) {
  const portrait = vw / vh < 1.1;

  // Lejos: en apaisado se ve la calle entera (con un pelin de aire para poder
  // centrar el local); en vertical se deja una franja ancha y legible.
  const coverVwf = Math.min(1, vw / (vh * PLATE_AR));
  const vwfFar = portrait ? 0.42 : coverVwf * 0.94;

  // Cerca: la fachada ocupa ~50% del ancho en apaisado, ~92% en vertical.
  const vwfNear = portrait ? FACADE.width / 0.92 : FACADE.width / 0.5;

  return {
    portrait,
    vwfFar,
    vwfNear,
    // Donde cae el punto de foco en pantalla, en fracciones del viewport.
    focusScreen: {
      farX: 0.5,
      farY: portrait ? 0.61 : FOCUS.y,
      nearX: 0.5,
      nearY: 0.47,
    },
  };
}

// --- Fases ----------------------------------------------------------------
/**
 * El scroll manda de principio a fin: estas son lecturas del progreso, no
 * animaciones que se disparan una vez. Al subir, todo vuelve atras solo.
 */
export const PHASE = {
  wideUntil: 0.06, // plano general
  readyFrom: 0.88, // local listo: se encienden las maquinas
};

export function phaseOf(p) {
  if (p < PHASE.wideUntil) return 'wide';
  if (p < PHASE.readyFrom) return 'approach';
  return 'ready';
}
