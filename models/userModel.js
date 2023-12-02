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
