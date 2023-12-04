const userModel = require("../models/userModel");
const { use } = require("../routes/userRoute");


//USER SETTINGS PAGE 

const loadUserSettings  = async (req, res) => {
    try {
      const id = req.session.user && req.session.user.userId ? req.session.user.userId : undefined;
  
      if (id) {
        const user = await userModel.findById(id);
        res.render('settings', { user });
      } else {
        res.render('settings');
      }
    } catch (error) {
      console.error(error);
    }
  };


  
  const editUserProfile = async(req,res)=>{
  
    try{
  
      console.log("update e  dd d d d d d d d d  d d d dd d d ");
      const id = req.params.id ? req.params.id : {};
      const { firstName, lastName, mobile, email, password } = req.body;
      const image = req.file ? req.file.filename : null;
      
      // Check if a new password is provided
      const hashPassword = password ? await securePassword(password) : undefined;
      
      // Build the update object based on whether a new password is provided
      const updateObject = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        mobile: mobile,
      };
      
  
      console.log(updateObject);
      // Include password in the update only if a new password is provided
  
      if(image){
        updateObject.image = image;
      }
      if (hashPassword ) {
        updateObject.password = hashPassword;
  
        
      }
      
      // Update the user profile
      const updateUserProfile = await userModel.findOneAndUpdate(
        { _id: id },
        { $set: updateObject },
        { new: true } // Return the updated document
      );
      
      console.log(updateUserProfile);
      res.redirect('/home/settings')
    }catch(error){
  
      console.error(error);
    }
  }

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



const loadUserOdersPage = async(req,res)=>{
    try{
      const id = req.session.user && req.session.user.userId ? req.session.user.userId : undefined;
      const oders = (await userModel.find({_id:id},{oders:1})).flatMap(oders=>oders.oders);

      res.render("oders",{oders});
  
    }catch(error){
      console.error(error);
    }
  }



  const forCancelUserOders = async(req,res)=>{

    try{
      const id = req.session.user && req.session.user.userId ? req.session.user.userId : undefined;
      const oder_id = req.params.oder_id;

      console.log(oder_id);

      if(oder_id){

        const updatedUserOder = await userModel.findOneAndUpdate(
          {
            _id: id,
            'oders._id': oder_id,
          },
          {
            $set: {
              'oders.$.is_cancelled': true,
            },
          },
          { new: true }
        ).exec();

       console.log(updatedUserOder);
       // Assuming `order_id` is the ID you're searching for
       

      }


      res.redirect('/home/settings/oders');

    }catch(error){
      console.error(error);
    }
  }
  module.exports ={
    loadUserSettings,
    editUserProfile,
    loadOderManagment,
    loadUserOdersPage,
    forCancelUserOders,
  }