const usercartModel  = require("../models/userModel");
const productModel = require("../models/productModel");

const userShoppingCartPageLoad = async (req, res) => {
  try {
   
    
    res.render("cart",);
    console.log(cartProduct);
  } catch (error) {
    console.error(error);
  }
};


module.exports = {
  userShoppingCartPageLoad,
};
