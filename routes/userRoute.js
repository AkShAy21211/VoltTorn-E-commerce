const express  = require("express");
const userRoute  = express();
const userController = require("../controllers/userController");
const homeController = require("../controllers/homePageController");
const userCartController = require("../controllers/userCartController");
const userSettingController = require("../controllers/userSettingsController");
const auth = require("../middlewares/auth");
userRoute.set('view engine','ejs');
userRoute.set('views','./views/user')

const bodyParser = require("body-parser");
const { Admin } = require("mongodb");
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({extended:true}))
const path = require("path");
const multer = require("multer");


const userImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../public/images/userImages"));
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
    },
  });

  const uploadUserImage = multer({ storage: userImageStorage })



userRoute.use(express.static('public'))
//REGISTER USER ROUTE
userRoute.get('/register',userController.loadRegister);
userRoute.post('/register',userController.insertUser);

//USER VERIFICATION THROUGH EMAIL TO COMPLETE
userRoute.get('/verify',auth.is_Logout,userController.loadVerify);
userRoute.post('/verify',userController.verifyOTP);

//SIGN IN USER

userRoute.get('/login',auth.is_Logout,userController.loadLogin);
userRoute.post('/login',userController.loadLoginVerify);

userRoute.get('/',auth.isUserBlocked,homeController.loadHome);
userRoute.get('/home',auth.isUserBlocked,homeController.loadHome);

//user single product detail route
userRoute.get('/home/product/details/:id',auth.isUserBlocked,homeController.productDetail);

//product listts page route 

userRoute.get('/home/products/:cat_name',auth.isUserBlocked,homeController.loaadProductListsByCategory)





//user settings page route

userRoute.get('/home/product/details/:id/filter/:color',auth.isUserBlocked,homeController.productDetail)

//USER shoppingCart
userRoute.get('/home/cart',auth.isUserBlocked,userCartController.userShoppingCartPageLoad);
userRoute.post('/home/products/cart/:product_id',auth.isUserBlocked,auth.is_Login,userCartController.userAddToCartButton);
userRoute.patch('/home/products/cart/updateQuantity/:product_id/:product',auth.isUserBlocked,userCartController.updateQuantity)

userRoute.delete('/home/cart/:product_id',auth.isUserBlocked,userCartController.deleteCartItem);

userRoute.get('/home/cart/checkout',auth.isUserBlocked,userCartController.loadCheckOutPage);
userRoute.post('/home/cart/checkout',auth.isUserBlocked,userCartController.stateCityLoad);

//user address add
userRoute.post('/home/cart/add-address',auth.isUserBlocked,userCartController.addUserBellingAddress)

//user address edit
userRoute.post('/home/cart/edit-address/:id',auth.isUserBlocked,userCartController.editUserBillingAddress);



//user profile page route
userRoute.get('/home/settings/profile',auth.isUserBlocked,userSettingController.loadUserSettings);
userRoute.post('/home/setting/edit-profile/:id',uploadUserImage.single('image'),auth.isUserBlocked,userSettingController.editUserProfile);


//user oder page eroutes
userRoute.get('/home/settings/oders',auth.isUserBlocked,userSettingController.loadUserOdersPage)
userRoute.get('/home/settings/cancel-oders/:oder_id',auth.isUserBlocked,userSettingController.forCancelUserOders)




//user checkout page complete transcation cash on delivery
userRoute.post('/home/cart/checkout/complete/:id',auth.isUserBlocked,userCartController.completeOderCashOnDelivery);





userRoute.get('/logout',auth.is_Login,userController.userLogout)










module.exports = userRoute;