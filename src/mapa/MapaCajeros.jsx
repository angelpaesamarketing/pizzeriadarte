import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CAJEROS, comoLlegar, enMetros, porCercania } from './cajeros';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

/**
 * El mapa de los cajeros.
 *
 * Replica el de pizzeriadarte24h.com: las mismas teselas de Esri, los mismos
 * marcadores con el logo, el mismo boton de «cajero mas cercano» por GPS y las
 * mismas rutas de Google Maps, que salen desde donde estas cuando lo sabe.
 *
 * Los datos salen de `cajeros.js`, que es la unica lista: si abre un cajero
 * nuevo se toca ahi y cambia en el mapa, en la ficha del pie y en los datos
 * estructurados a la vez.
 */
const LOGO = '/assets/logo.webp';
const TESELAS =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
const CREDITOS =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap';

function chincheta(c, masCercano) {
  const clase = c.id === masCercano ? 'nearest' : c.obrador ? 'obrador' : '';
  return L.divIcon({
    className: '',
    html: `<div class="pin ${clase}"><img src="${LOGO}" alt=""></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
}

function globo(c, desde, masCercano) {
  const dist = desde
    ? `<div class="sub">${enMetros(
        porCercania(desde).find((x) => x.id === c.id).d
      )} · ${c.id === masCercano ? 'Es el más cercano' : 'a pie'}</div>`
    : '';
  return `<div class="pop"><span class="street">${c.calle}</span>
    ${c.nota ? `<div class="sub">${c.nota}</div>` : ''}${dist}
    <a class="route" href="${comoLlegar(c, desde)}" target="_blank" rel="noopener">Cómo llegar</a></div>`;
}

export function MapaCajeros({ abierto, onClose }) {
  useBodyScrollLock(abierto);
  const lienzo = useRef(null);
  const mapa = useRef(null);
  const marcas = useRef({});
  const marcaYo = useRef(null);

  const [yo, setYo] = useState(null);
  const [masCercano, setMasCercano] = useState(null);
  const [activo, setActivo] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [error, setError] = useState(false);
  const [desplegada, setDesplegada] = useState(false);
  const cerrarRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    cerrarRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto, onClose]);

  useEffect(() => {
    if (!abierto || !lienzo.current || mapa.current) return undefined;
    const m = L.map(lienzo.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false, // que la rueda no secuestre el scroll del panel
    });
    L.tileLayer(TESELAS, { attribution: CREDITOS, maxZoom: 19 }).addTo(m);

    // Fuera el «Leaflet» (autopromocion de la libreria) y los creditos
    // plegados tras un icono, como en su web.
    m.attributionControl.setPrefix(false);
    const caja = m.attributionControl.getContainer();
    caja.setAttribute('role', 'button');
    caja.setAttribute('tabindex', '0');
    caja.setAttribute('aria-label', 'Créditos del mapa');
    const alternar = (e) => {
      if (!e.target.closest('a')) caja.classList.toggle('abierta');
    };
    caja.addEventListener('click', alternar);
    caja.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        caja.classList.toggle('abierta');
      }
    });

    CAJEROS.forEach((c) => {
      const mk = L.marker([c.lat, c.lng], { icon: chincheta(c, null), title: c.calle })
        .addTo(m)
        .on('click', () => setActivo(c.id));
      marcas.current[c.id] = mk;
    });
    mapa.current = m;
    return undefined;
  }, [abierto]);

  /**
   * El mapa se mide al crearse, y nace dentro de un panel que todavia esta
   * entrando: con el tamano equivocado salen teselas grises y el encuadre no
   * cuadra. Se vuelve a medir y a encuadrar cuando el panel ya esta quieto.
   */
  useEffect(() => {
    if (!abierto || !mapa.current) return undefined;
    const encuadrar = () => {
      mapa.current.invalidateSize();
      if (!yo) {
        mapa.current.fitBounds(
          L.latLngBounds(CAJEROS.map((c) => [c.lat, c.lng])),
          { padding: [40, 40] }
        );
      }
    };
    const t = setTimeout(encuadrar, 380);
    window.addEventListener('resize', encuadrar);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', encuadrar);
    };
  }, [abierto, yo]);

  useEffect(
    () => () => {
      mapa.current?.remove();
      mapa.current = null;
      marcas.current = {};
      marcaYo.current = null;
    },
    []
  );

  // Los globos y las chinchetas se rehacen cuando cambia la distancia o cual
  // es el mas cercano, que es lo que dicen por dentro.
  useEffect(() => {
    CAJEROS.forEach((c) => {
      const mk = marcas.current[c.id];
      if (!mk) return;
      mk.setIcon(chincheta(c, masCercano));
      mk.bindPopup(() => globo(c, yo, masCercano));
    });
  }, [yo, masCercano]);

  const elegir = useCallback((c, volar) => {
    setActivo(c.id);
    if (volar) {
      mapa.current?.flyTo([c.lat, c.lng], 16, { duration: 0.6 });
      marcas.current[c.id]?.openPopup();
    }
  }, []);

  const localizar = useCallback(() => {
    if (!navigator.geolocation) {
      setError(true);
      setAviso('Tu navegador no permite obtener la ubicación.');
      return;
    }
    setError(false);
    setAviso('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const aqui = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setYo(aqui);
        const cerca = porCercania(aqui)[0];
        setMasCercano(cerca.id);
        setActivo(cerca.id);
        setAviso(`El cajero más cercano está en ${cerca.calle}, a ${enMetros(cerca.d)}.`);

        const m = mapa.current;
        if (!m) return;
        marcaYo.current?.remove();
        marcaYo.current = L.marker([aqui.lat, aqui.lng], {
          icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
          title: 'Tu ubicación',
          zIndexOffset: 1000,
        })
          .addTo(m)
          .bindPopup('Estás aquí');
        m.flyToBounds(
          L.latLngBounds([
            [aqui.lat, aqui.lng],
            [cerca.lat, cerca.lng],
          ]),
          { padding: [60, 60], duration: 0.8 }
        );
        setTimeout(() => marcas.current[cerca.id]?.openPopup(), 900);
      },
      (err) => {
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

  // Se pintan los siete siempre; en movil los esconde el CSS mientras la
  // lista este plegada, que es como lo hace su web.
  const lista = porCercania(yo);

  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            className="mapa-fondo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.section
            className="mapa"
            role="dialog"
            aria-modal="true"
            aria-label="Cajeros de pizza en Zaragoza"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          >
            <header className="mapa-cabecera">
              <div>
                <h2>Nuestros cajeros</h2>
                <p>{CAJEROS.length} puntos en Zaragoza, abiertos las 24 horas</p>
              </div>
              <button type="button" className="locate" onClick={localizar}>
                Cajero m&aacute;s cercano
              </button>
              <button type="button" className="menu-close" onClick={onClose} ref={cerrarRef}>
                <span aria-hidden>&times;</span>
                <span className="sr-only">Cerrar el mapa</span>
              </button>
            </header>

            <div className="mapa-cuerpo">
              <div className="mapa-lienzo" ref={lienzo} />

              <div className={`mapa-panel${desplegada ? ' desplegada' : ''}`}>
                {aviso && (
                  <p className={`status${error ? ' err' : ''}`} role="status">
                    {aviso}
                  </p>
                )}

                <ul className="mapa-lista">
                  {lista.map((c) => (
                    <li key={c.id} className={c.id === activo ? 'es-activo' : undefined}>
                      {/* Sin envoltorio intermedio: un span en linea encoge al
                          contenido y entonces la fila de la nota no tiene
                          ancho sobre el que separar la distancia. */}
                      <button type="button" className="mapa-sitio" onClick={() => elegir(c, true)}>
                        <span className="mapa-calle">{c.calle}</span>
                        <span className="mapa-nota">
                          <span>{c.nota || 'Cajero de pizza 24 h'}</span>
                          {c.d != null && <em className="dist">{enMetros(c.d)}</em>}
                        </span>
                        {c.id === masCercano ? (
                          <span className="tag near">El m&aacute;s cercano a ti</span>
                        ) : (
                          c.obrador && <span className="tag obrador">Obrador</span>
                        )}
                      </button>
                      <a
                        className="mapa-ruta"
                        href={comoLlegar(c, yo)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        C&oacute;mo llegar
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Siempre montado: quien decide si se ve es el CSS, segun el
                    ancho de pantalla. Si dependiera de tener ubicacion, en movil
                    la lista saldria plegada y sin forma de abrirla. */}
                <button
                  type="button"
                  className="mapa-vermas"
                  aria-expanded={desplegada}
                  onClick={() => setDesplegada((v) => !v)}
                >
                  {desplegada
                    ? 'Ver solo el más cercano'
                    : `Ver los ${CAJEROS.length} cajeros`}
                </button>
              </div>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
