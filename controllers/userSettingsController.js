const userModel = require("../models/userModel");

//USER SETTINGS PAGE

const loadUserSettings = async (req, res) => {
  try {
    const id =
      req.session.user && req.session.user.userId
        ? req.session.user.userId
        : undefined;

    if (id) {
      const user = await userModel.findById(id);
      res.render("settings", { user });
    } else {
      res.render("settings");
    }
  } catch (error) {
    console.error(error);
  }
};

const editUserProfile = async (req, res) => {
  try {
    const id = req.params.id ? req.params.id : {};
    const { firstName, lastName, mobile, email } = req.body;
    const image = req.file ? req.file.filename : null;
    
    const updateObject = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile: mobile,
    };

    console.log(updateObject);

    if (image) {
      updateObject.image = image;
    }

    // Update the user profile
    const updateUserProfile = await userModel.findOneAndUpdate(
      { _id: id },
      { $set: updateObject },
      { new: true } // Return the updated document
    );

    res.redirect("/home/settings/profile");
  } catch (error) {
    console.error(error);
  }
};


const deleteUserAddress = async(req,res)=>{
  try{

    const id = req.session.user.userId;
    const address_id = req.params.address_id;
    console.log(id," ",address_id);

    if(id && address_id){

      await userModel.findByIdAndUpdate({_id:id},{$pull:{addresses:{_id:address_id}}});
    }
    res.redirect("/home/settings/profile");

  }catch(error){
    console.error(error);
  }
}

const loadOderManagment = async (req, res) => {
  try {
    const user = await userModel.find({ is_admin: false });
    const oders = user.flatMap((user) => user.oders);
    const oderCount = oders.length;
    const oderedCustomers = oders.map((oders) => oders.customerName);
    const customers = oderedCustomers.length;

    console.log(oders);
    res.render("oders", { oders, oderCount, customers });
  } catch (error) {
    console.error(error);
  }
};

const loadUserOdersPage = async (req, res) => {
  try {
    const id =
      req.session.user && req.session.user.userId
        ? req.session.user.userId
        : undefined;
    const oders = (await userModel.find({ _id: id }, { oders: 1 })).flatMap(
      (oders) => oders.oders
    );

    res.render("oders", { oders });
  } catch (error) {
    console.error(error);
  }
};

const forCancelUserOders = async (req, res) => {
  try {
    const id =
      req.session.user && req.session.user.userId
        ? req.session.user.userId
        : undefined;
    const oder_id = req.params.oder_id;

    console.log(oder_id);

    if (oder_id) {
      const updatedUserOder = await userModel
        .findOneAndUpdate(
          {
            _id: id,
            "oders._id": oder_id,
          },
          {
            $set: {
              "oders.$.is_cancelled": true,
            },
          },
          { new: true }
        )
        .exec();

      console.log(updatedUserOder);
      // Assuming `order_id` is the ID you're searching for
    }

    res.redirect("/home/settings/oders");
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  loadUserSettings,
  editUserProfile,
  loadOderManagment,
  loadUserOdersPage,
  forCancelUserOders,
  deleteUserAddress,
};
