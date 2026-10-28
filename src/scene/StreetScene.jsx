import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import { PHASE, phaseOf } from './geometry';
import { makeCamera, easeApproach } from './camera';
import { Facade } from './Facade';
import { Tram } from './Tram';
import { useViewport } from '../hooks/useViewport';
import { useOneScrollJump } from '../hooks/useOneScrollJump';

/**
 * Alto de la seccion, es decir cuanto scroll cuesta llegar al local.
 *
 * En escritorio son 150vh: el recorrido util es medio viewport, que se cubre
 * con un solo gesto de rueda o de trackpad. En movil se deja algo mas, porque
 * deslizar es barato y un recorrido muy corto se pasa de largo sin querer.
 */
export const SCENE_VH = { horizontal: 150, vertical: 200 };

/** Lo que tarda la maquina en "preparar" antes de que salga el cocinero. */
const PREP_MS = 1100;

/** Cuanto se aparta el local al abrirse la carta en escritorio. */
const ASIDE = 0.26;

export function StreetScene({ reduced, when, selected, busy, delivered, onPick, menuOpen }) {
  const sectionRef = useRef(null);
  const { vw, vh } = useViewport();
  const camera = useMemo(() => makeCamera(vw, vh), [vw, vh]);
  const night = when === 'noche';
  const plate = camera.g.art[when];
  const edge = camera.g.edge[when];
  const split = !camera.portrait;

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
   * hasta el plano general.
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

  // Avance de camara: 0 en el plano general, 1 en el plano cercano.
  const approach = useTransform(drive, [PHASE.wideUntil, PHASE.readyFrom], [0, 1], {
    clamp: true,
  });
  const t = useTransform(approach, easeApproach);

  // En escritorio, al abrir la carta el local se va a la izquierda y le deja
  // la mitad derecha de la pantalla. En movil no cabe, asi que no se mueve.
  const aside = useMotionValue(0);
  useEffect(() => {
    const target = split && menuOpen ? ASIDE : 0;
    const from = aside.get();
    if (from === target) return undefined;
    let raf = 0;
    const t0 = performance.now();
    const dur = 620;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      aside.set(from + (target - from) * e);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [split, menuOpen, aside]);

  const pose = useCameraPose(camera, t, aside);

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

  // Unica capa a distinta profundidad: crece mas deprisa y se sale por abajo.
  const fgScale = useTransform(t, [0, 0.55], [1, 1.55]);
  const fgY = useTransform(t, [0, 0.55], ['0%', '58%']);
  const fgOpacity = useTransform(t, [0.18, 0.5], [1, 0]);
  const vignette = useTransform(t, [0.45, 1], [0, 1]);

  const [phase, setPhase] = useState(reduced ? 'ready' : 'wide');
  useMotionValueEvent(drive, 'change', (v) => {
    setPhase((prev) => (phaseOf(v) === prev ? prev : phaseOf(v)));
  });
  useEffect(() => {
    if (reduced) setPhase('ready');
  }, [reduced]);

  const viajar = useOneScrollJump({ sectionRef, enabled: !reduced && !menuOpen });

  const skip = useCallback(() => {
    if (reduced) return;
    viajar();
  }, [reduced, viajar]);

  const ready = phase === 'ready';

  return (
    <section
      ref={sectionRef}
      className="scene"
      style={{
        height: reduced ? '100vh' : `${SCENE_VH[camera.set]}vh`,
        '--sky': edge.sky,
        '--floor': edge.floor,
      }}
    >
      <div className="scene-sticky">
        <img className="backdrop" src={plate.desenfocada} alt="" draggable={false} />

        <motion.div
          className="world"
          style={{
            width: camera.baseW,
            height: camera.baseH,
            x: pose.x,
            y: pose.y,
            scale: pose.scale,
            transformOrigin: '0 0',
          }}
        >
          <img className="plate" src={plate.calle} alt="" draggable={false} />
          <motion.img
            className="plate plate--blur"
            src={plate.desenfocada}
            alt=""
            draggable={false}
            style={{ opacity: blurOpacity }}
          />

          <Facade
            box={camera.g.facade}
            opacity={facadeOpacity}
            phase={phase}
            night={night}
            selected={selected}
            busy={busy}
            delivered={delivered}
            onPick={onPick}
          />

          <motion.img
            className="plate-foreground"
            src={plate.primerPlano}
            alt=""
            draggable={false}
            style={{ scale: fgScale, y: fgY, opacity: fgOpacity, transformOrigin: '50% 100%' }}
          />
        </motion.div>

        {!reduced && <Tram t={t} night={night} />}

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

/**
 * La posicion de camara depende de dos valores a la vez: el avance del scroll
 * y cuanto se ha apartado el local para dejar sitio a la carta. `useTransform`
 * solo encadena uno, asi que se recalculan los tres juntos cuando cambia
 * cualquiera de los dos.
 */
function useCameraPose(camera, t, aside) {
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const p = camera.at(t.get(), aside.get());
      scale.set(p.scale);
      x.set(p.x);
      y.set(p.y);
    };
    update();
    const offT = t.on('change', update);
    const offAside = aside.on('change', update);
    return () => {
      offT();
      offAside();
    };
  }, [camera, t, aside, scale, x, y]);

  return { scale, x, y };
}

function SceneOverlays({ t, ready, reduced, busy, selected, delivered, menuOpen, onSkip, onPick }) {
  const heroOpacity = useTransform(t, [0, 0.18], [1, 0]);
  const scrimOpacity = useTransform(t, [0.5, 0.95], [0, 1]);
  const showPrompt = ready && !busy && !delivered && !menuOpen;

  return (
    <div className={`overlays${menuOpen ? ' overlays--carta' : ''}`} aria-live="polite">
      <motion.div className="top-scrim" style={{ opacity: heroOpacity }} aria-hidden />

      <motion.div
        className="hero"
        style={{ opacity: heroOpacity, pointerEvents: ready ? 'none' : 'auto' }}
        aria-hidden={ready}
      >
        <p className="hero-line">Todo empieza con hambre</p>
        {!reduced && (
          <>
            <p className="hero-hint">Haz clic para ver la carta</p>
            <button
              type="button"
              className="pulso"
              onClick={onSkip}
              aria-label="Ir a las maquinas y ver la carta"
            >
              <span className="pulso-onda" aria-hidden />
              <span className="pulso-onda pulso-onda--tarde" aria-hidden />
              <span className="pulso-punto" aria-hidden />
            </button>
          </>
        )}
      </motion.div>

      <motion.div className="bottom-scrim" style={{ opacity: scrimOpacity }} aria-hidden />

      {showPrompt && (
        <motion.div
          className="prompt"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
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
