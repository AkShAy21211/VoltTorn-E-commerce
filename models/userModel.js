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
    createdAt:{                    
        type:Date,
        default:Date.now,
      
    },
    updatedAt:{
        type:Date,
        default:Date.now,
        
    }
});


module.exports = mongoose.model('User',userSchema);