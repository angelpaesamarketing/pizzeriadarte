import { motion, useTransform } from 'framer-motion';
import { TRAM, TRAM_PASS } from './geometry';

/**
 * El tranvia cruza por delante del local durante el acercamiento.
 *
 * Va fuera del mundo, en coordenadas de pantalla: no esta en el plano de la
 * fachada sino mucho mas cerca de la camara, asi que ni comparte lienzo ni
 * hereda su escala. Cruza en un tramo corto del scroll, y por eso pasa
 * deprisa.
 *
 * El desenfoque de movimiento se pone aqui y no en el asset: asi acompana a
 * la velocidad real en vez de ser una cantidad fija pintada en la imagen.
 */
export function Tram({ t, night }) {
  const { from, to } = TRAM_PASS;
  const mid = (from + to) / 2;

  // Entra por la derecha y sale por la izquierda, pasando de largo.
  const x = useTransform(t, [from, to], ['108%', '-108%'], { clamp: true });
  const opacity = useTransform(
    t,
    [from - 0.015, from + 0.01, to - 0.01, to + 0.015],
    [0, 1, 1, 0]
  );
  // Mas borroso en mitad del paso, que es donde va mas rapido por pantalla.
  const blur = useTransform(t, [from, mid, to], ['blur(1px)', 'blur(3.5px)', 'blur(1px)']);

  return (
    <motion.img
      className="tram"
      src={night ? TRAM.noche : TRAM.dia}
      alt=""
      draggable={false}
      aria-hidden
      style={{ x, opacity, filter: blur, aspectRatio: `${TRAM.w} / ${TRAM.h}` }}
    />
  );
}
