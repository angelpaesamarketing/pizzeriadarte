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
  /**
   * El destino se recalcula en cada fotograma, no se fija al empezar.
   *
   * En movil la altura del viewport cambia sola mientras se desplaza, porque
   * la barra del navegador se recoge. Si el destino se calcula una vez al
   * principio, el viaje se queda corto y el local llega sin estar listo: hay
   * que dar otro scroll para poder elegir maquina.
   */
  const destino = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return 0;
    const finSeccion = el.offsetTop + el.offsetHeight - window.innerHeight;
    const finPagina = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(finSeccion, finPagina);
  }, [sectionRef]);

  const viajar = useCallback(() => {
    const desde = window.scrollY;
    if (destino() - desde < 20) return;

    viajando.current = true;
    const t0 = performance.now();
    const paso = (ahora) => {
      const k = Math.min(1, (ahora - t0) / duration);
      /**
       * Sale ya y frena al llegar, pero con una curva suave.
       *
       * Con un exponente alto el recorrido se come casi entero en el primer
       * instante, y el tranvia -que cruza al principio- pasaba en cuatro
       * decimas. Con 1,6 el reparto es mas parejo y se le ve pasar, sin
       * volver a meter la pausa que habia antes del clic.
       */
      const e = 1 - Math.pow(1 - k, 1.6);
      const hasta = destino();
      window.scrollTo(0, desde + (hasta - desde) * e);
      if (k < 1) raf.current = requestAnimationFrame(paso);
      else {
        window.scrollTo(0, destino());
        viajando.current = false;
      }
    };
    raf.current = requestAnimationFrame(paso);
  }, [destino, duration]);

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
      // Solo desde el principio del recorrido; mas abajo, scroll normal.
      if (window.scrollY > el.offsetTop + (destino() - el.offsetTop) * 0.2) return;

      viajar();
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(raf.current);
    };
  }, [sectionRef, enabled, cancelar, viajar, destino]);

  return viajar;
}
