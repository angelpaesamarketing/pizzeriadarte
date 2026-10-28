import { motion } from 'framer-motion';
import { MACHINE_BOX, OVEN_MOUTH, FACADE_BOX_AR, FIGURE_AR } from './geometry';

/** Cada maquina tiene su cocinero, ya con el producto en las manos. */
const CHEF_ART = {
  pizza: '/assets/cocinero-pizza.webp',
  bocadillos: '/assets/cocinero-bocadillo.webp',
};

/** Alto del cocinero respecto a su maquina. */
const CHEF_SCALE = 0.82;

const pct = (n) => `${n * 100}%`;

/**
 * El cocinero sale de la boca del horno de su maquina y entrega el producto.
 *
 * Vive en coordenadas de la FACHADA, pero su sitio se deriva de la maquina, de
 * modo que sigue cuadrando si se recoloca el local.
 */
export function Chef({ kind, visible }) {
  const box = MACHINE_BOX[kind];
  const mouth = OVEN_MOUTH[kind];

  const height = box.height * CHEF_SCALE;
  const width = height * FACADE_BOX_AR * FIGURE_AR;
  const mouthX = box.left + mouth.x * box.width;
  const mouthY = box.top + mouth.y * box.height;
  const feetY = box.top + box.height; // pisa el suelo del hueco

  // Con el origen en los pies, encoger lo deja clavado en el suelo; este
  // desplazamiento lo sube hasta la boca del horno para el estado "dentro".
  const tuckedY = ((mouthY - feetY) / height) * 100;

  return (
    <motion.div
      className="chef"
      style={{
        left: pct(mouthX - width / 2),
        top: pct(feetY - height),
        width: pct(width),
        height: pct(height),
        transformOrigin: '50% 100%',
      }}
      initial={false}
      animate={
        visible
          ? { opacity: 1, scale: 1, y: '0%' }
          : { opacity: 0, scale: 0.18, y: `${tuckedY}%` }
      }
      transition={{
        type: 'spring',
        stiffness: 130,
        damping: 15,
        mass: 0.8,
        opacity: { duration: visible ? 0.28 : 0.2 },
      }}
    >
      {/* La sombra es lo que lo planta en el suelo: sin ella parece flotar
          aunque los pies esten donde tienen que estar. */}
      <span className="chef-sombra" aria-hidden />
      {/* Quieto: una vez fuera, se queda plantado. */}
      <img className="chef-art" src={CHEF_ART[kind]} alt="" draggable={false} />
    </motion.div>
  );
}
