const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const fs = require('fs'); // for file system operations

const loadProduct = async (req, res) => {
  try {
    const ProductData = await productModel.find({}).populate('category');
    if (ProductData) {
      res.render("products", { ProductData});
    }
  } catch (error) {
    console.error(error.meesage);
  }
};

const adminSingleProductView = async (req, res) => {
  try {
    const {id} = req.params
    const ProductData = await productModel.findById(id).populate('category');
    if (ProductData) {
      res.render("productDetailedView", { ProductData});
    }
  } catch (error) {
    console.error(error.meesage);
  }
};

const addProductLoad = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    console.log(category);

    res.render("addproducts",{category});
  } catch (error) {
    console.error(error.meesage);
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, description, price, brand, discount, status, color, stock } = req.body;
    const category = req.body.category;
    const categoryData = await categoryModel.findOne({ category: category });
    const images = req.files.map(file => file.filename);
    let ProductData = await productModel.findOne({ name });
   
    if (!ProductData) {
      console.log(images);
      ProductData = new productModel({
        name: name,
        variants: [{ color: color, images }],
        description: description,
        price: parseFloat(price),
        category: categoryData.category,
        brand: brand,
        discount: parseInt(discount),
        status: status,
        stock: parseInt(stock),
      });
    } else {
      // If the product exists, add a new color variant or update an existing one
      const existingVariant = ProductData.variants.find(variant => variant.color === color);

      if (existingVariant) {
        // If the color variant already exists, append the images to it
        existingVariant.images = existingVariant.images.concat(images);
      } else {
        // If the color variant doesn't exist, create a new one
        ProductData.variants.push({ color, images });
      }
    }

    await ProductData.save();
    res.redirect("/admin/products");

  } catch (error) {
    console.error(error);
  }
};


//ADMIN EDIT-PRODUCT EDIT ROUTE METHOOD
const editProductLoad = async (req, res) => {
  try {
    const id = req.params.id;
    const ProductData = await productModel.findById(id).populate('category');

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
    const { name, description, price, brand, discount, status, color, stock, imageIndexes } = req.body;
    const id = req.params.id;
    const category = req.body.category;

    // Convert comma-separated imageIndexes string to an array of positions

    let categoryData;

    // Check if category is provided before querying the database
    if (category) {
      categoryData = await categoryModel.findOne({ category: category });
      if (!categoryData) {
        // Handle the case where the category is not found
        return res.status(404).send("Category not found");
      }
    }

    console.log(id);
    const productData = await productModel.findOne({ _id: id }).populate('category');

    console.log('Color to Update:', color);
    console.log('Existing Variants:', productData.variants);

    // Find the variant with the specified color
    const variantToUpdate = productData.variants.find(variant => variant.color === color);

    if (variantToUpdate) {
      // Update the specified images within the images array for the variant
     
    }

    const productUpdatedData = {
      name: name,
      description: description,
      price: parseFloat(price),
      brand: brand,
      discount: parseInt(discount),
      status: status,
      stock: parseInt(stock),
    };
    

    // Update the product document
    const productUpdated = await productModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name: productUpdatedData.name,
          description: productUpdatedData.description,
          price: productUpdatedData.price,
          brand: productUpdatedData.brand,
          discount: productUpdatedData.discount,
          status: productUpdatedData.status,
          stock: productUpdatedData.stock,
          'variants': productData.variants, // Update the entire variants array
        },
      },
      { upsert: true, new: true }
    );

    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};




const deleteProduct = async(req,res)=>{

  try{

    const id = req.params.id;
    const deleteProduct = await productModel.deleteOne({_id:id});
    res.redirect('/admin/products')


  }catch(error){
    console.log(error.message);
  }
}

const deleteProductVarientByAdmin = async(req,res)=>{

  try {
    const {id,color} = req.query;
    const result = await productModel.updateOne(
      { _id: id },
      { $pull: { variants: { color: color } } }
    );
        res.redirect(`/admin/products/edit/${id}`)
  } catch (error) {
    console.error(`Error deleting variant: ${error.message}`);
  }
}

module.exports = {
  loadProduct,
  addProductLoad,
  addProduct,
  editProductLoad,
  editProduct,
  deleteProduct,
  deleteProductVarientByAdmin,
  adminSingleProductView,
};
