const express  = require("express");
const userRoute  = express();
const userController = require("../controllers/userController");
const homeController = require("../controllers/homePageController");
const userCartController = require("../controllers/userCartController");
const userSettingController = require("../controllers/userSettingsController");
const paymentController = require("../controllers/userPaymentController");
const auth = require("../middlewares/auth");
userRoute.set('view engine','ejs');
userRoute.set('views','./views/user')

const bodyParser = require("body-parser");
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
userRoute.post('/verify/resend-otp',userController.resendOTPWhenTimeOut);


//SIGN IN USER

userRoute.get('/login',auth.is_Logout,userController.loadLogin);
userRoute.post('/login',userController.loadLoginVerify);

userRoute.get('/',auth.isUserBlocked,homeController.loadHome);
userRoute.get('/home',auth.isUserBlocked,homeController.loadHome);

//user single product detail route
userRoute.get('/home/product/details/:id',auth.isUserBlocked,homeController.productDetail);

//product listts page route 

userRoute.get('/home/products/:cat_name',auth.isUserBlocked,homeController.loaadProductListsByCategory);

//product sort /  filter route
userRoute.get('/home/products/sort/:category/:sortOption',auth.isUserBlocked,homeController.sortProductByUserPreference)
userRoute.get('/home/products/:cat_name/filter',auth.isUserBlocked,homeController.filterProductsByUser)
userRoute.get('/home/products/:cat_name/search',auth.isUserBlocked,homeController.searchProducts)


//user wishlists page route
userRoute.get('/home/products/wishlist/:product_id',auth.isUserBlocked,userSettingController.userWishlistLoadProductAdd);
userRoute.get('/home/settings/wishlist',auth.isUserBlocked,userSettingController.userWishlistLoad);
userRoute.get('/home/settings/wishlist/remove/:index',auth.isUserBlocked,userSettingController.removeWishlistsItems);


//USER shoppingCart
userRoute.get('/home/cart',auth.isUserBlocked,userCartController.userShoppingCartPageLoad);
userRoute.post('/home/products/cart/:product_id',auth.isUserBlocked,auth.is_Login,userCartController.userAddToCartButton);
userRoute.patch('/home/products/cart/updateQuantity/:product_id/:product',auth.isUserBlocked,userCartController.updateQuantity)
userRoute.delete('/home/cart/:product_id',auth.isUserBlocked,userCartController.deleteCartItem);

userRoute.get('/home/cart/checkout',auth.isUserBlocked,auth.in_cart, userCartController.loadCheckOutPage);
userRoute.get('/home/cart/applay-referral-offer/:id',auth.isUserBlocked,auth.in_cart, userCartController.applayReferralOffer);
userRoute.get('/home/cart/cancel-referral-offer/:id',auth.isUserBlocked,auth.in_cart, userCartController.cancelReferralOffer);
userRoute.post('/home/cart/checkout',auth.isUserBlocked,userCartController.stateCityLoad);


//user address add
userRoute.post('/home/cart/add-address',auth.isUserBlocked,userCartController.addUserBellingAddress)
userRoute.post('/home/cart/edit-address/:id',auth.isUserBlocked,userCartController.editUserBillingAddress);



//user profile page route
userRoute.get('/home/settings/profile',auth.isUserBlocked,userSettingController.loadUserSettings);
userRoute.post('/home/setting/edit-profile/:id',uploadUserImage.single('image'),auth.isUserBlocked,userSettingController.editUserProfile);
userRoute.get('/home/setting/edit-profile/delete-address/:address_id',auth.isUserBlocked,userSettingController.deleteUserAddress);


//user oder page eroutes
userRoute.get('/home/settings/oders',auth.isUserBlocked,userSettingController.loadUserOdersPage);
userRoute.get('/home/settings/cancel-oders/:oder_id/:product_id/:oder_index/:product_index',auth.isUserBlocked,userSettingController.forCancelUserOders);

//user post product review
userRoute.get('/home/settings/reviews',auth.isUserBlocked,userSettingController.loadUserReviews)
userRoute.post('/home/settings/oders/add-review',auth.isUserBlocked,userSettingController.addProductReview)
userRoute.get('/home/settings/reviews/remove/:id',auth.isUserBlocked,userSettingController.deleteUserReviews)




//user checkout page complete transcation cash on delivery
userRoute.post('/home/cart/checkout/verify-payment/:id',auth.isUserBlocked,paymentController.verfyUserPaymentOption);
userRoute.post('/home/cart/checkout/verify',auth.isUserBlocked,paymentController.verifyOnlinePayment);



//user downlode invoice
userRoute.get('/home/settings/oders/download-invoice/:order_id',auth.isUserBlocked,paymentController.downloadInvoice)

//user checkout page complete transcation online  payment
userRoute.get('/forget-password',userController.loadForgetPasswordPage);
userRoute.post('/forget-password',userController.resetPasswordByEmail);
userRoute.get('/reset-password',userController.resetPasswordGet);
userRoute.post('/reset-password/:token',userController.resetPasswordPost);

userRoute.post('/send-newsletter',homeController.sendEmailNewsLetter);


userRoute.get('/logout',auth.is_Login,userController.userLogout)








module.exports = userRoute;