const productModel = require("../models/productModel");
const bannerModel = require("../models/bannerModel");

const loadHome = async (req, res) => {
  try {
    const ProductData = await productModel.find({}).populate("category");
    const banner = await bannerModel.find({});
    res.render("home", { ProductData,banner});

  } catch (error) {
    console.log(error.message);
  }
};

const productDetail = async (req, res) => {
  try {
    const id = req.params.id;
    const color = req.params.color;
    const ProductData = await productModel.findById({_id:id});
    res.render("productDetail",{ProductData});
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { 
  loadHome,
  productDetail,

};
