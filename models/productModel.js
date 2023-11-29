const mongoose = require("mongoose");

// Define the schema for the product
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  variants: [
    {
      color: String,
      images: [String],
    },
    
  ],
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
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
  reviews:{
    type:[Object],
    require:false,
  }
});


module.exports = mongoose.model("Product", productSchema);
