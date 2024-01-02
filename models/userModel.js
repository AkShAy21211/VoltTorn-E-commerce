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
  order_id: {
    type: Number,
    required: true,
  },
  customerName: String,
  payment:{
    type:Boolean,
    default:false,
  },
  payment_mode:String,
  address: {
    address: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  products: [],
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered'],
    default: 'Pending',
  },
  date: Date,
  quantity: Number,
  totalAmount: Number,
  // is_cancelled: {
  //   type: Boolean,
  //   default: false,
  // },
  return:{
    type:Date,
    default: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now

  },
  pickDate:{
    type:Date,
    required:false,
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
  wallet: {
  balance:{
    type:Number,
    require:true,
    default:0,
  },
  currency: {
    type:String,
    required:true,
    default:"IN",
  },
  transactions: [
      {
        type: {
          type:String,
          required:false,
          default:""
        },
        amount:{
          type:Number,
          required:false,
          default:0,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        description: {
          type:String,
          required:false,
          default:""
        },
      },
    ],
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
  token:{
    type:String,
    default:"",
  },
  referralCode: {
    type:String,
    required:true,
  },
  referredBy: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'user',
    required:false,
   },
  referredPurchases: {
     type: Number,
      default: 0 
    },
});

module.exports = mongoose.model("user", userSchema);
