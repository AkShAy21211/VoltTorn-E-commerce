const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");

const loadProduct = async (req, res) => {
  try {
    const ProductData = await productModel.find({}).populate('category');
    if (ProductData) {
      res.render("products", { ProductData});
    }
  } catch (error) {
    console.log(error.meesage);
  }
};

const addProductLoad = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    console.log(category);

    res.render("addproducts",{category});
  } catch (error) {
    console.log(error.meesage);
  }
};

const addProduct = async (req, res) => {
  try {
    const category = req.body.category;
    const categoryData = await categoryModel.findOne({category:category});

    const images = [];
    for (let i = 1; i <= 4; i++) {
      const fieldName = `image${i}`;
      if (req.files[fieldName]) {
        images.push(req.files[fieldName][0].filename);
      }
    }

    console.log(images);
    const Product = new productModel({
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: categoryData._id,
      brand: req.body.brand,
      discount: parseInt(req.body.discount),
      status: req.body.status,
      stock: parseInt(req.body.stock),
      image: images,
    });

    const ProductData = await Product.save();
    if (ProductData) {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error);
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
    console.log(error.message);
  }
};

//ADMIN EDIT-PRODUCT EDIT ROUTE METHOOD
const editProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const category = req.body.category;
    let categoryData;

    // Check if category is provided before querying the database
    if (category) {
      categoryData = await categoryModel.findOne({ category: category });
      if (!categoryData) {
        // Handle the case where the category is not found
        console.log("Category not found");
        return res.status(404).send("Category not found");
      }
    }

    console.log(id);
    const ProductData = await productModel.findOne({ _id: id }).populate('category');
    const images = [];

    for (let i = 1; i <= 4; i++) {
      const fieldName = `image${i}`;
      if (req.files[fieldName]) {
        images.push(req.files[fieldName][0].filename);
      }
    }

    const productUpdatedData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      brand: req.body.brand,
      discount: parseInt(req.body.discount),
      status: req.body.status,
      stock: parseInt(req.body.stock),
    };

    // Add category to the update object if it exists
    if (categoryData) {
      productUpdatedData.category = categoryData._id;
    }

    // Check if any images are provided before updating
    if (images.length > 0) {
      productUpdatedData.image = images;
    } else if (ProductData.image) {
      productUpdatedData.image = ProductData.image;
    }

    const productUpdated = await productModel.findOneAndUpdate(
      { _id: id },
      productUpdatedData,
      { upsert: true, new: true }
    );

    console.log(productUpdated);
    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
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

module.exports = {
  loadProduct,
  addProductLoad,
  addProduct,
  editProductLoad,
  editProduct,
  deleteProduct,
};
