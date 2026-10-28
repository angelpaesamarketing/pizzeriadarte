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
export function Machine({ kind, night, ready, trabajando, dimmed }) {
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
        // Las maquinas viven bajo los focos del local, asi que de noche
        // practicamente no se tocan: lo que se oscurece es el exterior.
        filter: ready
          ? `brightness(${(dimmed ? 0.72 : 1.06) * (night ? 0.94 : 1)}) saturate(1.05)`
          : `brightness(${0.86 * (night ? 0.94 : 1)}) saturate(0.95)`,
        opacity: dimmed ? 0.75 : 1,
      }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <img src={ART[kind]} alt="" draggable={false} />

      {/* Luz calida del horno: respira al llegar y late sin parar mientras la
          maquina es la elegida, o sea desde que se pulsa hasta que se cierra
          la carta. */}
      <motion.span
        className={`machine-glow machine-glow--${kind}`}
        animate={
          trabajando
            ? { opacity: [0.5, 1, 0.5], scale: [1, 1.08, 1] }
            : { opacity: ready ? 0.55 : 0, scale: 1 }
        }
        transition={
          trabajando
            ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.9, ease: 'easeOut' }
        }
      />
    </motion.div>
  );
}
