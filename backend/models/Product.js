const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema(
  {
    label: { type: String, enum: ['Small', 'Medium', 'Large'], required: true },
    priceModifier: { type: Number, default: 0 }, // added to base price
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    ingredients: [{ type: String }],
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      caffeine: { type: Number, default: 0 },
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    images: [{ type: String }],
    category: {
      type: String,
      required: true,
      enum: [
        'Hot Coffee',
        'Cold Coffee',
        'Espresso',
        'Cappuccino',
        'Latte',
        'Mocha',
        'Americano',
        'Frappuccino',
      ],
    },
    sizes: { type: [sizeSchema], default: () => ([
      { label: 'Small', priceModifier: -30 },
      { label: 'Medium', priceModifier: 0 },
      { label: 'Large', priceModifier: 40 },
    ]) },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    stock: { type: Number, default: 100 },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTodaySpecial: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    soldCount: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
