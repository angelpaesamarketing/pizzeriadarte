import { useEffect } from 'react';

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
  useEffect(() => {
    if (!enabled) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    let raf = 0;
    let viajando = false;

    const cancelar = () => {
      cancelAnimationFrame(raf);
      viajando = false;
    };

    const viajar = (desde, hasta) => {
      viajando = true;
      const t0 = performance.now();
      const paso = (ahora) => {
        const k = Math.min(1, (ahora - t0) / duration);
        // Arranca y frena suave, para que el tranvia no entre de golpe.
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        window.scrollTo(0, desde + (hasta - desde) * e);
        if (k < 1) raf = requestAnimationFrame(paso);
        else viajando = false;
      };
      raf = requestAnimationFrame(paso);
    };

    const onWheel = (e) => {
      if (e.deltaY < 0) {
        if (viajando) cancelar();
        return;
      }
      if (viajando || e.deltaY <= 0) return;

      const el = sectionRef.current;
      if (!el) return;
      const fin = el.offsetTop + el.offsetHeight - window.innerHeight;
      const y = window.scrollY;
      // Solo desde el principio del recorrido; mas abajo, scroll normal.
      if (y > el.offsetTop + (fin - el.offsetTop) * 0.2) return;
      if (fin - y < 40) return;

      viajar(y, fin);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(raf);
    };
  }, [sectionRef, enabled, duration]);
}
