import { useEffect, useState } from 'react';

const NIGHT_FROM = 20;
const NIGHT_UNTIL = 7;

function readClock() {
  const h = new Date().getHours();
  return h >= NIGHT_FROM || h < NIGHT_UNTIL ? 'noche' : 'dia';
}

function readOverride() {
  if (typeof window === 'undefined') return null;
  const v = new URLSearchParams(window.location.search).get('escena');
  return v === 'noche' || v === 'dia' ? v : null;
}

/**
 * De dia o de noche, segun el reloj de quien mira.
 *
 * El local abre 24 horas, asi que la calle se ve como estaria a esa hora.
 * Con ?escena=noche o ?escena=dia se fuerza una u otra, que es como se
 * revisan las dos sin esperar a que caiga la tarde.
 */
export function useTimeOfDay() {
  const [when, setWhen] = useState(() => readOverride() ?? readClock());

  useEffect(() => {
    if (readOverride()) return undefined;
    // Basta con mirar el reloj de vez en cuando: solo cambia dos veces al dia.
    const id = setInterval(() => setWhen(readClock()), 60_000);
    return () => clearInterval(id);
  }, []);

  return when;
}
