const userModel = require("../models/userModel");


//ADMIN CUSTOMER PAGE LOAD

const loadCustomers = async (req, res) => {
    try {
      const customerData = await userModel.find({ is_admin: 0 });
      if (customerData) {
        res.render("customers", { customers: customerData });
      } else {
        console.log("no data found");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  
  //DELETE USRES
  
  const deleteUser = async (req, res) => {
    try {
      const id = req.query.id;
      await userModel.deleteOne({ _id: id });
      res.redirect("/admin/customers");
    } catch (error) {
      console.log(error.message);
    }
  };
  
  //BLOCK USERS
  
  const blockUnblockUser = async (req, res) => {
    try {
      const id = req.query.id;
      const userData = await userModel.findOne({ _id: id });
  
      if (!userData) {
        return res.status(404).send("User not found");
      }
  
      const updatedStatus = !userData.status; // Toggle the status
  
      const updatedUser = await userModel.updateOne(
        { _id: id },
        { $set: { status: updatedStatus } }
      );
  
      if (updatedUser) {
        res.redirect("/admin/customers");
      } else {
        res.status(500).send("Failed to update user status");
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  };
  

  module.exports={
    loadCustomers,
    deleteUser,
    blockUnblockUser,
  }