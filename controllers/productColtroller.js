const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const brandModel = require('../models/brandModel');
const fs = require("fs");
const path = require("path");
const {cropAndSaveImage} = require("../helpers/imageCrope");

const loadProduct = async (req, res) => {
  try {
 
    const ProductData = await productModel.find({});
    if (ProductData) {
      res.render("products", { ProductData });
    }
  } catch (error) {
    console.error(error.meesage);
  }
};

const adminSingleProductView = async (req, res) => {
  try {
    const { id } = req.params;
    const ProductData = await productModel.findById(id);
    if (ProductData) {
      res.render("productDetailedView", { ProductData });
    }
  } catch (error) {
    console.error(error.meesage);
  }
};

const addProductLoad = async (req, res) => {
  try {


    const category = await categoryModel.find({});
    const brands = await brandModel.find({status:true});
    res.render("addProducts", { category,brands });
  } catch (error) {
    console.error(error.meesage);
  }
};
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      brand,
      discount,
      status,
      colors,
      stock,
      category,
      subCategory,
    } = req.body;

   
    // Extract filenames from images1 and images2
    const images1 = req.files ? req.files['images1'].map((file) => file.filename) : [];
    const images2 = req.files ? req.files['images2'].map((file) => file.filename) : [];
    const productData = await productModel.findOne({ name: name });

    // Validate if category exists
    if (!productData) {
      // Create a new product instance
      const newProduct = new productModel({
        name: name,
        variants: { color: colors, },
        description: description,
        price: parseFloat(price),
        priceDiscount:parseInt(price - (price * (discount / 100))),
        category: category,
        sub_Category: subCategory,
        brand: brand,
        discount: parseInt(discount),
        status: status,
        stock: parseInt(stock),
      });

      
      // Crop and store images1
      for (const image of images1) {
        const croppedImage = await cropAndSaveImage(image);
        newProduct.images.push(path.basename(croppedImage));
      }

      // Crop and store images2
      for (const image of images2) {
        const croppedImage = await cropAndSaveImage(image);
        newProduct.variants.images.push(path.basename(croppedImage));
      }

      const product = await newProduct.save();
      req.flash('success', 'Product Added Successfully');
      return res.redirect('/admin/products/add');
    } else {
      req.flash('error', 'Product Name Already Exists');
      return res.status(400).redirect('/admin/products/add');
    }
  } catch (error) {
    console.error(error);
  }
};



//ADMIN EDIT-PRODUCT EDIT ROUTE METHOOD
const editProductLoad = async (req, res) => {
  try {
    const { id } = req.params;
    const ProductData = await productModel.findById(id);
    if (ProductData) {
      const categories = await categoryModel.find({}); // Fetch all categories
      res.render("editProducts", { ProductData, categories });
    }
  } catch (error) {
    console.error(error.message);
  }
};




const editProduct = async (req, res) => {
  try {
    const { name, description, category, subCategory, price, brand, discount, status, colors, stock } = req.body;
     
    const id = req.params.id;
    const product = await productModel.findById(id);
    const categoryData = await categoryModel.findOne({category:category});
    const existingProduct = await productModel.findOne({ _id: { $ne: id }, name: name });
    if(!name || !description || !category|| !subCategory || !price || !brand || !discount || !status || !colors || !stock){

      req.flash('error','All Feilds Required');
      return res.redirect(`/admin/products/edit/${id}`);    
      }
    let images1 = [];
    let images2 = [];
    
    if (existingProduct) {
      req.flash('error','Product name already exists');
      return res.redirect(`/admin/products/edit/${id}`);
    }


    if (req.files['images1']) {
      images1 = req.files['images1'].map((file) => file.filename);
    }
    if (req.files['images2']) {
      images2 = req.files['images2'].map((file) => file.filename);
    }

    const existingColors = product.variants.color.map((color) => color);
    const existingImages = product.images.map((images) => images);
    const existingVariants = product.variants.images.map((images) => images);

    const productData = await productModel
      .findOne({ _id: id });

    const productUpdatedData = {
      name: name,
      category: categoryData.category,
      sub_Category:subCategory,
      description: description,
      price: parseFloat(price),
      brand: brand,
      discount: parseInt(discount),
      status: status,
      stock: parseInt(stock),
    };

    // Update the product document without modifying variants.images and images
    const productUpdated = await productModel.findOneAndUpdate(
      { _id: id },
      {
        $set: productUpdatedData,
        $push: { images: images1 ? images1 : existingImages, 'variants.images': images2 ? images2 : existingVariants },
        'variants.color': colors ? colors : existingColors,
      },
      { upsert: true, new: true }
    );

    req.flash('success','Product Updated Successfully');
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
const editProductImages = async(req,res)=>{

  try{
    const { id, index, image } = req.params;
    console.log(id, index, image);
    const product = await productModel.findById(id);
    const images = product.images.filter(images=> images === image);
    const variants = product.variants.images.filter(images=> images === image);

    console.log(variants);

    if(images){
    const updateProductImage = await productModel.findByIdAndUpdate(
      { _id: id },
      { $pull: { images: { $eq: image } } }
    );
    }else if(variants){
      const updateProductImage = await productModel.findByIdAndUpdate(
        { _id: id },
        { $pull: { "variants.$.images": { $eq: image } } }
      );
      
      
        
    }

    res.redirect(`/admin/products/edit/${id}`)
    
  }catch(error){
    console.error(error);

  }
}

const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    // First, retrieve the product from your database
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the product from the database
    await productModel.deleteOne({_id:productId});

    // Now, delete the associated images from the directory
    product.images.forEach(image => {
    const imagePath = path.join(__dirname, '../public/images/productImages', image);
      // Use fs.unlinkSync to synchronously delete the file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`Deleted image: ${image}`);
      }
    });

    // Do the same for variant images if needed
    product.variants.images.forEach(variant => {
        const imagePath = path.join(__dirname, '../public/images/productImages', variant);
        
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image: ${variant}`);
        }

    });

    req.flash('success',"Product Deleted Successfully")
    return res.status(200).redirect('/admin/products');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};


module.exports = {
  loadProduct,
  addProductLoad,
  addProduct,
  editProductLoad,
  editProduct,
  deleteProduct,
  adminSingleProductView,
  editProductImages
};
