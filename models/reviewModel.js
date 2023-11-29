const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
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


module.exports = mongoose.model('Review',reviewSchema);