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
| 0 – 0,05    | Plano general. «Todo empieza con hambre».                  |
| 0,05 – 0,30 | La camara avanza por la calle.                             |
| 0,00 – 0,33 | Cruza el tranvia por delante, desde el primer momento.     |
| 0,40 – 0,66 | Las capas del local relevan a la calle.                    |
| 0,66 – 0,90 | Empuje final hasta el plano cercano.                       |
| 0,90 – 1    | Local listo: se encienden las maquinas y se pueden pulsar. |

Al elegir una, su horno late sin parar hasta que se cierra la carta, y el de
la otra se queda quieto. En movil la carta tapa el local, asi que las luces
laten en la maquina que asoma por encima del panel, que es la que se ve.

El recorrido son 150vh en escritorio y 200vh en movil.

La invitacion de la portada es un **clic**: un circulo blanco que late debajo
de «Haz clic para ver la carta» marca donde pulsar y lanza el recorrido.

En escritorio, ademas, **un solo golpe de rueda recorre la calle entera**
(`useOneScrollJump`), y es el mismo viaje que dispara ese clic. No se bloquea la rueda ni se llama a preventDefault:
mientras dura el viaje se fija la posicion de scroll cada fotograma, asi que
manda la animacion; si se gira la rueda hacia arriba, se cancela y se devuelve
el control en el acto. En tactil no se activa, porque ahi un deslizamiento ya
recorre pantalla de sobra y adelantarse seria quitarle el control al dedo.

## Dos juegos de plancha

La panoramica apaisada arranca a media fachada, sin tejado ni cielo. En un
movil alto no hay nada que ensenar por arriba, asi que el edificio sale
cortado. Por eso hay un segundo juego de imagenes **vertical** que trae el
edificio entero, y `plateSetFor()` elige segun la orientacion.

Cada juego tiene su propia caja de fachada medida, porque encuadran el local
en sitios distintos. Lo demas -maquinas, cocinero, huecos- se deriva de esa
caja y vale para los dos.

En vertical, el recorte sobrante se manda **abajo**, no se reparte: arriba
esta el tejado, que es lo que da a entender que es un edificio entero; abajo
solo hay acera.

## El tranvia

Cruza por delante durante el acercamiento, y es **el que marca el cambio de
plano**: la acera y las vias no tienen animacion propia, acompanan al resto
del mundo. Antes se iban por abajo con un paralaje que, con el tranvia
delante, sobraba. Va en coordenadas de pantalla, no
del mundo: esta mucho mas cerca de la camara que la fachada, asi que ni
comparte lienzo ni hereda su escala.

El recorrido se mide contra el ancho de la PANTALLA, no contra el del
tranvia. Con porcentajes se desplazaba un 108% de su propio ancho a cada
lado -2.340 px en escritorio- y hacia la mayor parte del camino fuera de
cuadro: cruzaba en cuatro decimas. Midiendolo asi entra justo por un borde y
sale por el otro, y tarda 855 ms.

Al entrar suena la campana (): no es un fichero, son cuatro
senos con los armonicos desafinados, que es lo que hace que suene a metal y
no a pitido. Si el navegador no deja sonar sin un gesto previo, no pasa nada.

El desenfoque de movimiento se pone por CSS, no en el asset, para que
acompane a la velocidad en vez de ser una cantidad fija pintada en la imagen.
El alto y el desplome estan calculados para que las ruedas caigan sobre las
vias: en el asset el cuerpo acaba al 73,4% del alto, asi que por debajo le
sobra un 26,6% que hay que sacar fuera de la pantalla.

## Por que el cocinero no lleva `will-change`

Promocionarlo a capa propia hace que el navegador lo rasterice a su tamano
**sin escalar** y luego amplie ese mapa de bits con el zoom del mundo: sale
borroso al lado de las maquinas, que no estan promocionadas y se rasterizan
ya a la escala final. Lo mismo vale para cualquier cosa que se meta dentro
de `.world`.

Y los pies van un 5% por delante del fondo del hueco: plantado justo al
fondo queda sobre el suelo oscuro del portal, donde la sombra de contacto no
se ve y parece flotar aunque este bien colocado.

## El plano partido de escritorio

Al elegir maquina, el local se aparta a la izquierda y la carta entra por la
derecha, asi que se ven las dos cosas a la vez: la maquina trabajando y lo que
se puede pedir. El desplazamiento es un parametro mas de la camara (`aside`),
no una animacion aparte, de modo que no puede descolgarse del acercamiento.

En movil no cabe, asi que la carta sigue siendo un panel de abajo y el local
no se mueve.

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
- Boton «Ir a las maquinas» para saltarse el acercamiento, solo en
  escritorio: en movil sobra, porque el circulo que late ya lleva al local y
  deslizar hace el resto.
- No se secuestra la rueda ni se bloquea el scroll normal: la escena es una
  seccion `sticky` gobernada por el progreso de desplazamiento.
- Las maquinas son botones con etiqueta, alcanzables con el tabulador, y estan
  deshabilitadas hasta que termina el acercamiento.
- La carta se cierra con Escape.

## Despliegue en Cloudflare Pages

Ajustes del proyecto:

| Campo                     | Valor           |
|---------------------------|-----------------|
| Framework preset          | Vite            |
| Build command             | `npm run build` |
| Build output directory    | `dist`          |
| Node version              | 20 (`.nvmrc`)   |

No hay rutas de cliente, asi que no hace falta `_redirects`. El fichero
`public/_headers` fija el cacheado: eterno para los bundles con hash, de un dia
para las imagenes.

## De dia o de noche

La calle se ve como estaria a la hora de quien mira: de noche entre las 20:00 y
las 07:00. Para revisarlo sin esperar, `?escena=noche` y `?escena=dia`.

La foto nocturna, la de dia y la capa de primer plano comparten lienzo y estan
registradas al pixel, asi que el primer plano de noche se genera aplicando a la
foto nocturna el canal alfa del de dia. El marco del local se gradua por CSS
con la caida de luz medida entre ambas fotos (x0,34-0,43 en la estructura,
x0,75 en la acera, que alumbran las farolas). Las maquinas y el cocinero no se
atenuan: estan dentro, bajo los focos.

## La carta

En `src/menu/menuData.js`: 36 pizzas y 19 bocadillos, transcritos de
pizzeria24horas.com. **Los precios no figuran en esa web**, asi que van
vacios; `precio` es opcional y los articulos sin el se muestran solo con
nombre e ingredientes.

Los 55 articulos llevan su foto en `/assets/carta/`. Son las fichas de la web
de la pizzeria, recortadas de capturas de pantalla: se detectan las tarjetas
por columnas y filas (el fondo de pagina es blanco puro) y se recorta cada una
entera, a 365x288.

Se deja la ficha completa, con el nombre y los ingredientes que la pizzeria
lleva incrustados en la imagen, porque los recortes que los evitan parten el
producto o cortan el texto a medias. El nombre y los ingredientes se siguen
pintando aparte como texto, que es lo que leen el buscador y un lector de
pantalla.

Si algun dia hay fotos limpias y de mas resolucion, basta con sustituir los
ficheros: el campo `foto` no cambia.

## Assets

En `public/assets/`. Se derivan de los demas, y hay que regenerarlos si se
cambian las fotos de la calle:

- `calle-desenfocada.webp` y `calle-noche-desenfocada.webp`: la misma calle
  reducida, difuminada y ampliada. Se cruzan por opacidad en vez de animar
  `filter: blur()`, que en un elemento escalado cuesta caro en GPU.
- `calle-primer-plano-noche.webp`: la foto nocturna con el alfa del primer
  plano de dia.

La capa de edificios vecinos **no se usa**: su hueco (x 0,441-0,615) es mas
estrecho que el rotulo de seto (x 0,421-0,641), asi que puesta por encima le
cortaria las puntas, y puesta por debajo da la misma imagen que la calle
completa con el doble de peso. Los vecinos y el local estan en el mismo plano
de fachada, asi que entre ellos tampoco habria paralaje que ganar.
