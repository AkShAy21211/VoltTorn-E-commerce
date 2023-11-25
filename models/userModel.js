const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:false,
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:false
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true,
    },
    status:{
        type:Boolean,
        default:true,

    },
    is_verified:{
        type:Boolean,
        default:false
    },
    cart: [
         {
          _id:ObjectId,          
          product_id:[]
        },
      ],
      wishlist: [
        {
          product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product", // You can reference a User schema if you have one
          },
        },
      ],
    createdAt:{                    
        type:Date,
        default:Date.now,
      
    },
    updatedAt:{
        type:Date,
        default:Date.now,
        
    },
    isDelete:{
        type:Boolean,
        default:false,
    }
});





module.exports = mongoose.model('user',userSchema)
