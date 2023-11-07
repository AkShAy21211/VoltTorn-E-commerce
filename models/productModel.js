const mongoose = require('mongoose');

// Define the schema for the product
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
    },
    image: {
        type: String,
    },
    stock: {
        type: Number,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },updated: {
        type: Date,
        default: Date.now,
    },
    // Array field for storing reviews and ratings
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // You can reference a User schema if you have one
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
            review:{ 
                type:String,
                
            },
            created_at: {
                type: Date,
                default: Date.now,
            },
            updated: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    
});



module.exports = mongoose.model('Product',productSchema);