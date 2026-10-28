# Pizzeria D'Arte

Web de la pizzeria. Se entra desde la acera de enfrente y el scroll acerca la
camara hasta el local, donde estan las dos maquinas.

```
npm install
npm run dev      # desarrollo
npm run build    # a dist/
```

## Como funciona el acercamiento

No hay una sucesion de secciones con imagenes distintas: hay **una sola escena**
y una sola camara. Dentro de `.world` conviven la panoramica de la calle, la
fachada recortada, las maquinas y el cocinero, todos colocados en porcentajes de
la misma caja. La camara es un unico `translate() scale()` aplicado a esa caja,
asi que las capas no pueden descolgarse entre si.

El scroll **no dispara** una animacion: la alimenta. Todo se deriva de
`scrollYProgress` con `useTransform`, de modo que subir la rueda deshace el
acercamiento por el mismo camino.

Fases (`src/scene/geometry.js`):

| Progreso    | Que pasa                                                  |
|-------------|-----------------------------------------------------------|
| 0 – 0,06    | Plano general. «Todo empieza con hambre».                  |
| 0,06 – 0,40 | La camara avanza. Las vias se salen por abajo (paralaje).  |
| 0,40 – 0,66 | Las capas del local relevan a la panoramica.               |
| 0,66 – 0,88 | Empuje final hasta el plano cercano.                       |
| 0,88 – 1    | Local listo: se encienden las maquinas y se pueden pulsar. |

## De donde salen los numeros

Las constantes de `geometry.js` estan **medidas**, no estimadas:

1. Se localiza el rotulo de seto verde en la panoramica y en `fachada.webp`.
2. Se encaja uno sobre otro por el **ancho** y por el **borde inferior**.
3. Se renderizan las dos capas por separado en el navegador y se mide el
   residuo, que ahora es de 1 px.

El borde superior del rotulo **no** sirve de referencia: en la foto es un panel
plano y en el asset 3D es un seto con volumen cuya cara de arriba se ve. Encajar
por arriba produce dos rotulos durante el fundido.

Aun alineadas, las letras de la foto y las del 3D estan dibujadas distinto, asi
que la panoramica pasa a desenfoque **antes** del relevo: cuando se intercambian
las capas la foto ya esta blanda y el cambio no se nota. Ese desenfoque hace
ademas de profundidad de campo.

Los huecos de la fachada, las cajas de las maquinas y las bocas de los hornos
salen del canal alfa de los propios assets, de manera que todo sigue encajando
si se cambia el encuadre del local.

## Que hace falta mirar si se tocan los assets

Si se sustituye `calle.webp` o `fachada.webp` hay que **rehacer la medida** del
paso 2, o las capas dejaran de encajar. El resto (maquinas, cocinero, huecos) se
recalcula solo a partir de `FACADE`.

## Accesibilidad

- `prefers-reduced-motion`: se entra directamente al plano cercano y la pagina
  mide exactamente una pantalla, sin recorrido de scroll.
- Boton «Ir a las maquinas» para saltarse el acercamiento.
- No se secuestra la rueda ni se bloquea el scroll normal: la escena es una
  seccion `sticky` gobernada por el progreso de desplazamiento.
- Las maquinas son botones con etiqueta, alcanzables con el tabulador, y estan
  deshabilitadas hasta que termina el acercamiento.
- La carta se cierra con Escape.

## La carta

En `src/menu/menuData.js`. Nombres y precios son de ejemplo.

## Assets

En `public/assets/`. `calle-primer-plano.webp` (la franja de acera y vias del
paralaje) y `calle-desenfocada.webp` se generan a partir de `calle.webp`; si se
cambia la panoramica hay que regenerarlas.
