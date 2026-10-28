/**
 * La campana del tranvia.
 *
 * Es una grabacion real (`/assets/campana.mp3`, 25 KB): dos golpes separados
 * unos 380 ms, con los parciales fuertes en 1,9 / 4,5 / 6,8 kHz, que es de
 * donde sale lo estridente. Antes estaba sintetizada y sonaba demasiado
 * redonda para un tranvia.
 *
 * Se reproduce con Web Audio y no con un <audio>: el buffer se descodifica
 * una sola vez y cada pasada arranca al instante, sin el retardo de recargar
 * el elemento ni el riesgo de pisarse consigo mismo.
 */
const FUENTE = '/assets/campana.mp3';
const VOLUMEN = 0.75;

let ctx = null;
let buffer = null;
let cargando = null;

function contexto() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function cargar(ac) {
  if (buffer) return Promise.resolve(buffer);
  if (!cargando) {
    cargando = fetch(FUENTE)
      .then((r) => r.arrayBuffer())
      .then((datos) => ac.decodeAudioData(datos))
      .then((b) => {
        buffer = b;
        return b;
      })
      .catch(() => null);
  }
  return cargando;
}

/**
 * Suena solo si el navegador deja: sin un gesto previo del usuario lo bloquea,
 * y entonces no pasa nada. Tampoco suena con prefers-reduced-motion.
 */
export function tocarCampana() {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ac = contexto();
  if (!ac) return;

  const listo = ac.state === 'suspended' ? ac.resume() : Promise.resolve();
  listo
    .then(() => cargar(ac))
    .then((b) => {
      if (!b) return;
      const fuente = ac.createBufferSource();
      const volumen = ac.createGain();
      fuente.buffer = b;
      volumen.gain.value = VOLUMEN;
      fuente.connect(volumen).connect(ac.destination);
      fuente.start();
    })
    .catch(() => {});
}

/** Deja el sonido descodificado antes de que haga falta. */
export function prepararCampana() {
  const ac = contexto();
  if (ac) cargar(ac);
}
