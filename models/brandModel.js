const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    status:{
        type:Boolean,
        required:true,

    }
    // You can add more fields as needed, such as website, contact info, etc.
  });


module.exports = mongoose.model('Brand', brandSchema);
