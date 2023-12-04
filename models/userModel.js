const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  address: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  city:{
    type:String,
    required:true,
  },
  zip: {
    type: String,
    required: false,
  },
});


const orderSchema = new mongoose.Schema({
  oder_id:{
    type:Number,
    required:true
  },
  customerName: String,
  products: [],
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered'], // Define possible status values
    default: 'Pending', // Set a default status
  },
  date:Date,
  quantity:Number,
  totalAmount: Number,
  is_cancelled:{
    type:Boolean,
    default:false,
  }
});


const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  wishlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wishlist",
  },
  addresses: [addressSchema], // Array of addresses
  oders:[orderSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isDelete: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("user", userSchema);
