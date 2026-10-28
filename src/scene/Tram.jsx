import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import { TRAM, TRAM_PASS } from './geometry';
import { tocarCampana } from './campana';
import { useViewport } from '../hooks/useViewport';

/**
 * El tranvia cruza por delante del local durante el acercamiento.
 *
 * Va fuera del mundo, en coordenadas de pantalla: no esta en el plano de la
 * fachada sino mucho mas cerca de la camara, asi que ni comparte lienzo ni
 * hereda su escala.
 *
 * El desenfoque de movimiento se pone aqui y no en el asset: asi acompana a
 * la velocidad real en vez de ser una cantidad fija pintada en la imagen.
 */
export function Tram({ t, night }) {
  const { from, to } = TRAM_PASS;
  const mid = (from + to) / 2;
  const { vw } = useViewport();
  const ref = useRef(null);
  const [ancho, setAncho] = useState(0);

  /**
   * El recorrido se mide contra el ancho de la PANTALLA, no contra el del
   * tranvia.
   *
   * Con porcentajes el tranvia se desplazaba ±108% de su propio ancho, que
   * en escritorio son 2.340 px: la mayor parte del trayecto la hacia fuera
   * de cuadro y por eso cruzaba en cuatro decimas. Midiendolo asi entra justo
   * por un borde y sale justo por el otro, sin gastar camino donde no se ve.
   */
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const medir = () => setAncho(el.offsetWidth);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [vw]);

  const x = useTransform(t, [from, to], [vw + 16, -(ancho || vw * 2) - 16], { clamp: true });
  const opacity = useTransform(
    t,
    [from - 0.015, from + 0.01, to - 0.01, to + 0.015],
    [0, 1, 1, 0]
  );
  // Mas borroso en mitad del paso, que es donde va mas rapido por pantalla.
  const blur = useTransform(t, [from, mid, to], ['blur(1px)', 'blur(3.5px)', 'blur(1px)']);

  // La campana suena una vez por pasada. Se rearma cuando el tranvia vuelve
  // a estar fuera, de modo que al subir y bajar otra vez vuelve a sonar.
  const sonado = useRef(false);
  useMotionValueEvent(t, 'change', (v) => {
    if (v > from + 0.015 && v < mid && !sonado.current) {
      sonado.current = true;
      tocarCampana();
    } else if (v <= from + 0.005 || v >= to) {
      sonado.current = false;
    }
  });

  return (
    <motion.img
      ref={ref}
      className="tram"
      src={night ? TRAM.noche : TRAM.dia}
      alt=""
      draggable={false}
      aria-hidden
      style={{ x, opacity, filter: blur, aspectRatio: `${TRAM.w} / ${TRAM.h}` }}
    />
  );
}
