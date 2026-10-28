import { motion } from 'framer-motion';
import { FACADE, OPENINGS } from './geometry';
import { Machine } from './Machine';
import { Chef } from './Chef';

const pct = (n) => `${n * 100}%`;

const LABEL = {
  pizza: 'Ver la carta de pizzas',
  bocadillos: 'Ver la carta de bocadillos',
};

/**
 * Las capas de cerca del local: interior de los huecos, maquinas, fachada
 * recortada y cocinero.
 *
 * Toma el relevo de la plancha panoramica a mitad del acercamiento. Como esta
 * colocada sobre el rotulo medido de la plancha y vive dentro del mismo mundo,
 * el cambio es un fundido en el sitio: no hay salto de posicion ni de escala,
 * ni dos fachadas a la vez.
 */
export function Facade({ opacity, phase, selected, busy, delivered, onPick }) {
  const ready = phase === 'ready';
  const interactive = ready && !busy && !delivered;

  return (
    <motion.div
      className="facade"
      style={{
        left: pct(FACADE.left),
        top: pct(FACADE.top),
        width: pct(FACADE.width),
        height: pct(FACADE.height),
        opacity,
      }}
    >
      <span className="facade-shadow" aria-hidden />

      {/* Fondo del hueco, para que no se transparente el local de la plancha. */}
      {Object.entries(OPENINGS).map(([kind, o]) => (
        <span
          key={kind}
          className="opening-backing"
          style={{
            left: pct(o.x0),
            top: pct(o.y0),
            width: pct(o.x1 - o.x0),
            height: pct(o.y1 - o.y0),
          }}
        />
      ))}

      <Machine
        kind="pizza"
        ready={ready}
        busy={busy && selected === 'pizza'}
        dimmed={Boolean(selected) && selected !== 'pizza'}
      />
      <Machine
        kind="bocadillos"
        ready={ready}
        busy={busy && selected === 'bocadillos'}
        dimmed={Boolean(selected) && selected !== 'bocadillos'}
      />

      {/* El marco va por encima: recorta las maquinas y las mete dentro. */}
      <img className="facade-art" src="/assets/fachada.webp" alt="" draggable={false} />

      <Chef kind="pizza" visible={delivered === 'pizza'} />
      <Chef kind="bocadillos" visible={delivered === 'bocadillos'} />

      {/* Zonas clicables: los huecos enteros, para que el dedo tenga sitio.
          Deshabilitadas hasta que el acercamiento termina. */}
      {Object.entries(OPENINGS).map(([kind, o]) => (
        <button
          key={kind}
          type="button"
          className="opening-hit"
          style={{
            left: pct(o.x0),
            top: pct(o.y0),
            width: pct(o.x1 - o.x0),
            height: pct(o.y1 - o.y0),
          }}
          disabled={!interactive}
          aria-hidden={!ready}
          tabIndex={interactive ? 0 : -1}
          aria-label={LABEL[kind]}
          onClick={() => onPick(kind)}
        />
      ))}
    </motion.div>
  );
}
