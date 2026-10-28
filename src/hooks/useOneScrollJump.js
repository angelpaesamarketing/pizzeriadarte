import { useCallback, useEffect, useRef } from 'react';

/**
 * Con un solo gesto de rueda, por minimo que sea, se recorre la calle entera
 * hasta las maquinas.
 *
 * No se bloquea la rueda ni se llama a preventDefault: simplemente, mientras
 * dura el viaje, se fija la posicion de scroll cada fotograma, asi que manda
 * la animacion. Si durante el trayecto se gira la rueda hacia arriba, se
 * cancela y se devuelve el control en el acto.
 *
 * Solo para raton y trackpad. En tactil no se activa: ahi un deslizamiento ya
 * recorre pantalla de sobra y adelantarse seria quitarle el control al dedo.
 */
export function useOneScrollJump({ sectionRef, enabled, duration = 2800 }) {
  const raf = useRef(0);
  const viajando = useRef(false);

  const cancelar = useCallback(() => {
    cancelAnimationFrame(raf.current);
    viajando.current = false;
  }, []);

  /** Recorre la calle entera hasta las maquinas. Lo usan la rueda y el clic. */
  const viajar = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const hasta = el.offsetTop + el.offsetHeight - window.innerHeight;
    const desde = window.scrollY;
    if (hasta - desde < 20) return;

    viajando.current = true;
    const t0 = performance.now();
    const paso = (ahora) => {
      const k = Math.min(1, (ahora - t0) / duration);
      // Arranca y frena suave, para que el tranvia no entre de golpe.
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      window.scrollTo(0, desde + (hasta - desde) * e);
      if (k < 1) raf.current = requestAnimationFrame(paso);
      else viajando.current = false;
    };
    raf.current = requestAnimationFrame(paso);
  }, [sectionRef, duration]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    const onWheel = (e) => {
      if (e.deltaY < 0) {
        if (viajando.current) cancelar();
        return;
      }
      if (viajando.current || e.deltaY <= 0) return;

      const el = sectionRef.current;
      if (!el) return;
      const fin = el.offsetTop + el.offsetHeight - window.innerHeight;
      // Solo desde el principio del recorrido; mas abajo, scroll normal.
      if (window.scrollY > el.offsetTop + (fin - el.offsetTop) * 0.2) return;

      viajar();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(raf.current);
    };
  }, [sectionRef, enabled, cancelar, viajar]);

  return viajar;
}
