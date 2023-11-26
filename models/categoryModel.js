const mongooose = require("mongoose");

const categorySchema = new mongooose.Schema({

    category:{

        type:String,
        required:true,
    },
    sub_Category:{
        type:[String],
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    description:{

        type:String,
        required:true
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


module.exports = mongooose.model('Category',categorySchema);