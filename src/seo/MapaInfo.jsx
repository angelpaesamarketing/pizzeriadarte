import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Mapa = lazy(() => import('../mapa/Mapa').then((m) => ({ default: m.Mapa })));

/** Cuanto antes de llegar se empieza a descargar el mapa. */
const MARGEN = 400;

/**
 * El mapa dentro de «Donde estamos», cargado al acercarse a el.
 *
 * Leaflet son unos 46 KB comprimidos y esta seccion vive al final de la
 * pagina, detras de toda la escena: cargarlo al abrir la web seria pagarlo
 * para casi nadie.
 *
 * Se mira la posicion en cada scroll en vez de usar IntersectionObserver.
 * Este solo avisa al CRUZAR el umbral, y quien llega al pie de un salto -un
 * enlace con ancla, o el navegador recuperando la posicion al recargar- pasa
 * de estar debajo a estar encima sin cruzar nada, asi que el mapa no se
 * cargaba nunca. Comprobar la caja no tiene ese agujero.
 */
export function MapaInfo(props) {
  const hueco = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return undefined;
    let pedido = 0;

    const mirar = () => {
      pedido = 0;
      const el = hueco.current;
      if (!el) return;
      // Cerca por abajo, o ya pasada: en los dos casos toca cargarlo.
      if (el.getBoundingClientRect().top < window.innerHeight + MARGEN) {
        setVisible(true);
      }
    };
    const alMover = () => {
      if (!pedido) pedido = requestAnimationFrame(mirar);
    };

    mirar();
    window.addEventListener('scroll', alMover, { passive: true });
    window.addEventListener('resize', alMover);
    return () => {
      cancelAnimationFrame(pedido);
      window.removeEventListener('scroll', alMover);
      window.removeEventListener('resize', alMover);
    };
  }, [visible]);

  return (
    <div className="info-mapa" ref={hueco}>
      {visible && (
        <Suspense fallback={null}>
          <Mapa {...props} className="info-mapa-lienzo" />
        </Suspense>
      )}
    </div>
  );
}
