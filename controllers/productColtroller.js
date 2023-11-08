const productModel = require("../models/productModel");

const loadProduct = async (req, res) => {
  try {
    const ProductData = await productModel.find({});
    if (ProductData) {
      res.render("products", { ProductData });
    }
  } catch (error) {
    console.log(error.meesage);
  }
};

const addProductLoad = async (req, res) => {
  try {
    res.render("addproducts");
  } catch (error) {
    console.log(error.meesage);
  }
};

const addProduct = async (req, res) => {
  try {
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
      category: req.body.category,
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
    const ProductData = await productModel.find({ _id: id });
    if (ProductData) {
      res.render("editProducts", { ProductData });
    }
  
  } catch (error) {
    console.log(error.message);
  }
};

//ADMIN EDIT-PRODUCT EDIT ROUTE METHOOD
const editProduct = async (req, res) => {



  try {
    const id = req.params.id;
    const ProductData = await productModel.findOne({ _id: id });

    const images = [];
    for (let i = 1; i <= 4; i++) {
      const fieldName = `image${i}`;
      if (req.files[fieldName]) {
        images.push(req.files[fieldName][0].filename);
      }
    }
    const productUpdated = await productModel.findOneAndUpdate(
      { _id: id },
      {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        category: req.body.category,
        brand: req.body.brand,
        discount: parseInt(req.body.discount),
        status: req.body.status,
        stock: parseInt(req.body.stock),
        image: images,
      },
      {  new: true } // Use { new: true } to return the updated document
    );
    console.log(productUpdated)
    if (images.length > 0) {
      productUpdated.image = images;
    } else if (ProductData.image) {
      productUpdated.image = ProductData.image; // Keep the previous images
    }

    const productImageUpdated = await productModel.findOneAndUpdate(
      { _id: id },
      productUpdated,
      { upsert: true,new:true }
    );

    res.redirect("/admin/products");
  } catch (error) {
    console.log(error);
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
