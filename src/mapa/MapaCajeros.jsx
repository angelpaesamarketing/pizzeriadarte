import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CAJEROS, comoLlegar, enMetros, porCercania } from './cajeros';
import { Mapa } from './Mapa';
import { useUbicacion } from './useUbicacion';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

/** La ventana del mapa: el mapa, la lista y el boton de cajero mas cercano. */
export function MapaCajeros({ abierto, onClose }) {
  useBodyScrollLock(abierto);
  const { yo, masCercano, aviso, error, localizar } = useUbicacion();
  const [elegido, setElegido] = useState(null);
  const [desplegada, setDesplegada] = useState(false);
  const cerrarRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    cerrarRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [abierto, onClose]);

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
              <Mapa yo={yo} masCercano={masCercano} elegido={elegido} onElegir={(c) => setElegido(c.id)} />

              <div className={`mapa-panel${desplegada ? ' desplegada' : ''}`}>
                {aviso && (
                  <p className={`status${error ? ' err' : ''}`} role="status">
                    {aviso}
                  </p>
                )}

                <ul className="mapa-lista">
                  {lista.map((c) => (
                    <li key={c.id} className={c.id === elegido ? 'es-activo' : undefined}>
                      <button type="button" className="mapa-sitio" onClick={() => setElegido(c.id)}>
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
                  {desplegada ? 'Ver solo el más cercano' : `Ver los ${CAJEROS.length} cajeros`}
                </button>
              </div>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
