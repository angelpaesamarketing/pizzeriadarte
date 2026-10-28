/**
 * La campana del tranvia, el «ding ding».
 *
 * Se sintetiza en vez de cargar un fichero: son cuatro senos con sus
 * armonicos desafinados -que es lo que hace que una campana suene a metal y
 * no a pitido- y pesa cero.
 */
let ctx = null;

function contexto() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

/** Un golpe de campana. Las parciales no son multiplos enteros a proposito. */
function golpe(ac, cuando, f0 = 1180, volumen = 0.14) {
  const parciales = [1, 2.0, 2.76, 5.4];
  const pesos = [1, 0.45, 0.3, 0.1];
  parciales.forEach((m, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = f0 * m;
    g.gain.setValueAtTime(0, cuando);
    g.gain.linearRampToValueAtTime(volumen * pesos[i], cuando + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, cuando + 0.5 + i * 0.06);
    osc.connect(g).connect(ac.destination);
    osc.start(cuando);
    osc.stop(cuando + 0.9);
  });
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
  const arranque = ac.state === 'suspended' ? ac.resume() : Promise.resolve();
  arranque
    .then(() => {
      const t0 = ac.currentTime + 0.02;
      golpe(ac, t0);
      golpe(ac, t0 + 0.26);
    })
    .catch(() => {});
}
