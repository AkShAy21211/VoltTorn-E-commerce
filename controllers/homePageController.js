const productModel = require("../models/productModel");
const bannerModel = require("../models/bannerModel");
const categoryModel = require("../models/categoryModel");

const loadHome = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    const currentDate = new Date();
    console.log(currentDate);
    const ProductData = await productModel.find({}).limit(4);
    const banner = await bannerModel.find({ endDate: { $gt: currentDate } });
    res.render("home", { category,banner,ProductData});
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

    res.render("productLists",{ProductData,ProductCount,category,cat_name,brands,brandCount});

  }catch(error){
    console.error(error);
  }
}


const productDetail = async (req, res) => {
  try {
    const {id,color} = req.params;
    const ProductData = await productModel.findById({_id:id});
    res.render("productDetail",{ProductData});
  } catch (error) {
    console.log(error.message);
  }
};


const sortProductByUserPreference = async (req, res) => {
  try {
      const { category, sortOption } = req.params;

      // Match stage to filter by category
      const matchStage = {
          $match: {
              category: category,
          },
      };

      // Sort stage based on sortOption
      const sortStage = {
          $sort: {
              price: sortOption === 'High to Low' ? -1 : 1,
          },
      };

      // Aggregate pipeline
      const aggregationPipeline = [matchStage, sortStage];

      // Your MongoDB aggregation query here

      // Example: Assuming you have a 'products' collection
      const products = await productModel.aggregate(aggregationPipeline);

      console.log('Sorted products:', products);

      // Your response logic here
      res.status(200).json({ products });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};


module.exports = { 
  loadHome,
  productDetail,
  loaadProductListsByCategory,
  sortProductByUserPreference,

};
