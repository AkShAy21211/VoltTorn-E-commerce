const productModel = require("../models/productModel");

const loadHome = async (req, res) => {
  try {
    const ProductData = await productModel.find({}).populate("category");
    const sessionData = req.session || {};
    console.log(ProductData);
    res.render("home", { sessionData, ProductData });
  } catch (error) {
    console.log(error.message);
  }
};

const productDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const ProductData = await productModel.findById({_id:id});
    console.log(ProductData);
    console.log(ProductData);
    res.render("productDetail",{ProductData});
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { 
  loadHome,
  productDetail,

};
