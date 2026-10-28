import { useEffect, useState } from 'react';

/** Tamano del viewport, actualizado al redimensionar y al girar el movil. */
export function useViewport() {
  const [size, setSize] = useState(() => ({
    vw: typeof window === 'undefined' ? 1440 : window.innerWidth,
    vh: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));

  useEffect(() => {
    let frame = 0;
    const read = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setSize((prev) =>
          prev.vw === window.innerWidth && prev.vh === window.innerHeight
            ? prev
            : { vw: window.innerWidth, vh: window.innerHeight }
        )
      );
    };
    read();
    window.addEventListener('resize', read);
    window.addEventListener('orientationchange', read);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', read);
      window.removeEventListener('orientationchange', read);
    };
  }, []);

  return size;
}
