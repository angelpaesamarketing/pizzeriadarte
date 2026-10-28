import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MENU } from './menuData';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

/**
 * La carta de la categoria elegida.
 *
 * Mientras esta abierta la pagina no se desplaza (ver useBodyScrollLock), asi
 * que el encuadre de la calle se queda donde estaba; el panel tiene su propio
 * scroll interno. Al cerrar se recupera la posicion exacta y con ella el plano
 * cercano del local.
 */
export function MenuPanel({ category, onClose }) {
  const open = Boolean(category);
  useBodyScrollLock(open);

  const closeRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const data = category ? MENU[category] : null;

  return (
    <AnimatePresence>
      {data && (
        <>
          <motion.div
            className="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.aside
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label={`Carta de ${data.title.toLowerCase()}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 30 }}
          >
            <header className="menu-head">
              <img src={data.art} alt="" className="menu-art" draggable={false} />
              <div>
                <h2>{data.title}</h2>
                <p>{data.tagline}</p>
              </div>
              <button type="button" className="menu-close" onClick={onClose} ref={closeRef}>
                <span aria-hidden>&times;</span>
                <span className="sr-only">Cerrar la carta</span>
              </button>
            </header>

            <div className="menu-scroll">
              {data.sections.map((section) => (
                <section key={section.name} className="menu-section">
                  <h3>{section.name}</h3>
                  <ul>
                    {section.items.map((item) => (
                      <li key={item.name}>
                        {item.foto && (
                          <img
                            className="producto-foto"
                            src={item.foto}
                            alt={item.name}
                            loading="lazy"
                            draggable={false}
                          />
                        )}
                        <div>
                          <p className="item-name">{item.name}</p>
                          <p className="item-desc">{item.desc}</p>
                        </div>
                        <p className="item-price">{item.price} &euro;</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              <p className="menu-foot">
                Abierto 24 horas. Paga con tarjeta o movil en la propia m&aacute;quina.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
