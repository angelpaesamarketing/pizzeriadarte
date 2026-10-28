import { useEffect } from 'react';

/**
 * Congela el scroll de la pagina sin perder la posicion.
 *
 * Mientras la carta esta abierta la escena no se mueve: el zoom depende del
 * scroll, asi que si la pagina se desplazara por detras, al cerrar la carta el
 * encuadre habria cambiado. Con position:fixed tambien se evita el arrastre
 * de fondo en iOS.
 */
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    const y = window.scrollY;
    const { body } = document;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, y);
    };
  }, [locked]);
}
