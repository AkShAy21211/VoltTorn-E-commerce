const express = require("express");
const adminRoute = express();
const flash = require("express-flash");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const customerController = require("../controllers/customerController");
const categoryController = require("../controllers/categoryController");
const brandController = require("../controllers/brandController");
const productController = require("../controllers/productColtroller");
const bannerController = require("../controllers/bannerController");
const adminOderController = require("../controllers/oderControllers");
const dashBoardController = require("../controllers/adminDashboard");
const adminOfferController = require("../controllers/adminOfferController");
const couponController = require("../controllers/couponController");
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

const categoryImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/categoryImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const brandImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/brandImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});


// Set up multer instances with the corresponding storage
const uploadProductImage = multer({ storage: productImageStorage })
const uploadBannerImage = multer({ storage: bannerImageStorage })
const uploadCategoryImage = multer({storage:categoryImageStorage})
const uploadBrandImage = multer({storage:brandImageStorage})

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
adminRoute.post("/category/add",uploadCategoryImage.single('image'), categoryController.addNewCategory); //ADMIN ADD CATEGORY ROUTE
adminRoute.get("/category/edit/:id",adminAuth.is_Login, categoryController.editCategoryLoad);
adminRoute.post("/category/edit/:id",uploadCategoryImage.single('image'), categoryController.editCategory); //ADMIN EDIT CATEGORY ROUTE
adminRoute.get("/category/delete/:id", adminAuth.is_Login,categoryController.deleteCategory); //ADMIN DELETE CATEGORY ROUTE



//ADMIN BRAND ROUTE
adminRoute.get("/brand",adminAuth.is_Login, brandController.loadBrand);
adminRoute.post("/brand/add",uploadBrandImage.single('image'), brandController.addNewBrand); //ADMIN ADD CATEGORY ROUTE
adminRoute.get("/brand/edit/:id",adminAuth.is_Login, brandController.editBrandLoad);
adminRoute.post("/brand/edit/:id",uploadBrandImage.single('image'), brandController.editBrand); //ADMIN EDIT CATEGORY ROUTE
adminRoute.get("/brand/delete/:id", adminAuth.is_Login,brandController.deleteBrand); //ADMIN DELETE CATEGORY ROUTE


//ADMIN PRODUCT ROUTE
adminRoute.get("/products",adminAuth.is_Login, productController.loadProduct);
adminRoute.get("/products/view/:id",adminAuth.is_Login, productController.adminSingleProductView);

adminRoute.get("/products/add",adminAuth.is_Login, productController.addProductLoad);
adminRoute.post(
  "/products/add",
  uploadProductImage.fields([
    { name: 'images1', maxCount: 6 },
    { name: 'images2', maxCount: 6 }
  ]),
  productController.addProduct
);

//ADMIN PRODUCT EDIT ROUTE

adminRoute.get("/products/edit/:id",adminAuth.is_Login, productController.editProductLoad);
adminRoute.post(
  "/products/edit/:id",
  uploadProductImage.fields([
    { name: 'images1', maxCount: 6 },
    { name: 'images2', maxCount: 6 }
  ]),
  productController.editProduct
);
adminRoute.get("/products/edit-images/:id/:image/:index",adminAuth.is_Login, productController.editProductImages);

adminRoute.get("/products/delete/:id",adminAuth.is_Login, productController.deleteProduct);



//admin store add banner route

adminRoute.get('/banners',adminAuth.is_Login,bannerController.loadBannerPage)
adminRoute.post('/banners/add', uploadBannerImage.single('image'),bannerController.addNewBannerByAdmin)

adminRoute.get('/banners/delete/:id',adminAuth.is_Login,bannerController.deleteBannerByAdmin)
adminRoute.get('/banners/edit/:id',adminAuth.is_Login,bannerController.editeBannerByAdminGet)
adminRoute.post('/banners/edit/:id',uploadBannerImage.single('image'),bannerController.editBannerByAdminPost)



//admin oder mangment
adminRoute.get('/oders',adminAuth.is_Login,adminOderController.loadOderManagment);
adminRoute.get('/oders/view/:id',adminAuth.is_Login,adminOderController.viewUserOrder);
adminRoute.patch('/oders/change-oder-status/:status/:id',adminOderController.adminChangeOderStatus);
adminRoute.get('/oders/return-view/:id',adminAuth.is_Login,adminOderController.viewReturnedOrder);
adminRoute.get('/oders/return/approve/:returnId',adminAuth.is_Login,adminOderController.approveReturnedProduct);



//admin coupon managment;
adminRoute.get('/coupon',adminAuth.is_Login,couponController.loadCouponPage);
adminRoute.post('/coupon/add',couponController.addCoupon);
adminRoute.get('/coupon/edit/:id',adminAuth.is_Login,couponController.editCouponLoad);
adminRoute.post('/coupon/edit/:id',couponController.editCoupon);
adminRoute.get('/coupon/delete/:id',adminAuth.is_Login,couponController.deleteCoupon);


//admin dashboard statictics
adminRoute.get('/dashboard/statistics',adminAuth.is_Login,dashBoardController.getProductStatistics);
// adminRoute.get('/search',dashBoardController.searchItem);


//admin sales report downlode

 adminRoute.get('/sales-report',adminAuth.is_Login,dashBoardController.loadSalesReportPage);
 adminRoute.get('/sales-report/filter/downlode-excel',adminAuth.is_Login,dashBoardController.downlodeSalesReportByDateExcel );
 adminRoute.get('/sales-report/filter/downlode-pdf',adminAuth.is_Login,dashBoardController.downlodeSalesReportPdf );


// adminRoute.get('/sales-report',dashBoardController.downlodeSalesReport);
// adminRoute.get('/sales-report-pdf',dashBoardController.downlodeSalesReportPdf);
//admin offer route

adminRoute.get("/offer",adminAuth.is_Login,adminOfferController.loadOfferPage);
adminRoute.post("/offer/add",adminOfferController.addNewOffer);
adminRoute.get("/offer/delete",adminAuth.is_Login,adminOfferController.deleteOffer);
adminRoute.get("/offer/edit/:id",adminAuth.is_Login,adminOfferController.loadOfferEdit);
adminRoute.post("/offer/edit/:id",adminOfferController.editOffer);

//send newsLetter for subscribed User
adminRoute.get("*", function (req, res) {
  res.redirect("/admin");
});
module.exports = adminRoute;
