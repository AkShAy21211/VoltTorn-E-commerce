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
const passport = require('passport');

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

userRoute.use(auth.cartCount);
userRoute.use(auth.wishCount);

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

//goole auth 
// auth with google+
userRoute.get('/auth/google', passport.authenticate('google', {
  scope: ['profile','email']
}));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
userRoute.get('/auth/google/home', passport.authenticate('google'),auth.rediretAuth);

//user single product detail route
userRoute.get('/home/product/details/:id',auth.isUserBlocked,homeController.productDetail);


//user search products
userRoute.get('/home/search',auth.isUserBlocked,homeController.searchProductsHome);
userRoute.get('/home/search/filter',auth.isUserBlocked,homeController.filterSearchedProducts);


//product listts page route 

userRoute.get('/home/products/:cat_name',auth.isUserBlocked,homeController.loaadProductListsByCategory);

//product sort /  filter route
userRoute.get('/home/products/sort/:category/:sortOption',auth.isUserBlocked,homeController.sortProductByUserPreference)
userRoute.get('/home/products/:cat_name/filter',auth.isUserBlocked,homeController.filterProductsByUser)
userRoute.get('/home/products/:cat_name/search',auth.isUserBlocked,homeController.searchProducts)


//user wishlists page route
userRoute.get('/home/products/wishlist/:product_id',auth.isUserBlocked,auth.is_Login,userSettingController.userWishlistLoadProductAdd);
userRoute.get('/home/settings/wishlist',auth.isUserBlocked,auth.is_Login,userSettingController.userWishlistLoad);
userRoute.get('/home/settings/wishlist/remove/:index',auth.isUserBlocked,auth.is_Login,userSettingController.removeWishlistsItems);


//USER shoppingCart
userRoute.get('/home/cart',auth.isUserBlocked,auth.is_Login,userCartController.userShoppingCartPageLoad);
userRoute.post('/home/products/cart/:product_id',auth.isUserBlocked,auth.is_Login,userCartController.userAddToCartButton);
userRoute.post('/home/products/buy-now/:product_id',auth.isUserBlocked,auth.is_Login,userCartController.userBuyNowButton);
userRoute.patch('/home/products/cart/updateQuantity/:product_id/:product',auth.isUserBlocked,auth.is_Login,userCartController.updateQuantity)
userRoute.delete('/home/cart/:product_id',auth.isUserBlocked,auth.is_Login,userCartController.deleteCartItem);


//checkout
userRoute.get('/home/cart/checkout',auth.isUserBlocked,auth.is_Login,auth.in_cart, userCartController.loadCheckOutPage);
//offer
// userRoute.get('/home/cart/applay-referral-offer/:id',auth.isUserBlocked,auth.in_cart, userCartController.applayReferralOffer);
// userRoute.get('/home/cart/cancel-referral-offer/:id',auth.isUserBlocked,auth.in_cart, userCartController.cancelReferralOffer);
//coupons
userRoute.get('/home/cart/avaliable-coupons/:id',auth.isUserBlocked,auth.is_Login,userCartController.loadAvaliableCoupons);
userRoute.get('/home/cart/coupon-applay/:id',auth.isUserBlocked,auth.is_Login,userCartController.applayCouponCode)
userRoute.get('/home/cart/coupon-remove/:id',auth.isUserBlocked,auth.is_Login,userCartController.removeCouponCode)



//user address add
userRoute.post('/home/cart/add-address',auth.isUserBlocked,userCartController.addUserBellingAddress)
userRoute.post('/home/cart/edit-address/:id',auth.isUserBlocked,userCartController.editUserBillingAddress);
userRoute.post('/home/cart/checkout',auth.isUserBlocked,userCartController.stateCityLoad);



//user profile page route
userRoute.get('/home/settings/profile',auth.isUserBlocked,auth.is_Login,userSettingController.loadUserSettings);
userRoute.post('/home/setting/edit-profile/:id',uploadUserImage.single('image'),auth.isUserBlocked,userSettingController.editUserProfile);


//user oder page routes
userRoute.get('/home/settings/oders',auth.isUserBlocked,auth.is_Login,userSettingController.loadUserOdersPage);
userRoute.get('/home/settings/cancel-oders/:oder_id/:product_id/:oder_index/:product_index',auth.isUserBlocked,auth.is_Login,userSettingController.forCancelUserOders);
userRoute.get('/home/settings/return-oders/:oder_id/:product_id/:oder_index/:product_index/:reason/:quantity',auth.isUserBlocked,auth.is_Login,userSettingController.forReturnOders);

//user post product review
userRoute.get('/home/settings/reviews',auth.isUserBlocked,auth.is_Login,userSettingController.loadUserReviews)
userRoute.post('/home/settings/oders/add-review',auth.isUserBlocked,userSettingController.addProductReview)
userRoute.get('/home/settings/reviews/remove/:id',auth.isUserBlocked,auth.is_Login,userSettingController.deleteUserReviews)




//user checkout page complete transcation cash on delivery
userRoute.post('/home/cart/checkout/verify-payment/:id',auth.isUserBlocked,paymentController.verfyUserPaymentOption);
userRoute.post('/home/cart/checkout/verify',auth.isUserBlocked,paymentController.verifyOnlinePayment);

//user wallet
userRoute.get('/home/settings/wallet',auth.isUserBlocked,auth.is_Login,userSettingController.loadUserWallet)
userRoute.post('/home/settings/wallet/add-fund',auth.isUserBlocked,paymentController.userAddFundWallet)
userRoute.post('/home/settings/wallet/add-fund/verify',auth.isUserBlocked,paymentController.userAddFundWalletVerify)

// user address managment
userRoute.get('/home/settings/address',auth.isUserBlocked,auth.is_Login,userSettingController.loadUserAddress)
userRoute.post('/home/settings/address/add',auth.isUserBlocked,userSettingController.addUserBellingAddress)
userRoute.post('/home/settings/address/edit/:id',auth.isUserBlocked,auth.is_Login,userSettingController.editUserBillingAddress)
userRoute.get('/home/settings/address/delete/:id',auth.isUserBlocked,auth.is_Login,userSettingController.deleteUserAddress)
userRoute.post('/home/settings/address',auth.isUserBlocked,userSettingController.stateCityLoad);



//user faq and about and contact route
userRoute.get('/frequently-asked-questions',homeController.loadFaqPage)
userRoute.get('/about-us',homeController.loadAboutUs)

//user downlode invoice
userRoute.get('/home/settings/oders/download-invoice/:order_id',auth.isUserBlocked,auth.is_Login,paymentController.downloadInvoice)

//user forget password
userRoute.get('/forget-password',userController.loadForgetPasswordPage);
userRoute.post('/forget-password',userController.resetPasswordByEmail);
userRoute.get('/reset-password',userController.resetPasswordGet);
userRoute.post('/reset-password/:token',userController.resetPasswordPost);

userRoute.post('/send-newsletter',homeController.sendEmailNewsLetter);
userRoute.get('/contact-us',homeController.contactUS)
userRoute.post('/contact-us',homeController.contactUSSend)

userRoute.get('/logout',auth.is_Login,userController.userLogout)








module.exports = userRoute;