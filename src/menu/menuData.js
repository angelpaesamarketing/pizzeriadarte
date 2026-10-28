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
    sections: [
      {
        name: 'Las de siempre',
        items: [
          p('Margarita', 'Tomate, mozzarella'),
          p('York', 'Tomate triturado, mozzarella, jamón york'),
          p('Pepperoni', 'Tomate triturado, mozzarella, pepperoni'),
          p('Boloñesa', 'Tomate triturado, mozzarella, boloñesa halal'),
          p('Cuatro Quesos', 'Tomate triturado, mozzarella, emmental, queso azul, cheddar'),
          p('Bismark', 'Salsa de tomate, mozzarella, jamón york, huevo poché'),
          p('Carnívora', 'Boloñesa, bacon, pepperoni'),
        ],
      },
      {
        name: 'Con pollo',
        items: [
          p('Pollo Carbonara', 'Tomate triturado, mozzarella, pollo, bacon, carbonara'),
          p('Pollo BBQ', 'Tomate triturado, mozzarella, pollo, bacon, salsa BBQ'),
          p('Pollo con Verduras Teriyaki', 'Tomate triturado, mozzarella, pollo, verdura con salsa teriyaki'),
          p('Pollo Picante', 'Tomate triturado, mozzarella, pollo marinado con salsa Valentina, pimientos confitados'),
          p('Pollo & Fungi', 'Pollo, champiñones, parmesano'),
          p('Fungi & Pulled Chiken', 'Salsa de tomate, mozzarella, champiñón, pulled pollo trufado'),
          p('Jumper', 'Tomate triturado, mozzarella, pollo, bacon, salsa jumper'),
        ],
      },
      {
        name: 'Las contundentes',
        items: [
          p('Hamburguesa Jack Daniel’s', 'Tomate, mozzarella, hamburguesa Jack Daniel’s, huevos poché, bacon'),
          p('Peccato', 'Hamburguesa, torrezno, salsa barbacoa Jack Daniel’s'),
          p('Huevos Rotos & Torreznos', 'Tomate triturado, mozzarella, patata horneada, huevos poché, torreznos'),
          p('Pulled Pork', 'Tomate triturado, mozzarella, bacon, pulled pork'),
          p('Operación Bikini', 'Salsa de tomate, mozzarella, solomillo, panceta, huevo poché'),
          p('Solomillo Cabra', 'Tomate triturado, mozzarella, solomillo de cerdo, cebolla confitada, rulo de cabra'),
          p('Carrillera & Boniato', 'Carrillera de cerdo, piparra picante, boniato'),
          p('Ibérica Cheddar', 'Bacon, boloñesa BBQ, cheddar, cebolla'),
        ],
      },
      {
        name: 'De la tierra',
        items: [
          p('Baturra', 'Morcilla de Burgos, chorizo, torrezno'),
          p('Morcillona', 'Morcilla de Burgos, cebolla confitada, rulo de cabra'),
          p('Soriana', 'Pimiento verde, chorizo de Soria, lascas de queso manchego'),
          p('Mallorquina', 'Queso brie, sobrasada mallorquina, miel picante'),
          p('Longaniza Trufada', 'Tomate, mozzarella, longaniza trufada, cebolla crujiente'),
          p('Longaniza Top', 'Longaniza, bacon, huevo poché'),
          p('La Villacampa', 'Salsa de tomate, mozzarella 100% vaca, jamón serrano, frankfurt, crema de trufa'),
        ],
      },
      {
        name: 'Las de autor',
        items: [
          p('@lbamoress', 'Base tartufata, mozzarella 100% vaca, guanciale, setas, huevo poché, pecorino'),
          p('Salmozola', 'Tomate, mozzarella, gorgonzola, cebolla de Fuentes, salmón ahumado'),
          p('Pesto', 'Panceta, tomate confitado, pesto, pistacho'),
          p('Pepperoni & Pesto', 'Pepperoni, pesto, parmesano'),
          p('Capresse & Prociutto', 'Cherry, jamón cocido, pesto, pistacho'),
          p('Green Roller', 'Salsa de tomate, mozzarella, cebolla confitada, berenjena, rulo de cabra, miel de romero'),
          p('Vegi & Sriracha', 'Pimiento verde, cebolla, champiñones, salsa sriracha'),
        ],
      },
    ],
  },

  bocadillos: {
    title: 'Bocadillos',
    tagline: 'Pan recién horneado y relleno generoso. A cualquier hora.',
    art: '/assets/bocadillo.webp',
    sections: [
      {
        name: 'De la máquina 24 h',
        items: [
          p('Ibérico Queso', 'Solomillo, bacon, queso'),
          p('Teroleño', 'Jamón de Teruel, tomate natural, aceite de oliva'),
          p('Prosciutto', 'Jamón cocido, tomate confitado, pesto, mozzarella buffala'),
          p('Longaniza', 'Longaniza, tomate natural, aceite de oliva'),
          p('Sriracha', 'Pechuga empanada, salsa sriracha'),
          p('Perrito Ketchup', 'Frankfurt, cebolla crujiente, ketchup'),
          p('Perrito Pulled', 'Frankfurt, pulled pork, cebolla frita'),
        ],
      },
      {
        name: 'Los clásicos',
        items: [
          p('Pollo Empanado'),
          p('Pollo y Queso'),
          p('Bacon y Queso'),
          p('York y Queso'),
          p('Serranito'),
          p('Solomillo'),
          p('Ternera'),
          p('Hamburguesa'),
          p('Perrito'),
          p('La Villacampa'),
        ],
      },
      {
        name: 'Empanadas',
        items: [p('Empanada de Pisto y Atún'), p('Empanada de York y Queso')],
      },
    ],
  },
};
