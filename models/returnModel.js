const mongoose = require('mongoose');

// Create a schema
const returnProductSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // Reference to the Order model
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    returnReason: {
        type: String,
        required: true
    },
    quantity:{
        type:Number,
        default:0,
    },
    returnDate: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: ''
    },

    // You can add more fields as needed
});

// Create a model
module.exports = mongoose.model('ReturnProduct', returnProductSchema);

