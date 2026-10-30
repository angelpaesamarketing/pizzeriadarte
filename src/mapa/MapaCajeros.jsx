import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CAJEROS, comoLlegar } from './cajeros';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

/** Zaragoza, centrada entre todos los cajeros. */
const CENTRO = [41.6525, -0.8905];

/**
 * El mapa de los cajeros.
 *
 * Marcadores dibujados a mano con divIcon en vez de las chinchetas de
 * Leaflet: sus imagenes por defecto se cargan por ruta relativa y se rompen
 * al empaquetar, y ademas asi pegan con el resto de la web.
 */
function marcador(c, activo) {
  return L.divIcon({
    className: '',
    html: `<span class="pin${c.obrador ? ' pin--obrador' : ''}${activo ? ' pin--activo' : ''}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export function MapaCajeros({ abierto, onClose }) {
  useBodyScrollLock(abierto);
  const contenedor = useRef(null);
  const mapa = useRef(null);
  const marcas = useRef({});
  const [activo, setActivo] = useState(null);
  const cerrarRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    cerrarRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto, onClose]);

  useEffect(() => {
    if (!abierto || !contenedor.current || mapa.current) return undefined;

    const m = L.map(contenedor.current, {
      center: CENTRO,
      zoom: 13,
      scrollWheelZoom: false, // que la rueda no secuestre el scroll del panel
      attributionControl: true,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(m);

    CAJEROS.forEach((c) => {
      const mk = L.marker([c.lat, c.lng], { icon: marcador(c, false), title: c.calle })
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
      mapa.current.fitBounds(
        CAJEROS.map((c) => [c.lat, c.lng]),
        { padding: [36, 36] }
      );
    };
    const t = setTimeout(encuadrar, 380);
    window.addEventListener('resize', encuadrar);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', encuadrar);
    };
  }, [abierto]);

  useEffect(() => () => {
    mapa.current?.remove();
    mapa.current = null;
    marcas.current = {};
  }, []);

  useEffect(() => {
    CAJEROS.forEach((c) => marcas.current[c.id]?.setIcon(marcador(c, c.id === activo)));
  }, [activo]);

  const enfocar = (c) => {
    setActivo(c.id);
    mapa.current?.flyTo([c.lat, c.lng], 16, { duration: 0.6 });
  };

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
              <button type="button" className="menu-close" onClick={onClose} ref={cerrarRef}>
                <span aria-hidden>&times;</span>
                <span className="sr-only">Cerrar el mapa</span>
              </button>
            </header>

            <div className="mapa-cuerpo">
              <div className="mapa-lienzo" ref={contenedor} />

              <ul className="mapa-lista">
                {CAJEROS.map((c) => (
                  <li key={c.id} className={c.id === activo ? 'es-activo' : undefined}>
                    <button type="button" className="mapa-sitio" onClick={() => enfocar(c)}>
                      <span className={`pin${c.obrador ? ' pin--obrador' : ''}`} aria-hidden />
                      <span>
                        <span className="mapa-calle">{c.calle}</span>
                        <span className="mapa-nota">{c.nota || 'Cajero de pizza 24 h'}</span>
                      </span>
                    </button>
                    <a
                      className="mapa-ruta"
                      href={comoLlegar(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      C&oacute;mo llegar
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
