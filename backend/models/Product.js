const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: { type: String },
  color: { type: String },
  stock: { type: Number, default: 0 }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  subCategory: { type: String },
  price: { type: Number, required: true },       // MRP
  sellingPrice: { type: Number, required: true }, // discounted price shown to buyer
  images: [{ type: String }],                     // stored file paths / URLs
  variants: [variantSchema],
  totalStock: { type: Number, default: 0 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.virtual('discountPercent').get(function () {
  if (!this.price) return 0;
  return Math.round(((this.price - this.sellingPrice) / this.price) * 100);
});
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
