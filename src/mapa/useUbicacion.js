import { useCallback, useState } from 'react';
import { enMetros, porCercania } from './cajeros';

/**
 * Donde esta quien mira y cual es su cajero mas cercano.
 *
 * Vive aparte del mapa porque lo usan dos sitios a la vez: la ventana del
 * mapa y la seccion «Donde estamos» del pie. Los mensajes son los mismos que
 * los de pizzeriadarte24h.com, palabra por palabra.
 */
export function useUbicacion() {
  const [yo, setYo] = useState(null);
  const [masCercano, setMasCercano] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [error, setError] = useState(false);
  const [buscando, setBuscando] = useState(false);

  const localizar = useCallback(() => {
    if (!navigator.geolocation) {
      setError(true);
      setAviso('Tu navegador no permite obtener la ubicación.');
      return;
    }
    setError(false);
    setBuscando(true);
    setAviso('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const aqui = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const cerca = porCercania(aqui)[0];
        setYo(aqui);
        setMasCercano(cerca.id);
        setBuscando(false);
        setAviso(`El cajero más cercano está en ${cerca.calle}, a ${enMetros(cerca.d)}.`);
      },
      (err) => {
        setBuscando(false);
        setError(true);
        setAviso(
          err.code === 1
            ? 'No se pudo acceder a tu ubicación. Permite el acceso en el navegador y vuelve a intentarlo.'
            : 'No se pudo obtener tu ubicación. Inténtalo de nuevo en unos segundos.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { yo, masCercano, aviso, error, buscando, localizar };
}
