const mongoose = require("mongoose");

// Define the schema for the product
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true, // You can reference a User schema if you have one
  },
  brand: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: false,
  },
  status: {
    type: Boolean,
    required: true,
  },

  stock: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },

  image: {
    type: Array,
    required: true,
  },
  // Array field for storing reviews and ratings
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // You can reference a User schema if you have one
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: {
        type: String,
      },
      created_at: {
        type: Date,
        default: Date.now,
      },
      updated_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});



const phoneSchema = new mongoose.Schema({
  model: {
    number: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
  },
  general: {
    inTheBox: [{ type: String, required: true }],
    hybridSimSlot: { type: Boolean, default: false },
    touchscreen: { type: Boolean, default: false },
    otgCompatible: { type: Boolean, default: false },
  },
  displayFeatures: {
    size: { type: String, required: true },
    resolution: { type: String, required: true },
    resolutionType: { type: String, required: true },
  },
  // ... (continue for other sections like os & processor features, memory & storage features, etc.)
  dimensions: {
    width: { type: String, required: true },
    height: { type: String, required: true },
    depth: { type: String, required: true },
    weight: { type: String, required: true },
  },
  warranty: {
    summary: { type: String, required: true },
    domesticWarranty: { type: String, required: true },
  },
  // ... (add more sections as needed)
});

const Phone = mongoose.model("Phone", phoneSchema);

module.exports = Phone;

module.exports = mongoose.model("Product", productSchema);
