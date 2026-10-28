import { motion } from 'framer-motion';
import { MACHINE_BOX } from './geometry';

const ART = {
  pizza: '/assets/maquina-pizza.webp',
  bocadillos: '/assets/maquina-bocadillos.webp',
};

const pct = (n) => `${n * 100}%`;

/**
 * Una maquina dentro de su hueco de la fachada.
 *
 * Va en porcentajes de la caja de fachada, asi que hereda el avance de la
 * camara sin calculos propios. Solo se enciende cuando `ready`, que es lo que
 * marca el final del acercamiento.
 */
export function Machine({ kind, ready, busy, dimmed }) {
  const box = MACHINE_BOX[kind];

  return (
    <motion.div
      className="machine"
      style={{
        left: pct(box.left),
        top: pct(box.top),
        width: pct(box.width),
        height: pct(box.height),
      }}
      animate={{
        filter: ready
          ? `brightness(${dimmed ? 0.72 : 1.06}) saturate(1.05)`
          : 'brightness(0.86) saturate(0.95)',
        opacity: dimmed ? 0.75 : 1,
      }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <img src={ART[kind]} alt="" draggable={false} />

      {/* Luz calida del horno: respira al llegar, late durante la preparacion. */}
      <motion.span
        className={`machine-glow machine-glow--${kind}`}
        animate={
          busy
            ? { opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }
            : { opacity: ready ? 0.55 : 0, scale: 1 }
        }
        transition={
          busy
            ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.9, ease: 'easeOut' }
        }
      />
    </motion.div>
  );
}
