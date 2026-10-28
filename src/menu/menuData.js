/**
 * La carta, transcrita de pizzeria24horas.com.
 *
 * Los precios no figuran en la web, asi que van vacios: `precio` es opcional y
 * los articulos sin el se muestran solo con nombre e ingredientes. En cuanto
 * esten, se rellenan aqui y la carta se actualiza sola.
 *
 * `foto` es la ruta de la imagen del producto en /assets/carta/. Tambien es
 * opcional, de modo que se pueden ir anadiendo una a una sin romper nada.
 */

const p = (nombre, desc, extra = {}) => ({ nombre, desc, ...extra });

export const MENU = {
  pizza: {
    title: 'Pizzas',
    tagline: 'Artesanas, hechas en 3 minutos. A cualquier hora.',
    art: '/assets/pizza.webp',
    chef: '/assets/cocinero-pizza.webp',
    sections: [
      {
        name: 'Las de siempre',
        items: [
          p('Margarita', 'Tomate, mozzarella', { foto: '/assets/carta/margarita.webp' }),
          p('York', 'Tomate triturado, mozzarella, jamón york', { foto: '/assets/carta/york.webp' }),
          p('Pepperoni', 'Tomate triturado, mozzarella, pepperoni', { foto: '/assets/carta/pepperoni.webp' }),
          p('Boloñesa', 'Tomate triturado, mozzarella, boloñesa halal', { foto: '/assets/carta/bolonesa.webp' }),
          p('Cuatro Quesos', 'Tomate triturado, mozzarella, emmental, queso azul, cheddar', { foto: '/assets/carta/cuatro-quesos.webp' }),
          p('Bismark', 'Salsa de tomate, mozzarella, jamón york, huevo poché', { foto: '/assets/carta/bismark.webp' }),
          p('Carnívora', 'Boloñesa, bacon, pepperoni', { foto: '/assets/carta/carnivora.webp' }),
        ],
      },
      {
        name: 'Con pollo',
        items: [
          p('Pollo Carbonara', 'Tomate triturado, mozzarella, pollo, bacon, carbonara', { foto: '/assets/carta/pollo-carbonara.webp' }),
          p('Pollo BBQ', 'Tomate triturado, mozzarella, pollo, bacon, salsa BBQ', { foto: '/assets/carta/pollo-bbq.webp' }),
          p('Pollo con Verduras Teriyaki', 'Tomate triturado, mozzarella, pollo, verdura con salsa teriyaki', { foto: '/assets/carta/pollo-verduras-teriyaki.webp' }),
          p('Pollo Picante', 'Tomate triturado, mozzarella, pollo marinado con salsa Valentina, pimientos confitados', { foto: '/assets/carta/pollo-picante.webp' }),
          p('Pollo & Fungi', 'Pollo, champiñones, parmesano', { foto: '/assets/carta/pollo-fungi.webp' }),
          p('Fungi & Pulled Chiken', 'Salsa de tomate, mozzarella, champiñón, pulled pollo trufado', { foto: '/assets/carta/fungi-pulled-chiken.webp' }),
          p('Jumper', 'Tomate triturado, mozzarella, pollo, bacon, salsa jumper', { foto: '/assets/carta/jumper.webp' }),
        ],
      },
      {
        name: 'Las contundentes',
        items: [
          p('Hamburguesa Jack Daniel’s', 'Tomate, mozzarella, hamburguesa Jack Daniel’s, huevos poché, bacon', { foto: '/assets/carta/hamburguesa-jack-daniels.webp' }),
          p('Peccato', 'Hamburguesa, torrezno, salsa barbacoa Jack Daniel’s', { foto: '/assets/carta/peccato.webp' }),
          p('Huevos Rotos & Torreznos', 'Tomate triturado, mozzarella, patata horneada, huevos poché, torreznos', { foto: '/assets/carta/huevos-rotos-torreznos.webp' }),
          p('Pulled Pork', 'Tomate triturado, mozzarella, bacon, pulled pork', { foto: '/assets/carta/pulled-pork.webp' }),
          p('Operación Bikini', 'Salsa de tomate, mozzarella, solomillo, panceta, huevo poché', { foto: '/assets/carta/operacion-bikini.webp' }),
          p('Solomillo Cabra', 'Tomate triturado, mozzarella, solomillo de cerdo, cebolla confitada, rulo de cabra', { foto: '/assets/carta/solomillo-cabra.webp' }),
          p('Carrillera & Boniato', 'Carrillera de cerdo, piparra picante, boniato', { foto: '/assets/carta/carrillera-boniato.webp' }),
          p('Ibérica Cheddar', 'Bacon, boloñesa BBQ, cheddar, cebolla', { foto: '/assets/carta/iberica-cheddar.webp' }),
        ],
      },
      {
        name: 'De la tierra',
        items: [
          p('Baturra', 'Morcilla de Burgos, chorizo, torrezno', { foto: '/assets/carta/baturra.webp' }),
          p('Morcillona', 'Morcilla de Burgos, cebolla confitada, rulo de cabra', { foto: '/assets/carta/morcillona.webp' }),
          p('Soriana', 'Pimiento verde, chorizo de Soria, lascas de queso manchego', { foto: '/assets/carta/soriana.webp' }),
          p('Mallorquina', 'Queso brie, sobrasada mallorquina, miel picante', { foto: '/assets/carta/mallorquina.webp' }),
          p('Longaniza Trufada', 'Tomate, mozzarella, longaniza trufada, cebolla crujiente', { foto: '/assets/carta/longaniza-trufada.webp' }),
          p('Longaniza Top', 'Longaniza, bacon, huevo poché', { foto: '/assets/carta/longaniza-top.webp' }),
          p('La Villacampa', 'Salsa de tomate, mozzarella 100% vaca, jamón serrano, frankfurt, crema de trufa', { foto: '/assets/carta/la-villacampa.webp' }),
        ],
      },
      {
        name: 'Las de autor',
        items: [
          p('@lbamoress', 'Base tartufata, mozzarella 100% vaca, guanciale, setas, huevo poché, pecorino', { foto: '/assets/carta/lbamoress.webp' }),
          p('Salmozola', 'Tomate, mozzarella, gorgonzola, cebolla de Fuentes, salmón ahumado', { foto: '/assets/carta/salmozola.webp' }),
          p('Pesto', 'Panceta, tomate confitado, pesto, pistacho', { foto: '/assets/carta/pesto.webp' }),
          p('Pepperoni & Pesto', 'Pepperoni, pesto, parmesano', { foto: '/assets/carta/pepperoni-pesto.webp' }),
          p('Capresse & Prociutto', 'Cherry, jamón cocido, pesto, pistacho', { foto: '/assets/carta/capresse-prociutto.webp' }),
          p('Green Roller', 'Salsa de tomate, mozzarella, cebolla confitada, berenjena, rulo de cabra, miel de romero', { foto: '/assets/carta/green-roller.webp' }),
          p('Vegi & Sriracha', 'Pimiento verde, cebolla, champiñones, salsa sriracha', { foto: '/assets/carta/vegi-sriracha.webp' }),
        ],
      },
    ],
  },

  bocadillos: {
    title: 'Bocadillos',
    tagline: 'Pan recién horneado y relleno generoso. A cualquier hora.',
    art: '/assets/bocadillo.webp',
    chef: '/assets/cocinero-bocadillo.webp',
    sections: [
      {
        name: 'De la máquina 24 h',
        items: [
          p('Ibérico Queso', 'Solomillo, bacon, queso', { foto: '/assets/carta/boc-iberico-queso.webp' }),
          p('Teroleño', 'Jamón de Teruel, tomate natural, aceite de oliva', { foto: '/assets/carta/boc-teroleno.webp' }),
          p('Prosciutto', 'Jamón cocido, tomate confitado, pesto, mozzarella buffala', { foto: '/assets/carta/boc-prosciutto.webp' }),
          p('Longaniza', 'Longaniza, tomate natural, aceite de oliva', { foto: '/assets/carta/boc-longaniza.webp' }),
          p('Sriracha', 'Pechuga empanada, salsa sriracha', { foto: '/assets/carta/boc-sriracha.webp' }),
          p('Perrito Ketchup', 'Frankfurt, cebolla crujiente, ketchup', { foto: '/assets/carta/boc-perrito-ketchup.webp' }),
          p('Perrito Pulled', 'Frankfurt, pulled pork, cebolla frita', { foto: '/assets/carta/boc-perrito-pulled.webp' }),
        ],
      },
      {
        name: 'Los clásicos',
        items: [
          p('Pollo Empanado', '', { foto: '/assets/carta/boc-pollo-empanado.webp' }),
          p('Pollo y Queso', '', { foto: '/assets/carta/boc-pollo-queso.webp' }),
          p('Bacon y Queso', '', { foto: '/assets/carta/boc-bacon-queso.webp' }),
          p('York y Queso', '', { foto: '/assets/carta/boc-york-queso.webp' }),
          p('Serranito', '', { foto: '/assets/carta/boc-serranito.webp' }),
          p('Solomillo', '', { foto: '/assets/carta/boc-solomillo.webp' }),
          p('Ternera', '', { foto: '/assets/carta/boc-ternera.webp' }),
          p('Hamburguesa', '', { foto: '/assets/carta/boc-hamburguesa.webp' }),
          p('Perrito', '', { foto: '/assets/carta/boc-perrito.webp' }),
          p('La Villacampa', '', { foto: '/assets/carta/boc-la-villacampa.webp' }),
        ],
      },
      {
        name: 'Empanadas',
        items: [p('Empanada de Pisto y Atún', '', { foto: '/assets/carta/boc-empanada-pisto-atun.webp' }), p('Empanada de York y Queso', '', { foto: '/assets/carta/boc-empanada-york-queso.webp' })],
      },
    ],
  },
};
