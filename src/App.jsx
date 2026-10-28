import { useCallback, useEffect, useRef, useState } from 'react';
import { StreetScene, PREP_MS } from './scene/StreetScene';
import { MenuPanel } from './menu/MenuPanel';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useTimeOfDay } from './hooks/useTimeOfDay';

/**
 * Orden de los estados al elegir una maquina:
 *   pick -> busy (la maquina prepara) -> delivered (sale el cocinero)
 *                                     -> se abre la carta
 * En escritorio la carta no tapa el local: este se aparta a la izquierda y
 * sigue viendose trabajar mientras se lee lo que hay.
 */
export default function App() {
  const reduced = usePrefersReducedMotion();
  const when = useTimeOfDay();

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

      const prep = reduced ? 250 : PREP_MS;
      timers.current.push(
        setTimeout(() => {
          setBusy(false);
          setDelivered(kind);
        }, prep),
        // La carta entra casi pisando al cocinero: en escritorio se apartan
        // a la vez, el local a la izquierda y la carta desde la derecha.
        setTimeout(() => setMenu(kind), prep + (reduced ? 120 : 420))
      );
    },
    [busy, delivered, reduced, clearTimers]
  );

  const closeMenu = useCallback(() => {
    clearTimers();
    setMenu(null);
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
        when={when}
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
