const productModel = require("../models/productModel");
const bannerModel = require("../models/bannerModel");
const categoryModel = require("../models/categoryModel");

const loadHome = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    const currentDate = new Date();
    console.log(currentDate);
    const banner = await bannerModel.find({ endDate: { $gt: currentDate } });
    res.render("home", { category,banner});
  } catch (error) {
    console.log(error.message);
  }
};


const loaadProductListsByCategory = async(req,res)=>{
  try{

    const  {cat_name} = req.params;
    const ProductData = await productModel.find({category:cat_name});
    const ProductCount = await productModel.find({category:cat_name}).countDocuments();
    const category = await categoryModel.find({category:cat_name});
    const result = await productModel.aggregate([
  {
    $match: {
      category: cat_name,
    },
  },
  {
    $group: {
      _id: "$brand",
    },
  },
]);

const brands = result.map((entry) => entry._id);
const brandCount =  await productModel.aggregate([{$match: {category: cat_name, },},{
  $group: {
    _id: "$brand",
    count: { $sum: 1 }, // Count the number of products for each brand
  },
},]);

    res.render("productLists",{ProductData,ProductCount,category,brands,brandCount});

  }catch(error){
    console.error(error);
  }
}


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
  loaadProductListsByCategory,

};
