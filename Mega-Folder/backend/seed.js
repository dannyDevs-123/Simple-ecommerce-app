const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/database');

const sampleProducts = [
  {
    name: 'Wireless Noise Cancelling Headphones',
    description: 'Premium over-ear headphones with adaptive noise cancellation, 30-hour battery life, and crystal-clear audio. Designed for travel, work, and immersive entertainment.',
    price: 179.99,
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=80'],
    category: 'Electronics',
    stock: 48,
    rating: 4.7,
    numReviews: 342,
    featured: true
  },
  {
    name: 'Smart Fitness Watch Pro',
    description: 'Track workouts, sleep, recovery, and heart rate with a lightweight smartwatch featuring GPS, AMOLED display, and 7-day battery life.',
    price: 219.99,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80'],
    category: 'Electronics',
    stock: 31,
    rating: 4.5,
    numReviews: 216
  },
  {
    name: '4K Ultra HD Monitor',
    description: '27-inch IPS display with vibrant colors, HDR support, and USB-C connectivity for productivity, gaming, and creative work.',
    price: 399.99,
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80'],
    category: 'Electronics',
    stock: 18,
    rating: 4.6,
    numReviews: 187
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'Hot-swappable mechanical keyboard with RGB lighting, tactile switches, and a compact aluminum frame built for fast gameplay.',
    price: 129.99,
    images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=500&q=80'],
    category: 'Electronics',
    stock: 42,
    rating: 4.8,
    numReviews: 290
  },
  {
    name: 'Wireless Charging Dock',
    description: 'Minimal desk charging stand with fast wireless power delivery and a sleek aluminum finish for phones, earbuds, and smart devices.',
    price: 69.99,
    images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=500&q=80'],
    category: 'Electronics',
    stock: 96,
    rating: 4.4,
    numReviews: 141
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Soft, breathable everyday tee made from 100% organic cotton with a relaxed fit and durable stitching for long-term comfort.',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80'],
    category: 'Clothing',
    stock: 210,
    rating: 4.3,
    numReviews: 256
  },
  {
    name: 'Classic Denim Jacket',
    description: 'A timeless jacket with a structured fit, soft brushed interior, and utility pockets designed for everyday layering.',
    price: 84.99,
    images: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=500&q=80'],
    category: 'Clothing',
    stock: 58,
    rating: 4.5,
    numReviews: 171
  },
  {
    name: 'Trail Running Shoes',
    description: 'Lightweight runners with responsive cushioning, breathable knit upper, and durable grip for weekend trails and city miles.',
    price: 99.99,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80'],
    category: 'Clothing',
    stock: 88,
    rating: 4.6,
    numReviews: 238
  },
  {
    name: 'Leather Belt Essentials',
    description: 'Handcrafted leather belt with a polished buckle and versatile design that complements both casual and business outfits.',
    price: 49.99,
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80'],
    category: 'Clothing',
    stock: 74,
    rating: 4.4,
    numReviews: 109
  },
  {
    name: 'Performance Hoodie',
    description: 'Warm fleece-lined hoodie with athletic fit, kangaroo pocket, and moisture-wicking fabric for workouts and cool evenings.',
    price: 64.99,
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80'],
    category: 'Clothing',
    stock: 96,
    rating: 4.7,
    numReviews: 265
  },
  {
    name: 'Atomic Habits',
    description: 'A practical guide to building better routines through systems, small habits, and consistent daily improvements.',
    price: 19.99,
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80'],
    category: 'Books',
    stock: 140,
    rating: 4.8,
    numReviews: 510
  },
  {
    name: 'The Midnight Library',
    description: 'A thought-provoking fiction novel exploring regret, possibility, and second chances through a magical library of alternate lives.',
    price: 17.99,
    images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80'],
    category: 'Books',
    stock: 132,
    rating: 4.7,
    numReviews: 412
  },
  {
    name: 'Deep Work',
    description: 'Learn how to focus intensely, eliminate distractions, and produce exceptional work in a world full of noise and interruptions.',
    price: 21.99,
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80'],
    category: 'Books',
    stock: 127,
    rating: 4.6,
    numReviews: 328
  },
  {
    name: 'Clean Code',
    description: 'A must-read for developers covering maintainable coding standards, testing, refactoring, and practical software craftsmanship.',
    price: 34.99,
    images: ['https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=500&q=80'],
    category: 'Books',
    stock: 90,
    rating: 4.9,
    numReviews: 603
  },
  {
    name: 'Mediterranean Cooking Handbook',
    description: 'Explore vibrant recipes, pantry essentials, and seasonal cooking ideas inspired by Mediterranean kitchens and coastal flavors.',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=500&q=80'],
    category: 'Books',
    stock: 116,
    rating: 4.5,
    numReviews: 188
  },
  {
    name: 'Organic Green Tea Sampler',
    description: 'A curated collection of antioxidant-rich green teas with fresh floral and grassy notes, ideal for mindful daily rituals.',
    price: 15.99,
    images: ['https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=500&q=80'],
    category: 'Food',
    stock: 290,
    rating: 4.6,
    numReviews: 402
  },
  {
    name: 'Artisan Coffee Beans',
    description: 'Single-origin arabica beans roasted in small batches, delivering notes of cacao, caramel, and bright citrus in every cup.',
    price: 18.99,
    images: ['https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=500&q=80'],
    category: 'Food',
    stock: 178,
    rating: 4.8,
    numReviews: 446
  },
  {
    name: 'Coconut Water Hydration Pack',
    description: 'Naturally hydrating, low-sugar coconut water with electrolytes to support active lifestyles and recovery after workouts.',
    price: 13.99,
    images: ['https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80'],
    category: 'Food',
    stock: 260,
    rating: 4.4,
    numReviews: 173
  },
  {
    name: 'Granola Breakfast Blend',
    description: 'Crunchy oat granola with almonds, dried berries, and honey for a nourishing breakfast or wholesome snack on the go.',
    price: 12.49,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80'],
    category: 'Food',
    stock: 310,
    rating: 4.5,
    numReviews: 220
  },
  {
    name: 'Olive Oil Reserve',
    description: 'Cold-pressed extra virgin olive oil with rich peppery finish, perfect for dressings, drizzling, and Mediterranean-inspired cooking.',
    price: 26.99,
    images: ['https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=500&q=80'],
    category: 'Food',
    stock: 165,
    rating: 4.7,
    numReviews: 312
  },
  {
    name: 'Vitamin D3 Immune Support',
    description: 'High-potency vitamin D3 softgels designed to support immune health, bone strength, and consistent daily wellness routines.',
    price: 16.99,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80'],
    category: 'Health',
    stock: 220,
    rating: 4.4,
    numReviews: 189
  },
  {
    name: 'Probiotic Balance Daily',
    description: 'Clinically backed probiotic formula that helps support digestion, gut health, and overall daily balance.',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500'],
    category: 'Health',
    stock: 175,
    rating: 4.6,
    numReviews: 304
  },
  {
    name: 'Magnesium Calm Capsules',
    description: 'A soothing magnesium supplement formulated to help relax muscles, support recovery, and encourage better rest.',
    price: 19.49,
    images: ['https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500'],
    category: 'Health',
    stock: 205,
    rating: 4.5,
    numReviews: 257
  },
  {
    name: 'Collagen Peptides Boost',
    description: 'Unflavored collagen peptides for hair, skin, nails, and joint support, easy to mix into coffee, smoothies, or oatmeal.',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'],
    category: 'Health',
    stock: 160,
    rating: 4.7,
    numReviews: 345
  },
  {
    name: 'Protein Powder Vanilla Blend',
    description: 'Creamy vanilla whey protein blend packed with 25g protein per serving to support lean muscle and post-workout recovery.',
    price: 39.99,
    images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=500&q=80'],
    category: 'Health',
    stock: 138,
    rating: 4.8,
    numReviews: 371
  },
  {
    name: 'Ceramic Vase Collection',
    description: 'Minimalist ceramic vase set with modern silhouettes and matte finish for shelves, dining tables, and statement decor.',
    price: 34.99,
    images: ['https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=500'],
    category: 'Home & Garden',
    stock: 74,
    rating: 4.6,
    numReviews: 121
  },
  {
    name: 'Indoor Herb Planter',
    description: 'Elegant wood-and-metal planter designed for basil, mint, and herbs with self-watering reservoir and drainage tray.',
    price: 42.99,
    images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500'],
    category: 'Home & Garden',
    stock: 63,
    rating: 4.5,
    numReviews: 97
  },
  {
    name: 'Adjustable Desk Lamp',
    description: 'Modern task lamp with dimmable LEDs, touch controls, and flexible arm for reading, crafting, and focused work.',
    price: 46.99,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'],
    category: 'Home & Garden',
    stock: 88,
    rating: 4.4,
    numReviews: 154
  },
  {
    name: 'Chef Knife Set',
    description: 'Ergonomic stainless-steel knife set with precision blades, protective block, and everyday kitchen versatility.',
    price: 89.99,
    images: ['https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=500&q=80'],
    category: 'Home & Garden',
    stock: 52,
    rating: 4.7,
    numReviews: 205
  },
  {
    name: 'Linen Throw Pillow Set',
    description: 'Soft textured pillow covers in neutral tones to elevate your living room, bedroom, and cozy seasonal decor.',
    price: 31.99,
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80'],
    category: 'Home & Garden',
    stock: 98,
    rating: 4.5,
    numReviews: 140
  },
  {
    name: 'Premium Yoga Mat',
    description: 'Extra-thick non-slip yoga mat with cushioning support, carrying strap, and durable surface for home and studio practice.',
    price: 39.99,
    images: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80'],
    category: 'Sports',
    stock: 118,
    rating: 4.7,
    numReviews: 203
  },
  {
    name: 'Adjustable Dumbbells Set',
    description: 'Space-saving weight set with quick-lock adjustments, ergonomic grips, and durable steel build for strength training at home.',
    price: 299.99,
    images: ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500'],
    category: 'Sports',
    stock: 24,
    rating: 4.6,
    numReviews: 157
  },
  {
    name: 'Foam Roller Recovery Kit',
    description: 'High-density foam roller designed to ease soreness, improve mobility, and support muscle recovery after intense workouts.',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=500'],
    category: 'Sports',
    stock: 110,
    rating: 4.4,
    numReviews: 98
  },
  {
    name: 'Resistance Band Set',
    description: 'Versatile set of durable exercise bands for strength training, stretching, and mobility workouts with multiple resistance levels.',
    price: 27.99,
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'],
    category: 'Sports',
    stock: 126,
    rating: 4.5,
    numReviews: 146
  },
  {
    name: 'Official Size Basketball',
    description: 'High-grip composite leather basketball built for indoor and outdoor play, complete with deep channels for better handling.',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=500&q=80'],
    category: 'Sports',
    stock: 92,
    rating: 4.3,
    numReviews: 112
  },
  {
    name: 'Plush Teddy Bear',
    description: 'Ultra-soft teddy bear with detailed stitching, huggable build, and machine-washable comfort for children and gift-givers.',
    price: 19.99,
    images: ['https://images.unsplash.com/photo-1556012018-50c5c0da73bf?auto=format&fit=crop&w=500&q=80'],
    category: 'Toys',
    stock: 150,
    rating: 4.9,
    numReviews: 567
  },
  {
    name: 'Wooden Play Kitchen',
    description: 'Creative faux kitchen set with utensils, sink, and stove features to spark imaginative role-play and family fun.',
    price: 89.99,
    images: ['https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=500&q=80'],
    category: 'Toys',
    stock: 46,
    rating: 4.8,
    numReviews: 204
  },
  {
    name: 'Strategy Board Game',
    description: 'A family-friendly strategy game with colorful tiles, tactical play, and replayable scenarios for game night excitement.',
    price: 34.99,
    images: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=80'],
    category: 'Toys',
    stock: 77,
    rating: 4.7,
    numReviews: 260
  },
  {
    name: 'Building Robot Kit',
    description: 'STEM-focused robot construction kit with colorful parts, coding basics, and endless imagination-building play.',
    price: 54.99,
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=500&q=80'],
    category: 'Toys',
    stock: 61,
    rating: 4.6,
    numReviews: 182
  },
  {
    name: 'Puzzle Adventure Set',
    description: 'Large-format educational puzzle designed for teamwork, fine motor coordination, and calm creative play.',
    price: 22.99,
    images: ['https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?auto=format&fit=crop&w=500&q=80'],
    category: 'Toys',
    stock: 103,
    rating: 4.5,
    numReviews: 134
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);
    console.log('Database seeded successfully with', sampleProducts.length, 'products');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
