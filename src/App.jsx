import { useCallback, useEffect, useRef, useState } from 'react';
import { StreetScene, PREP_MS } from './scene/StreetScene';
import { MenuPanel } from './menu/MenuPanel';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

/**
 * Orden de los estados al elegir una maquina:
 *   pick -> busy (la maquina prepara) -> delivered (sale el cocinero)
 *                                     -> se abre la carta
 * Al cerrar la carta el cocinero se retira y el local vuelve a quedar listo,
 * con el mismo encuadre cercano.
 */
export default function App() {
  const reduced = usePrefersReducedMotion();

  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [delivered, setDelivered] = useState(null);
  const [menu, setMenu] = useState(null);

  const timers = useRef([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const pick = useCallback(
    (kind) => {
      if (busy || delivered) return;
      clearTimers();
      setSelected(kind);
      setBusy(true);

      const prep = reduced ? 300 : PREP_MS;
      timers.current.push(
        setTimeout(() => {
          setBusy(false);
          setDelivered(kind);
        }, prep),
        setTimeout(() => setMenu(kind), prep + (reduced ? 150 : 1400))
      );
    },
    [busy, delivered, reduced, clearTimers]
  );

  const closeMenu = useCallback(() => {
    clearTimers();
    setMenu(null);
    // El cocinero se retira un poco despues, para que no desaparezca de golpe
    // a la vez que el panel.
    timers.current.push(
      setTimeout(() => {
        setDelivered(null);
        setSelected(null);
      }, 320)
    );
  }, [clearTimers]);

  return (
    <main>
      <StreetScene
        reduced={reduced}
        selected={selected}
        busy={busy}
        delivered={delivered}
        menuOpen={Boolean(menu)}
        onPick={pick}
      />
      <MenuPanel category={menu} onClose={closeMenu} />
    </main>
  );
}
