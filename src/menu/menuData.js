/**
 * La carta.
 *
 * Precios y nombres son de ejemplo: cambialos aqui y la carta se actualiza
 * sola en la web. Las dos categorias se corresponden con las dos maquinas.
 */
export const MENU = {
  pizza: {
    title: 'Pizzas',
    tagline: 'Masa de 48 horas, horneada en 3 minutos. A cualquier hora.',
    art: '/assets/pizza.webp',
    sections: [
      {
        name: 'Las de siempre',
        items: [
          { name: 'Margherita', desc: 'Tomate San Marzano, mozzarella fior di latte, albahaca', price: '8,50' },
          { name: 'Prosciutto', desc: 'Tomate, mozzarella, jamon cocido, oregano', price: '9,90' },
          { name: 'Diavola', desc: 'Tomate, mozzarella, salami picante', price: '10,50' },
          { name: 'Quattro formaggi', desc: 'Mozzarella, gorgonzola, parmesano, provolone', price: '11,20' },
        ],
      },
      {
        name: 'Las de la casa',
        items: [
          { name: "D'Arte", desc: 'Burrata, tomate seco, rucula y aceite de albahaca', price: '12,90' },
          { name: 'Tartufo', desc: 'Crema de trufa, champinon, mozzarella y parmesano', price: '13,50' },
          { name: 'Verdure', desc: 'Calabacin, berenjena, pimiento asado y cebolla roja', price: '10,90' },
        ],
      },
    ],
  },
  bocadillos: {
    title: 'Bocadillos',
    tagline: 'Pan recien horneado y relleno generoso. A cualquier hora.',
    art: '/assets/bocadillo.webp',
    sections: [
      {
        name: 'Calientes',
        items: [
          { name: 'Jamon y queso fundido', desc: 'Jamon cocido, mozzarella, tomate y lechuga', price: '6,50' },
          { name: 'Pollo crujiente', desc: 'Pollo empanado, cesar y lechuga romana', price: '7,20' },
          { name: 'Lomo con pimientos', desc: 'Lomo a la plancha y pimiento verde asado', price: '6,90' },
        ],
      },
      {
        name: 'Frios',
        items: [
          { name: 'Serrano con tomate', desc: 'Jamon serrano, tomate rallado y aceite de oliva', price: '7,50' },
          { name: 'Caprese', desc: 'Mozzarella, tomate, albahaca y aceite', price: '6,20' },
          { name: 'Atun y huevo', desc: 'Atun, huevo cocido, mayonesa y lechuga', price: '6,40' },
        ],
      },
    ],
  },
};
