import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CAJEROS, comoLlegar, enMetros, porCercania } from './cajeros';

/**
 * El mapa de los cajeros, sin nada alrededor.
 *
 * Replica el de pizzeriadarte24h.com: las mismas teselas de Esri, los mismos
 * marcadores con el logo y los mismos globos. Se usa en dos sitios -la ventana
 * del mapa y la seccion «Donde estamos»- y por eso no trae ni cabecera ni
 * lista: eso lo pone quien lo coloca.
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

export function Mapa({ yo, masCercano, elegido, onElegir, className = 'mapa-lienzo' }) {
  const lienzo = useRef(null);
  const mapa = useRef(null);
  const marcas = useRef({});
  const marcaYo = useRef(null);
  const alElegir = useRef(onElegir);
  alElegir.current = onElegir;

  useEffect(() => {
    if (!lienzo.current || mapa.current) return undefined;
    const m = L.map(lienzo.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false, // que la rueda no secuestre el scroll de la pagina
    });
    L.tileLayer(TESELAS, { attribution: CREDITOS, maxZoom: 19 }).addTo(m);

    // Fuera el «Leaflet» (autopromocion de la libreria) y los creditos
    // plegados tras un icono, como en su web.
    m.attributionControl.setPrefix(false);
    const caja = m.attributionControl.getContainer();
    caja.setAttribute('role', 'button');
    caja.setAttribute('tabindex', '0');
    caja.setAttribute('aria-label', 'Créditos del mapa');
    caja.addEventListener('click', (e) => {
      if (!e.target.closest('a')) caja.classList.toggle('abierta');
    });
    caja.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        caja.classList.toggle('abierta');
      }
    });

    CAJEROS.forEach((c) => {
      marcas.current[c.id] = L.marker([c.lat, c.lng], {
        icon: chincheta(c, null),
        title: c.calle,
      })
        .addTo(m)
        .on('click', () => alElegir.current?.(c));
    });
    mapa.current = m;

    return () => {
      m.remove();
      mapa.current = null;
      marcas.current = {};
      marcaYo.current = null;
    };
  }, []);

  /**
   * El mapa se mide al crearse, y puede nacer dentro de un panel que todavia
   * esta entrando o de una seccion que aun no se ve: con el tamano equivocado
   * salen teselas grises y el encuadre no cuadra. Se vuelve a medir y a
   * encuadrar cuando ya esta quieto.
   */
  useEffect(() => {
    const encuadrar = () => {
      if (!mapa.current) return;
      mapa.current.invalidateSize();
      if (!yo) {
        mapa.current.fitBounds(L.latLngBounds(CAJEROS.map((c) => [c.lat, c.lng])), {
          padding: [40, 40],
        });
      }
    };
    const t = setTimeout(encuadrar, 380);
    window.addEventListener('resize', encuadrar);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', encuadrar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Los globos y las chinchetas dicen la distancia, asi que se rehacen cuando
  // cambia donde estas o cual es el mas cercano.
  useEffect(() => {
    CAJEROS.forEach((c) => {
      const mk = marcas.current[c.id];
      if (!mk) return;
      mk.setIcon(chincheta(c, masCercano));
      mk.bindPopup(() => globo(c, yo, masCercano));
    });
  }, [yo, masCercano]);

  // Al localizarte: tu punto azul y un encuadre que os abarca a los dos.
  useEffect(() => {
    const m = mapa.current;
    if (!m || !yo) return;
    marcaYo.current?.remove();
    marcaYo.current = L.marker([yo.lat, yo.lng], {
      icon: L.divIcon({
        className: '',
        html: '<div class="me"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
      title: 'Tu ubicación',
      zIndexOffset: 1000,
    })
      .addTo(m)
      .bindPopup('Estás aquí');

    const cerca = porCercania(yo)[0];
    m.flyToBounds(
      L.latLngBounds([
        [yo.lat, yo.lng],
        [cerca.lat, cerca.lng],
      ]),
      { padding: [60, 60], duration: 0.8 }
    );
    const t = setTimeout(() => marcas.current[cerca.id]?.openPopup(), 900);
    return () => clearTimeout(t);
  }, [yo]);

  // Al pulsar un cajero en la lista, el mapa va a el.
  useEffect(() => {
    if (!elegido || !mapa.current) return;
    const c = CAJEROS.find((x) => x.id === elegido);
    if (!c) return;
    mapa.current.flyTo([c.lat, c.lng], 16, { duration: 0.6 });
    marcas.current[c.id]?.openPopup();
  }, [elegido]);

  return <div className={className} ref={lienzo} />;
}
