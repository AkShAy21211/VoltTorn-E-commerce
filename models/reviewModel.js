const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
        
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            
          },
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            
          },
          rating: {
            type: Number,
            min: 1,
            max: 5,
          },
          review: {
            type: String,
            required:false,
          },
          created_at: {
            type: Date,
            default: Date.now,
          },
 

});


module.exports = mongoose.model('Review',reviewSchema);