import { useState } from 'react';
import { CAJEROS, comoLlegar, enMetros, porCercania } from '../mapa/cajeros';
import { useUbicacion } from '../mapa/useUbicacion';
import { MENU } from '../menu/menuData';
import { MapaInfo } from './MapaInfo';
import { SITIO } from './negocio';

/**
 * La informacion del negocio, en texto corriente y bajo la escena.
 *
 * Existe por dos motivos a la vez. Para quien entra: poder ver una direccion
 * o la carta sin tener que jugar con una animacion. Y para la busqueda local:
 * la escena no deja nada legible en la pagina -la carta y el mapa solo se
 * montan al abrirlos-, asi que sin esto un buscador no encuentra ni una
 * direccion ni un producto.
 *
 * Aqui vive tambien el unico `h1` de la pagina, con lo que el negocio quiere
 * que se busque.
 */
export function InfoLocal() {
  const { yo, masCercano, aviso, error, localizar } = useUbicacion();
  const [elegido, setElegido] = useState(null);
  // Con ubicacion, los cajeros se ordenan por cercania, como en el mapa.
  const sitios = porCercania(yo);

  return (
    <footer className="info">
      <div className="info-dentro">
        <h1>Pizza 24 horas en Zaragoza</h1>
        <p className="info-entrada">
          {SITIO.nombre} hace pizza artesana y bocadillos recién hechos en máquina, a
          cualquier hora del día y de la noche. Siete puntos repartidos por Zaragoza,
          abiertos los 365 días del año. Tu pizza, hecha en 3 minutos.
        </p>

        <section className="info-bloque">
          <h2>Dónde estamos</h2>
          <p>
            Todos los cajeros abren las 24 horas, también de madrugada, fines de semana
            y festivos.
          </p>
          <div className="info-acciones">
            <button type="button" className="locate" onClick={localizar}>
              Cajero más cercano
            </button>
            {aviso && (
              <p className={`status${error ? ' err' : ''}`} role="status">
                {aviso}
              </p>
            )}
          </div>

          <MapaInfo
            yo={yo}
            masCercano={masCercano}
            elegido={elegido}
            onElegir={(c) => setElegido(c.id)}
          />

          <ul className="info-sitios">
            {sitios.map((c) => (
              <li
                key={c.id}
                className={c.id === masCercano ? 'es-cercano' : undefined}
              >
                <h3>{c.calle}</h3>
                <p>
                  {c.nota || 'Cajero de pizza y bocadillos'} · Zaragoza · Abierto 24 h
                  {c.d != null && <em className="dist"> · a {enMetros(c.d)}</em>}
                </p>
                {c.id === masCercano && <span className="tag near">El más cercano a ti</span>}
                <a href={comoLlegar(c, yo)} target="_blank" rel="noopener noreferrer">
                  Cómo llegar
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="info-bloque">
          <h2>La carta</h2>
          {Object.values(MENU).map((cat) => (
            <div key={cat.title} className="info-carta">
              <h3>{cat.title}</h3>
              {cat.sections.map((s) => (
                <div key={s.name}>
                  <h4>{s.name}</h4>
                  <ul>
                    {s.items.map((i) => (
                      <li key={i.nombre}>
                        <strong>{i.nombre}</strong>
                        {i.desc ? ` — ${i.desc}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </section>

        <p className="info-pie">
          {SITIO.nombre} · Zaragoza · Abierto 24 horas, todos los días del año.
        </p>
      </div>
    </footer>
  );
}
