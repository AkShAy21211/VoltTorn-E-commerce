const productModel = require("../models/productModel");
const bannerModel = require("../models/bannerModel");
const categoryModel = require("../models/categoryModel");
const offerModal = require("../models/offerModal");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const reviewModal = require("../models/reviewModel");
const brandModal = require('../models/brandModel');
const nodemailer = require("nodemailer");

const loadHome = async (req, res) => {
  try {
  const category = await categoryModel.find({});
  const brands = await brandModal.aggregate([
  { $match: { status: true } },
  { $sample: { size: 5 } }
]);
    const offers = await offerModal.find({isActive:true,offerType:{$ne:'Referral'},endDate: { $gt: new Date()}})
    const currentDate = new Date();
    console.log(currentDate);
    const ProductData = await productModel.aggregate([
      { $match: { status: true } },
      { $sample: { size: 4 } }
    ]);
        const banner = await bannerModel.find({ endDate: { $gt: currentDate } });
    res.render("home", { category,banner,ProductData,offers,brands});
  
  } catch (error) {
    console.log(error.message);
  }
};



const searchProductsHome = async(req,res)=>{

  try{
    const {value} = req.query;
    const brands = await brandModal.find({status:true});
    const categorys = await categoryModel.find({});
    const page = req.query.page;
    const perPage = 6;
    let proCount;
    const ProductData = await productModel.find({})
    .then(products=>{

      proCount = products;

      return productModel.find({status:true, name: { $regex: value, $options: 'i' } })
      .skip((page - 1)* perPage)
      .limit(perPage);

    });
    const ProductCount = await productModel.find({ name: { $regex: value, $options: 'i' } }).limit(6).countDocuments();
    const offers = await offerModal.find({
     $or: [
       { offerType: 'Product' },
       {offerType:"Category"},
     ],
   });  
   return res.render('searchProducts',{ProductData,offers,ProductCount,brands,categorys, value,currentPage:page,totalProducts:proCount,pages:Math.ceil(proCount/perPage)});
 
   }catch(error){
     console.error(error);
   }


}

const filterSearchedProducts = async(req,res)=>{
  try {
    const {category,brand,sort} = req.query;
    const selectedCategories = category ? category.split(',') : [];
    const selectedBrands = brand ? brand.split(',') : [];
    const sortOption = sort === 'High to Low' ? -1 : 1 ;

    console.log(selectedCategories,selectedBrands,sortOption);
    const offer = await offerModal.find({
      $or: [
        { offerType: 'Product' },
        { offerType: 'Category' },

      ],
    });     
    const ProductData = await productModel.find({
      $or: [
        { category: { $in: selectedCategories } },
        { brand: { $in: selectedBrands } },
      ],
    
    }).sort({price:sortOption});
    
    
    const productCount = ProductData.length;
    
    
        res.status(200).json({ProductData,productCount,offer});
      } catch (error) {
        console.error(error);
        // Handle errors and send an error response if necessary
        res.status(500).json({ error: 'Internal Server Error' });
      }
  
}







const loaadProductListsByCategory = async(req,res)=>{
  try{

    const  {cat_name} = req.params;
    const page = req.query.page;
    const perPage = 6;
    let proCount;
    const ProductData = await productModel.find({category:cat_name,status:true})
    .countDocuments()
    .then(products=>{

      proCount = products;

      return productModel.find({category:cat_name,status:true})
      .skip((page - 1)* perPage)
      .limit(perPage);

    })
   
    
    const offers = await offerModal.find({isActive:true,offerType:{$ne:'Referral'},endDate: { $gt: new Date()}})
    const ProductCount = await productModel.find({category:cat_name,status:true}).countDocuments();
    const category = await categoryModel.find({category:cat_name});
    const result = await productModel.aggregate([
  {
    $match: {
      category: cat_name,
      status:true,
    },
  },
  {
    $group: {
      _id: "$brand",
    },
  },
]);

const brands = result.map((entry) => entry._id);


    res.render("productLists",{ProductData,
      ProductCount,
      category,
      cat_name,
      brands,
      offers,
      currentPage:page,
      totalProducts:proCount,
      pages:Math.ceil(proCount/perPage)});

  }catch(error){
    console.error(error);
  }
}

const productDetail = async (req, res) => {
  try {
    const {id} = req.params;
    const offers = await offerModal.find({});
    const ProductData = await productModel.findById({_id:id});
    const reviews = await reviewModal.find({product:id}).populate('user');

    console.log(reviews);
    res.render("productDetail",{ProductData,offers,reviews});
  } catch (error) {
    console.log(error.message);
  }
};


const sortProductByUserPreference = async (req, res) => {
  try {
      const { category, sortOption } = req.params;
      const offer = await offerModal.find({
        $or: [
          { offerType: 'Product' }, { offer: category },
        ],
      });     
       const priceDirection = sortOption === "High to Low"?-1:1;

      const products = await productModel
      .find({ category: category })
      .sort({ priceDiscount: priceDirection }).limit(6);
  
      res.status(200).json({ products,offer });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};


const filterProductsByUser = async (req, res) => {
  try {
const {subCategory,brand,sort} = req.query;
const selectedSubCategories = subCategory ? subCategory.split(',') : [];
const selectedBrands = brand ? brand.split(',') : [];
const category = req.params.cat_name;
const sortOption = sort === 'High to Low' ? -1 : 1 ;

const offer = await offerModal.find({
  $or: [
    { offerType: 'Product' }, { offer: category },
  ],
});     
const ProductData = await productModel.find({
  category: category,
  $or: [
    { sub_Category: { $in: selectedSubCategories } },
    { brand: { $in: selectedBrands } },
  ],

}).sort({price:sortOption});


const productCount = ProductData.length;


    res.status(200).json({ProductData,productCount,offer});
  } catch (error) {
    console.error(error);
    // Handle errors and send an error response if necessary
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const searchProducts = async(req,res)=>{

  try{
   const {value} = req.query;
   const {cat_name} = req.params;
   const products = await productModel.find({category:cat_name, name: { $regex: value, $options: 'i' } });
   const offer = await offerModal.find({
    $or: [
      { offerType: 'Product' }, { offer: cat_name },
    ],
  });  
   res.status(200).json({products,offer});

  }catch(error){
    console.error(error);
  }
}

const sendEmailNewsLetter = async(req,res)=>{

  try{
      const {email} = req.body;

      console.log("called .....");
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

const loadFaqPage = async(req,res)=>{
  try{

    res.render('faq');

  }catch(error){
    console.error(error);
  }
}


const loadAboutUs = async(req,res)=>{
  try{

    res.render('aboutUs');

  }catch(error){
    console.error(error);
  }
}

const contactUS = async(req,res)=>{

  try{

    res.render('contactus');

  }catch(error){

    console.error(error);
    res.status(500).json({error:"INternal server error"});
  }
}

const contactUSSend = async(req,res)=>{

  try{
    const {name,email,message} = req.body;
    const sendEmail = async (name,email,message) => {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.USER_PASS,
        },
      });
    
      const mailOptions = {
        from: email,
        to: process.env.USER_EMAIL,
        subject: `New contact form enquiry`, 
        html: `<p>name: ${name}</p><br><p>${message}</p>`, 
      };
    
      await transporter.sendMail(mailOptions);
    };

    sendEmail(name,email,message)
    
    console.log(name,email,message);
    req.flash("success","Message send successfully");
    res.redirect('/contact-us');

  }catch(error){

    console.error(error);
    res.status(500).json({error:"INternal server error"});
  }
}

module.exports = { 
  loadHome,
  productDetail,
  loaadProductListsByCategory,
  sortProductByUserPreference,
  sendEmailNewsLetter,
  filterProductsByUser,
  searchProducts,
  loadFaqPage,
  loadAboutUs,
  searchProductsHome,
  filterSearchedProducts,
  contactUS,
  contactUSSend

};
