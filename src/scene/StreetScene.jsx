import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import { FOREGROUND_TOP, PHASE, PLATE_EDGE, phaseOf } from './geometry';
import { makeCamera, easeApproach } from './camera';
import { Facade } from './Facade';
import { useViewport } from '../hooks/useViewport';

/** Alto de la seccion: cuanto scroll cuesta recorrer la calle entera. */
export const SCENE_VH = 300;

/** Lo que tarda la maquina en "preparar" antes de que salga el cocinero. */
const PREP_MS = 1600;

export function StreetScene({ reduced, selected, busy, delivered, onPick, onSkip, menuOpen }) {
  const sectionRef = useRef(null);
  const { vw, vh } = useViewport();
  const camera = useMemo(() => makeCamera(vw, vh), [vw, vh]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  /**
   * `drive` es el progreso que realmente manda sobre la escena. Normalmente
   * copia el scroll, pero se puede congelar.
   *
   * Hace falta porque bloquear el scroll de la pagina obliga a poner el body
   * en position:fixed, y eso deja window.scrollY en cero: si la camara leyera
   * el scroll directamente, al abrir la carta el local se alejaria de golpe
   * hasta el plano general. Congelando el valor, la escena se queda donde
   * estaba y al cerrar sigue donde la dejamos.
   */
  const drive = useMotionValue(reduced ? 1 : 0);
  const frozen = useRef(false);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!reduced && !frozen.current) drive.set(v);
  });

  useEffect(() => {
    if (reduced) {
      drive.set(1);
      return;
    }
    frozen.current = menuOpen;
    if (!menuOpen) drive.set(scrollYProgress.get());
  }, [menuOpen, reduced, drive, scrollYProgress]);

  useEffect(() => {
    if (!reduced) drive.set(scrollYProgress.get());
  }, [reduced, drive, scrollYProgress]);

  // Avance de camara: 0 en el plano general, 1 en el plano cercano. Es una
  // lectura del scroll, no una animacion disparada, asi que subir lo revierte.
  const approach = useTransform(drive, [PHASE.wideUntil, PHASE.readyFrom], [0, 1], {
    clamp: true,
  });
  const t = useTransform(approach, easeApproach);

  const scale = useTransform(t, (v) => camera.at(v).scale);
  const x = useTransform(t, (v) => camera.at(v).x);
  const y = useTransform(t, (v) => camera.at(v).y);

  // Las capas del local relevan a la plancha a mitad de camino.
  const facadeOpacity = useTransform(t, [0.4, 0.66], [0, 1]);
  /**
   * La plancha se va a desenfoque ANTES del relevo, no despues.
   *
   * El rotulo de la foto y el de la fachada 3D estan dibujados distinto: con
   * las dos capas nitidas al 50% se leen dos veces las mismas letras. Si para
   * entonces la foto ya esta blanda, el cambio pasa desapercibido. De paso da
   * la profundidad de campo que separa el local de los vecinos.
   */
  const blurOpacity = useTransform(t, [0.3, 0.56, 1], [0, 0.8, 0.92]);

  // Primer plano: crece mas deprisa que el resto y se sale por abajo.
  const fgScale = useTransform(t, [0, 0.55], [1, 1.55]);
  const fgY = useTransform(t, [0, 0.55], ['0%', '58%']);
  const fgOpacity = useTransform(t, [0.18, 0.5], [1, 0]);
  const vignette = useTransform(t, [0.45, 1], [0, 1]);

  const [phase, setPhase] = useState(reduced ? 'ready' : 'wide');
  useMotionValueEvent(drive, 'change', (v) => {
    setPhase((prev) => {
      const next = phaseOf(v);
      return next === prev ? prev : next;
    });
  });
  useEffect(() => {
    if (reduced) setPhase('ready');
  }, [reduced]);

  const skip = useCallback(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;
    const end = el.offsetTop + el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: end, behavior: 'smooth' });
    onSkip?.();
  }, [reduced, onSkip]);

  const ready = phase === 'ready';

  return (
    <section
      ref={sectionRef}
      className="scene"
      style={{
        height: reduced ? '100vh' : `${SCENE_VH}vh`,
        '--sky': PLATE_EDGE.sky,
        '--floor': PLATE_EDGE.floor,
      }}
    >
      <div className="scene-sticky">
        <img className="backdrop" src="/assets/calle-desenfocada.webp" alt="" draggable={false} />

        <motion.div
          className="world"
          style={{
            width: camera.baseW,
            height: camera.baseH,
            x,
            y,
            scale,
            transformOrigin: '0 0',
          }}
        >
          <img className="plate" src="/assets/calle.webp" alt="" draggable={false} />
          <motion.img
            className="plate plate--blur"
            src="/assets/calle-desenfocada.webp"
            alt=""
            draggable={false}
            style={{ opacity: blurOpacity }}
          />

          <Facade
            opacity={facadeOpacity}
            phase={phase}
            selected={selected}
            busy={busy}
            delivered={delivered}
            onPick={onPick}
          />

          <motion.img
            className="plate-foreground"
            src="/assets/calle-primer-plano.webp"
            alt=""
            draggable={false}
            style={{
              top: `${FOREGROUND_TOP * 100}%`,
              scale: fgScale,
              y: fgY,
              opacity: fgOpacity,
              transformOrigin: '50% 100%',
            }}
          />
        </motion.div>

        <motion.div className="vignette" style={{ opacity: vignette }} aria-hidden />

        <SceneOverlays
          t={t}
          ready={ready}
          reduced={reduced}
          busy={busy}
          selected={selected}
          delivered={delivered}
          menuOpen={menuOpen}
          onSkip={skip}
          onPick={onPick}
        />
      </div>
    </section>
  );
}

function SceneOverlays({ t, ready, reduced, busy, selected, delivered, menuOpen, onSkip, onPick }) {
  const heroOpacity = useTransform(t, [0, 0.18], [1, 0]);
  const scrimOpacity = useTransform(t, [0.5, 0.95], [0, 1]);

  const showPrompt = ready && !busy && !delivered && !menuOpen;

  return (
    <div className="overlays" aria-live="polite">
      <motion.div className="hero" style={{ opacity: heroOpacity }} aria-hidden={ready}>
        <p className="hero-line">Todo empieza con hambre</p>
        {!reduced && <p className="hero-hint">Haz scroll para acercarte</p>}
      </motion.div>

      <motion.div className="bottom-scrim" style={{ opacity: scrimOpacity }} aria-hidden />

      {showPrompt && (
        <motion.div
          className="prompt"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p className="prompt-title">&iquest;Pizza o bocata?</p>
          <div className="prompt-actions">
            <button type="button" onClick={() => onPick('pizza')}>
              Pizzas
            </button>
            <button type="button" onClick={() => onPick('bocadillos')}>
              Bocadillos
            </button>
          </div>
        </motion.div>
      )}

      {busy && (
        <p className="prepping">
          Preparando {selected === 'pizza' ? 'tu pizza' : 'tu bocadillo'}&hellip;
        </p>
      )}

      {!reduced && !ready && (
        <button type="button" className="skip" onClick={onSkip}>
          Ir a las m&aacute;quinas
        </button>
      )}
    </div>
  );
}

export { PREP_MS };
