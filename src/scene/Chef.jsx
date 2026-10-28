import { motion } from 'framer-motion';
import { MACHINE_BOX, OVEN_MOUTH, FACADE_BOX_AR, FIGURE_AR } from './geometry';

/**
 * El cocinero y el producto que entrega.
 *
 * Del bocadillo hay un asset del cocinero ya sosteniendolo, asi que sale con
 * el en la mano. De la pizza todavia no: el asset disponible es el del
 * cocinero saludando, con la mano en alto y nada que sujetar. Antes que
 * pegarle una pizza flotando al lado de la cabeza, la pizza sale del propio
 * horno mientras el saluda; se lee igual de bien y no hay pegote.
 *
 * Cuando exista `cocinero-pizza.webp` (misma pose y encuadre que el del
 * bocadillo) basta con cambiar `chef` aqui y quitar `fromOven`.
 */
const CAST = {
  pizza: {
    chef: '/assets/cocinero-saluda.webp',
    // El producto nace en la boca del horno y se adelanta hacia el espectador.
    fromOven: { art: '/assets/pizza.webp', width: 0.62, tilt: -7 },
    side: -1, // se aparta hacia fuera para no tapar la maquina
  },
  bocadillos: {
    chef: '/assets/cocinero-bocadillo.webp',
    fromOven: null,
    side: 1,
  },
};

/** Alto del cocinero respecto a su maquina. */
const CHEF_SCALE = 0.82;
/** Cuanto se aparta del eje de la maquina, en anchos de cocinero. */
const SIDE_SHIFT = 0.2;

const pct = (n) => `${n * 100}%`;

export function Chef({ kind, visible }) {
  const cast = CAST[kind];
  const box = MACHINE_BOX[kind];
  const mouth = OVEN_MOUTH[kind];

  // Vive en coordenadas de la FACHADA, pero su sitio se deriva de la boca del
  // horno de su maquina: de ahi sale y hacia ahi vuelve.
  const height = box.height * CHEF_SCALE;
  const width = height * FACADE_BOX_AR * FIGURE_AR;
  const mouthX = box.left + mouth.x * box.width;
  const mouthY = box.top + mouth.y * box.height;
  const feetY = box.top + box.height; // pisa el suelo del hueco
  const restX = mouthX + cast.side * SIDE_SHIFT * width;

  // Con el origen en los pies, encoger lo deja clavado en el suelo; este
  // desplazamiento lo sube hasta la boca del horno para el estado "dentro".
  const tuckedY = ((mouthY - feetY) / height) * 100;

  const oven = cast.fromOven;
  const ovenW = oven ? box.width * oven.width : 0;

  return (
    <>
      <motion.div
        className="chef"
        style={{
          left: pct(restX - width / 2),
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
        <motion.img
          className="chef-art"
          src={cast.chef}
          alt=""
          draggable={false}
          animate={visible ? { y: [0, -5, 0] } : { y: 0 }}
          transition={
            visible
              ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }
              : { duration: 0.2 }
          }
        />
      </motion.div>

      {oven && (
        <motion.img
          className="oven-product"
          src={oven.art}
          alt=""
          draggable={false}
          style={{
            left: pct(mouthX - ovenW / 2),
            top: pct(mouthY - ovenW * 0.22),
            width: pct(ovenW),
            transformOrigin: '50% 50%',
          }}
          initial={false}
          animate={
            visible
              ? { opacity: 1, scale: 1, x: pct(-cast.side * 0.42), y: '28%', rotate: oven.tilt }
              : { opacity: 0, scale: 0.3, x: '0%', y: '0%', rotate: 0 }
          }
          transition={{
            type: 'spring',
            stiffness: 110,
            damping: 17,
            delay: visible ? 0.3 : 0,
            opacity: { duration: 0.3, delay: visible ? 0.3 : 0 },
          }}
        />
      )}
    </>
  );
}
