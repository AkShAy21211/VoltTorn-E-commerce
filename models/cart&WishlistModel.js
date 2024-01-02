const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    cart: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product", // You can reference a Product schema if you have one
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
            name: {
                type: String,
                required: true,
            },
            
            image: {
                type: String,
                required: false,
            },
            price: {
                type: Number,
                required: false,
                default: 0,
            },
            discountApplied:{
                type:Boolean,
                default:false
            },
            cancelled:{
                type:Boolean,
                default:false,
            },
            returned:{
                type: String,
                default: "",
            },


   
            
        },
    ],
    total_price: {
        type: Number,
        required:false,
    },
});






const WishListSchema = new mongoose.Schema({

    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    product:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    }]
});



const CartModel = mongoose.model('Cart', CartSchema);
const WishListModel = mongoose.model('Wishlist', WishListSchema);

module.exports = {
    CartModel,
    WishListModel
};
