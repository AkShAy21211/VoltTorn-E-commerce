const userModel = require("../models/userModel");


const loadOderManagment = async(req,res)=>{

    try{
        const user =  await userModel.find({is_admin:false});
        const oders =  user.flatMap(user=>user.oders);
        const oderCount = oders.length;
        const oderedCustomers = oders.map(oders=>oders.customerName);
        const customers = oderedCustomers.length;


        console.log(oders);
        res.render('oders',{oders,oderCount,customers});

    }catch(error){
        console.error(error);
    }
}

const adminChangeOderStatus = async(req,res)=>{

    try{

        const {id,status} = req.params;

        console.log(id,' ',status);

           const updateStatus =  await userModel.findOneAndUpdate({'oders._id':id},{$set:{'oders.$.status':status}},{new:true});
            return res.status(200).json({ updateStatus });


    }catch(error){
        console.error(error);
    }
}


module.exports = {
    loadOderManagment,
    adminChangeOderStatus
}