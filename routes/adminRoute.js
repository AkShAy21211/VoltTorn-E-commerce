const express = require("express");
const adminRoute = express();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const customerController = require("../controllers/customerController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productColtroller");
const bannerController = require("../controllers/bannerController");
const path = require("path");
const multer = require("multer");
// Define storage for product images
const productImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/productImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

// Define storage for banner images
const bannerImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/bannerImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

// Set up multer instances with the corresponding storage
const uploadProductImage = multer({ storage: productImageStorage })
const uploadBannerImage = multer({ storage: bannerImageStorage })

const userModel = require("../models/userModel");

const adminAuth = require("../middlewares/adminauth");
adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");

const bodyParser = require("body-parser");
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));

adminRoute.use(express.static("public"));

//ADMIN LOGIN
adminRoute.get("/", adminAuth.is_Logout, adminController.loadLogin);
adminRoute.post("/", adminController.loginVerifyAdmin);
adminRoute.get("/dashboard",adminAuth.is_Login, adminController.loadHomeome);

//ADMIN LOGOUT
adminRoute.get("/logout", adminAuth.is_Login, adminController.loadLogout);

//ADMIN CUSTOMER ROUTE
adminRoute.get( "/customers", adminAuth.is_Login,customerController.loadCustomers
);
adminRoute.get("/delete-user",adminAuth.is_Login, customerController.deleteUser);
adminRoute.get("/block-unblock-user",adminAuth.is_Login, customerController.blockUnblockUser);

//ADMIN CATEGORY ROUTE
adminRoute.get("/category",adminAuth.is_Login, categoryController.loadCategory);
adminRoute.post("/category/add", categoryController.addNewCategory); //ADMIN ADD CATEGORY ROUTE
adminRoute.get("/category/edit/:id",adminAuth.is_Login, categoryController.editCategoryLoad);
adminRoute.post("/category/edit/:id", categoryController.editCategory); //ADMIN EDIT CATEGORY ROUTE
adminRoute.get("/category/delete/:id", adminAuth.is_Login,categoryController.deleteCategory); //ADMIN DELETE CATEGORY ROUTE

//ADMIN PRODUCT ROUTE
adminRoute.get("/products",adminAuth.is_Login, productController.loadProduct);
adminRoute.get("/products/view/:id",adminAuth.is_Login, productController.adminSingleProductView);

adminRoute.get("/products/add",adminAuth.is_Login, productController.addProductLoad);
adminRoute.post(
  "/products/add",
  uploadProductImage.array('images', 4),
  productController.addProduct
);

//ADMIN PRODUCT EDIT ROUTE

adminRoute.get("/products/edit/:id",adminAuth.is_Login, productController.editProductLoad);
adminRoute.post(
  "/products/edit/:id",
  uploadProductImage.array('images', 4),
  productController.editProduct
);
adminRoute.get("/products/delete/:id",adminAuth.is_Login, productController.deleteProduct);

//edit product varients

adminRoute.get('/products/delete-variant',adminAuth.is_Login,productController.deleteProductVarientByAdmin)



//admin store add banner route

adminRoute.get('/banners',adminAuth.is_Login,bannerController.loadBannerPage)
adminRoute.post('/banners/add', uploadBannerImage.single('image'),bannerController.addNewBannerByAdmin)


//delete banner
adminRoute.get('/banners/delete/:id',bannerController.deleteBannerByAdmin)


//edit banner
adminRoute.get('/banners/edit/:id',bannerController.editeBannerByAdminGet)
adminRoute.post('/banners/edit/:id',uploadBannerImage.single('image'),bannerController.editBannerByAdminPost)


adminRoute.get("*", function (req, res) {
  res.redirect("/admin");
});
module.exports = adminRoute;
