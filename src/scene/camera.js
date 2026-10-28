import { PLATE_AR, FOCUS, framing } from './geometry';

/**
 * Una sola camara para toda la escena.
 *
 * El mundo es un div de tamano fijo (`baseW` x `baseH`, con el aspecto de la
 * panoramica) y todo lo que hay dentro -plancha, fachada, maquinas, cocinero-
 * se posiciona en porcentajes de esa caja. La camara es un unico
 * `translate() scale()` aplicado al mundo entero, asi que las capas no pueden
 * descolgarse entre si: no hay dos animaciones que sincronizar.
 *
 * `transform-origin` es 0 0, de modo que un punto (fx, fy) del mundo cae en
 * pantalla en  tx + fx * baseW * s  ,  ty + fy * baseH * s.
 * Despejando para que el foco caiga donde queremos salen tx y ty.
 */
export function makeCamera(vw, vh) {
  const baseW = Math.max(vw, 1);
  const baseH = baseW / PLATE_AR;
  const { vwfFar, vwfNear, focusScreen, portrait } = framing(vw, vh);

  /** @param t 0 = plano general, 1 = plano cercano del local. */
  function at(t) {
    const vwf = vwfFar + (vwfNear - vwfFar) * t;
    const scale = vw / vwf / baseW;

    const sx = focusScreen.farX + (focusScreen.nearX - focusScreen.farX) * t;
    const sy = focusScreen.farY + (focusScreen.nearY - focusScreen.farY) * t;

    return {
      scale,
      x: sx * vw - FOCUS.x * baseW * scale,
      y: sy * vh - FOCUS.y * baseH * scale,
    };
  }

  return { baseW, baseH, at, portrait };
}

/**
 * Suavizado del avance. Arranca y termina despacio para que el acercamiento
 * no de un tiron al entrar ni al llegar, pero sigue siendo una funcion pura
 * del scroll: subir la rueda lo deshace por el mismo camino.
 */
export function easeApproach(p) {
  const t = Math.min(1, Math.max(0, p));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
