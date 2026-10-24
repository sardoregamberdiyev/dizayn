export type Roast = 'Light' | 'Medium' | 'Dark';

export interface Product {
  id: string;
  slug: string;
  name: string;
  origin: string;
  roast: Roast;
  notes: string[];
  price: number;
  color: string;
  image: string;
  description: string;
  altitude: string;
  rating: number;
  reviews: number;
  stock?: number;
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: 'sumatra-arabica', slug: 'sumatra-arabica', name: 'Sumatra Arabica', origin: 'Sumatra', roast: 'Dark',
    notes: ['Dark chocolate', 'Cedar', 'Brown sugar'], price: 18, color: '#c88463', image: '/images/sumatra-hero.webp',
    description: 'A beautifully bold cup from the green highlands of Sumatra. Rich chocolate meets a warm, earthy finish. Slow mornings were made for this.',
    altitude: '1,200–1,600 m', rating: 4.9, reviews: 128, stock: 48, featured: true,
  },
  {
    id: 'java-arabica', slug: 'java-arabica', name: 'Java Arabica', origin: 'Java', roast: 'Medium',
    notes: ['Cacao', 'Orange peel', 'Roasted almond'], price: 17, color: '#6b8998', image: '/images/java-hero.webp',
    description: 'The familiar comfort of cacao with a little citrus spark. Our Java Arabica brings gentle sweetness and a rounded body to your everyday ritual.',
    altitude: '1,000–1,500 m', rating: 4.8, reviews: 94, stock: 62, featured: true,
  },
  {
    id: 'bali-kintamani', slug: 'bali-kintamani', name: 'Bali Kintamani', origin: 'Bali', roast: 'Light',
    notes: ['Mandarin', 'Jasmine', 'Honey'], price: 21, color: '#c3a868', image: '/images/bali-bag.svg',
    description: 'Bright, fragrant, and full of sunshine. Inspired by the volcanic slopes of Kintamani, this delicate roast shines in a slow, mindful pour-over.',
    altitude: '1,300–1,700 m', rating: 4.9, reviews: 76, stock: 24, featured: true,
  },
  {
    id: 'toraja-reserve', slug: 'toraja-reserve', name: 'Toraja Reserve', origin: 'Sulawesi', roast: 'Medium',
    notes: ['Black cherry', 'Caramel', 'Warm spice'], price: 24, color: '#8e6b7b', image: '/images/toraja-bag.svg',
    description: 'A quietly extraordinary cup. Layers of cherry and caramel unfold into a long, spiced finish. A small-lot selection for moments worth lingering over.',
    altitude: '1,400–1,800 m', rating: 4.9, reviews: 52, stock: 18,
  },
  {
    id: 'signature-house-blend', slug: 'signature-house-blend', name: 'Signature House Blend', origin: 'Indonesia', roast: 'Medium',
    notes: ['Milk chocolate', 'Hazelnut', 'Caramel'], price: 16, color: '#8e9c80', image: '/images/signature-bag.svg',
    description: 'Your new daily favourite. A thoughtful blend of Indonesian coffees with the sweetness, balance, and comforting finish that make one cup become two.',
    altitude: '1,000–1,600 m', rating: 4.8, reviews: 163, stock: 80,
  },
  {
    id: 'espresso-dark-roast', slug: 'espresso-dark-roast', name: 'Espresso Dark Roast', origin: 'Indonesia', roast: 'Dark',
    notes: ['Bitter chocolate', 'Molasses', 'Toasted walnut'], price: 19, color: '#a55a4d', image: '/images/espresso-bag.svg',
    description: 'Deep, smooth, and unapologetically bold. Crafted for a syrupy espresso with a rich crema, and just as beautiful with your favourite milk.',
    altitude: '1,100–1,600 m', rating: 4.7, reviews: 108, stock: 56,
  },
];

export interface Article {
  slug: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  body: string[];
  readTime: string;
}

export const articles: Article[] = [
  {
    slug: 'the-beauty-of-a-perfect-roast', title: 'Bean bliss: the beauty of a perfect roast.', category: 'Coffee culture',
    image: '/images/beans.jpg', excerpt: 'A little heat, a little patience, and a lot of possibility. Step inside the transformation behind your morning cup.', readTime: '5 min read',
    body: [
      'Every coffee bean holds a story before it ever reaches the roaster. Soil, altitude, weather, and the choices made at harvest all shape its potential. Roasting is the careful work of listening to that story and helping it come through in the cup.',
      'As a green bean warms, moisture slowly escapes and its familiar grassy scent turns sweet. The first crack marks a turning point: the bean expands, and the balance between acidity, sweetness, and body becomes the roaster’s focus. A few seconds can change the character of a batch.',
      'A lighter roast often keeps more of the coffee’s bright, floral qualities. A medium roast brings a rounded sweetness; a darker roast moves toward chocolate, toasted nuts, and a fuller body. There is no single perfect roast—only the one that lets a particular coffee speak clearly.',
      'At home, start with fresh water and freshly ground beans. Let the coffee rest after roasting, measure your dose, and change one thing at a time. The most useful tasting note is the one that helps you make a cup you enjoy.',
    ],
  },
  {
    slug: 'a-journey-through-indonesian-coffee', title: 'Global beanscape: a journey through Indonesia.', category: 'Origins',
    image: '/images/coffee-cup.jpg', excerpt: 'From the volcanic slopes of Java to the lush highlands of Sumatra, discover a world of flavour in one archipelago.', readTime: '7 min read',
    body: [
      'Indonesia stretches across thousands of islands, and its coffees are just as varied as its landscapes. Volcanic soil, tropical rain, and high mountain farms create a remarkable range of flavours. Getting to know those differences makes every brew a small act of discovery.',
      'Sumatran coffee is often known for a substantial body and earthy depth. Java can offer a softer, rounded cup with cacao and spice. In Bali’s Kintamani region, higher elevations and local growing conditions can bring a brighter, more citrus-led profile.',
      'Beyond the island name, processing matters. Washed, natural, and wet-hulled coffees each reveal a different side of the fruit. Trying the same brewing recipe with two origins is one of the easiest ways to notice what makes them distinct.',
      'We invite you to explore slowly. Read the notes on a bag, brew a cup, and write down what you taste in your own words. Familiarity grows cup by cup, and there is always another place to discover.',
    ],
  },
  {
    slug: 'your-slow-morning-brew-guide', title: 'A slower morning. A better pour-over.', category: 'Brew guides',
    image: '/images/brewing.jpg', excerpt: 'A simple ritual for a delicious cup: good water, a thoughtful grind, and a moment to yourself.', readTime: '4 min read',
    body: [
      'You do not need a complicated setup to brew a beautiful pour-over. A dripper, paper filter, a scale, and a kettle are a great start. More than anything, consistency helps you understand what works for your coffee.',
      'Start with 15 grams of coffee to 250 grams of water. Grind medium-fine, rinse the filter, and use water just off the boil. Pour a little water over the grounds, then wait around 30 seconds as the coffee blooms.',
      'Continue pouring in slow, steady circles. Aim for an even bed of coffee and a total brew time around three minutes. If the cup tastes sharp, try a slightly finer grind; if it feels dry or bitter, go a little coarser.',
      'Treat the recipe as a starting point, not a rule. Keep the version that tastes best to you. A daily ritual should make your morning feel easier, and the pleasure of making it is part of the flavour.',
    ],
  },
];

export const collections = [
  { slug: 'indonesian-coffee', name: 'The Indonesian collection', description: 'Six extraordinary coffees. One beautiful archipelago.', image: '/images/origin.jpg' },
  { slug: 'arabica-selection', name: 'Arabica, in full expression', description: 'Distinctive single origins with stories worth savouring.', image: '/images/beans.jpg' },
  { slug: 'dark-roast', name: 'The bold ones', description: 'Deep chocolate, a little intensity, and a lingering finish.', image: '/images/coffee-cup.jpg' },
  { slug: 'light-medium-roast', name: 'The brighter side', description: 'Fragrant, balanced coffees for curious palates.', image: '/images/brewing.jpg' },
  { slug: 'coffee-bundles', name: 'Better together', description: 'Thoughtful pairings for gifting, sharing, and exploring.', image: '/images/beans.jpg' },
  { slug: 'limited-editions', name: 'Small lots. Big character.', description: 'Limited selections that deserve your full attention.', image: '/images/origin.jpg' },
];

export const weightMultiplier = (weight: string) => weight === '1kg' ? 3.5 : weight === '500g' ? 1.85 : 1;
