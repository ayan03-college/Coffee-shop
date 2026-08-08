require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');
const Coupon = require('./models/Coupon');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Review = require('./models/Review');

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const defaultSizes = [
  { label: 'Small', priceModifier: -30 },
  { label: 'Medium', priceModifier: 0 },
  { label: 'Large', priceModifier: 40 },
];

// Maps each menu category to Flickr search tags so the returned photo actually
// matches the drink type, instead of a random unrelated photo.
const categoryTags = {
  Cappuccino: 'cappuccino,coffeecup',
  Latte: 'latteart,coffee',
  Espresso: 'espresso,coffeeshot',
  'Cold Coffee': 'icedcoffee,coldbrew',
  Americano: 'americano,blackcoffee',
  Frappuccino: 'frappuccino,icedcoffee',
  'Hot Coffee': 'hotcoffee,coffeecup',
  Mocha: 'mochacoffee,coffee',
};

const img = (category, index) => {
  const tags = categoryTags[category] || 'coffee,coffeecup';
  // /600/600/tags/all/index -> "all" requires every tag to match, and the
  // numeric lock varies the photo per product so items in the same category
  // don't all show the exact same picture.
  return `https://loremflickr.com/600/600/${tags}/all?lock=${index}`;
};

const rawProducts = [
  { name: 'Classic Cappuccino', category: 'Cappuccino', price: 220, description: 'A timeless blend of rich espresso, steamed milk, and a deep layer of velvety foam.', tags: ['classic', 'creamy'], featured: true },
  { name: 'Caramel Cappuccino', category: 'Cappuccino', price: 250, description: 'Our classic cappuccino swirled with buttery caramel sauce for a sweet twist.', tags: ['sweet', 'caramel'] },
  { name: 'Vanilla Bean Cappuccino', category: 'Cappuccino', price: 240, description: 'Smooth cappuccino infused with real vanilla bean for a fragrant, comforting sip.', tags: ['vanilla'] },
  { name: 'Iced Cappuccino', category: 'Cold Coffee', price: 230, description: 'Chilled espresso and cold milk foam poured over ice for a refreshing pick-me-up.', tags: ['cold', 'iced'] },
  { name: 'Signature Hot Latte', category: 'Latte', price: 230, description: 'Smooth espresso layered with steamed milk and a delicate art of microfoam.', tags: ['milky', 'smooth'], featured: true },
  { name: 'Vanilla Latte', category: 'Latte', price: 250, description: 'Espresso and steamed milk sweetened with classic vanilla syrup.', tags: ['vanilla', 'sweet'] },
  { name: 'Hazelnut Latte', category: 'Latte', price: 260, description: 'A nutty, aromatic twist on our classic latte with hazelnut syrup.', tags: ['nutty'] },
  { name: 'Caramel Macchiato', category: 'Latte', price: 270, description: 'Vanilla-infused milk marked with espresso and finished with caramel drizzle.', tags: ['caramel', 'signature'], bestSeller: true },
  { name: 'Iced Vanilla Latte', category: 'Cold Coffee', price: 260, description: 'Chilled espresso, cold milk, and vanilla syrup served over ice.', tags: ['cold', 'vanilla'] },
  { name: 'Pumpkin Spice Latte', category: 'Latte', price: 280, description: 'Seasonal favorite with pumpkin spice flavors, steamed milk, and whipped cream.', tags: ['seasonal', 'spice'], newArrival: true },
  { name: 'Classic Espresso Shot', category: 'Espresso', price: 150, description: 'A concentrated shot of rich, bold espresso — pure coffee at its finest.', tags: ['bold', 'strong'] },
  { name: 'Double Espresso', category: 'Espresso', price: 190, description: 'Two shots of our signature espresso blend for an extra energy boost.', tags: ['strong', 'double'] },
  { name: 'Espresso Con Panna', category: 'Espresso', price: 200, description: 'Bold espresso topped with a dollop of fresh whipped cream.', tags: ['cream'] },
  { name: 'Ristretto', category: 'Espresso', price: 180, description: 'A short, concentrated espresso shot with a bold, syrupy texture.', tags: ['intense'] },
  { name: 'Affogato', category: 'Espresso', price: 260, description: 'A scoop of vanilla ice cream drowned in a hot shot of espresso.', tags: ['dessert'], newArrival: true },
  { name: 'Classic Americano', category: 'Americano', price: 190, description: 'Espresso diluted with hot water for a smooth, full-bodied classic cup.', tags: ['classic'], featured: true },
  { name: 'Iced Americano', category: 'Cold Coffee', price: 200, description: 'Bold espresso and cold water served over ice — crisp and refreshing.', tags: ['cold', 'crisp'], bestSeller: true },
  { name: 'Long Black', category: 'Americano', price: 195, description: 'Hot water topped with a double shot of espresso for a rich crema layer.', tags: ['rich'] },
  { name: 'Red Eye Americano', category: 'Americano', price: 210, description: 'Our classic americano boosted with an extra shot for maximum energy.', tags: ['strong', 'energy'] },
  { name: 'Classic Mocha', category: 'Mocha', price: 260, description: 'Espresso, steamed milk, and rich chocolate sauce topped with whipped cream.', tags: ['chocolate', 'sweet'], featured: true },
  { name: 'White Chocolate Mocha', category: 'Mocha', price: 280, description: 'Espresso blended with creamy white chocolate sauce and steamed milk.', tags: ['white chocolate'], bestSeller: true },
  { name: 'Dark Chocolate Mocha', category: 'Mocha', price: 270, description: 'A rich, bittersweet dark chocolate mocha for the true chocolate lover.', tags: ['dark chocolate'] },
  { name: 'Iced Mocha', category: 'Cold Coffee', price: 270, description: 'Chocolatey espresso and cold milk poured over ice, topped with cream.', tags: ['cold', 'chocolate'] },
  { name: 'Mint Mocha', category: 'Mocha', price: 275, description: 'Chocolate espresso with a refreshing hint of peppermint.', tags: ['mint', 'seasonal'], newArrival: true },
  { name: 'Classic Frappuccino', category: 'Frappuccino', price: 290, description: 'Blended ice, coffee, and milk topped with whipped cream — our best seller.', tags: ['blended', 'icy'], bestSeller: true, featured: true },
  { name: 'Caramel Frappuccino', category: 'Frappuccino', price: 310, description: 'Coffee blended with ice and caramel, crowned with whipped cream and drizzle.', tags: ['caramel', 'blended'] },
  { name: 'Mocha Frappuccino', category: 'Frappuccino', price: 310, description: 'Chocolatey coffee blended with ice for a decadent frozen treat.', tags: ['chocolate', 'blended'] },
  { name: 'Java Chip Frappuccino', category: 'Frappuccino', price: 320, description: 'Coffee blended with chocolate chips, ice, and topped with whipped cream.', tags: ['chocolate chip'], newArrival: true },
  { name: 'Cookies & Cream Frappuccino', category: 'Frappuccino', price: 320, description: 'A dreamy blend of cookies, cream, and coffee over crushed ice.', tags: ['dessert', 'blended'], newArrival: true },
  { name: 'Cold Brew', category: 'Cold Coffee', price: 220, description: 'Slow-steeped for 20 hours for a smooth, naturally sweet, low-acid coffee.', tags: ['cold brew', 'smooth'], todaySpecial: true },
  { name: 'Nitro Cold Brew', category: 'Cold Coffee', price: 260, description: 'Cold brew infused with nitrogen for a creamy, cascading texture.', tags: ['nitro', 'creamy'], todaySpecial: true, bestSeller: true },
  { name: 'Vanilla Sweet Cream Cold Brew', category: 'Cold Coffee', price: 270, description: 'Smooth cold brew topped with a float of vanilla sweet cream.', tags: ['cold brew', 'vanilla'] },
  { name: 'Turkish Coffee', category: 'Hot Coffee', price: 200, description: 'Finely ground coffee simmered to perfection, served unfiltered in the traditional style.', tags: ['traditional', 'strong'] },
  { name: 'Filter Coffee', category: 'Hot Coffee', price: 150, description: 'A South Indian classic — strong decoction filter coffee with frothy milk.', tags: ['traditional'], todaySpecial: true },
  { name: 'Hot Chocolate', category: 'Hot Coffee', price: 210, description: 'Rich steamed milk blended with premium chocolate, topped with whipped cream.', tags: ['chocolate', 'kids favorite'] },
  { name: 'Café au Lait', category: 'Hot Coffee', price: 200, description: 'Equal parts brewed coffee and steamed milk for a gentle, comforting cup.', tags: ['mild'] },
];

const products = rawProducts.map((p, i) => ({
  name: p.name,
  slug: slugify(p.name),
  description: p.description,
  ingredients: ['Arabica Coffee Beans', 'Fresh Milk', 'Filtered Water', 'Natural Flavoring'],
  nutrition: {
    calories: 90 + (i % 6) * 30,
    protein: 2 + (i % 4),
    fat: 1 + (i % 5),
    carbs: 10 + (i % 8) * 3,
    sugar: 5 + (i % 10) * 2,
    caffeine: 65 + (i % 5) * 20,
  },
  price: p.price,
  image: img(p.category, i),
  images: [img(p.category, i)],
  category: p.category,
  sizes: defaultSizes,
  rating: Math.round((3.8 + ((i * 7) % 12) / 10) * 10) / 10,
  numReviews: 5 + (i % 40),
  stock: 100,
  isFeatured: !!p.featured,
  isNewArrival: !!p.newArrival,
  isTodaySpecial: !!p.todaySpecial,
  isBestSeller: !!p.bestSeller,
  soldCount: 20 + (i % 15) * 13,
  tags: p.tags,
}));

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      Product.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
      Review.deleteMany(),
      Coupon.deleteMany(),
    ]);
    // Keep existing non-admin users intact, but ensure the admin account exists
    await User.deleteMany({ email: process.env.ADMIN_EMAIL || 'admin@coffeeshop.com' });

    console.log('Seeding products...');
    await Product.insertMany(products);

    console.log('Seeding admin user...');
    await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@coffeeshop.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });

    console.log('Seeding demo customer...');
    const existingDemo = await User.findOne({ email: 'demo@coffeeshop.com' });
    if (!existingDemo) {
      await User.create({
        name: 'Demo Customer',
        email: 'demo@coffeeshop.com',
        password: 'Demo@12345',
        role: 'user',
      });
    }

    console.log('Seeding coupons...');
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    await Coupon.insertMany([
      {
        code: 'WELCOME10',
        type: 'percentage',
        value: 10,
        minOrderAmount: 0,
        maxDiscountAmount: 150,
        expiresAt: in30Days,
        description: '10% off for new customers',
      },
      {
        code: 'COFFEE20',
        type: 'percentage',
        value: 20,
        minOrderAmount: 300,
        maxDiscountAmount: 300,
        expiresAt: in30Days,
        description: '20% off on orders above ₹300',
      },
      {
        code: 'FIRSTORDER',
        type: 'flat',
        value: 200,
        minOrderAmount: 500,
        expiresAt: in30Days,
        description: '₹200 off on your first order above ₹500',
      },
    ]);

    console.log('✅ Seed complete!');
    console.log(`   ${products.length} products created`);
    console.log(`   Admin login: ${process.env.ADMIN_EMAIL || 'admin@coffeeshop.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@12345'}`);
    console.log('   Demo login: demo@coffeeshop.com / Demo@12345');
    console.log('   Coupons: WELCOME10, COFFEE20, FIRSTORDER');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Promise.all([
      Product.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
      Review.deleteMany(),
      Coupon.deleteMany(),
      User.deleteMany(),
    ]);
    console.log('✅ All data destroyed');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
