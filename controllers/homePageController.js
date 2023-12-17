const productModel = require("../models/productModel");
const bannerModel = require("../models/bannerModel");
const categoryModel = require("../models/categoryModel");
const mailchimp = require("@mailchimp/mailchimp_marketing");

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


    res.render("productLists",{ProductData,ProductCount,category,cat_name,brands});

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
const filterProductsByUser = async (req, res) => {
  try {
    console.log("nwfubniuwbnfibefbnkw");
const {subCategory,brand,selectedPrice,price} = req.query;
const sortOption = selectedPrice === -1 ? { price: -1 } : { price: 1 };

const selectedSubCategories = subCategory ? subCategory.split(',') : [];
const selectedBrands = brand ? brand.split(',') : [];
const category = req.params.cat_name;


const ProductData = await productModel.find({
  category: category,
  $or: [
    { sub_Category: { $in: selectedSubCategories } },
    { brand: { $in: selectedBrands } },
  ],

});


const productCount = ProductData.length;


    res.status(200).json({ProductData,productCount});
  } catch (error) {
    console.error(error);
    // Handle errors and send an error response if necessary
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const sendEmailNewsLetter = async(req,res)=>{

  try{
      const {email} = req.body;
        const response = await mailchimp.lists.addListMember(process.env.LIST_ID, {
        email_address: email,
        status: "subscribed",
      }).then(response=>{
      res.status(200).json({response})
      });

  }catch(error){
    res.status(400);
    console.error(error);
  }
}
module.exports = { 
  loadHome,
  productDetail,
  loaadProductListsByCategory,
  sortProductByUserPreference,
  sendEmailNewsLetter,
  filterProductsByUser,

};
