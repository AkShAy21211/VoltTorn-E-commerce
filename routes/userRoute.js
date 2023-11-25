const express  = require("express");
const userRoute  = express();
const userController = require("../controllers/userController");
const userModel = require("../models/userModel");
const homeController = require("../controllers/homePageController");
const userCartController = require("../controllers/userCartController");


const auth = require("../middlewares/auth");
userRoute.set('view engine','ejs');
userRoute.set('views','./views/user')

const bodyParser = require("body-parser");
const { Admin } = require("mongodb");
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({extended:true}))


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

userRoute.get('/',auth.isUserBlocked,homeController.loadHome)
userRoute.get('/home',auth.isUserBlocked,homeController.loadHome);

//user single product detail route

userRoute.get('/home/product/details/:id',auth.isUserBlocked,homeController.productDetail);

//product color filter





//user settings page route

userRoute.get('/home/settings',auth.isUserBlocked,userController.loadUserSettingPage)
userRoute.get('/home/product/details/:id/filter/:color',auth.isUserBlocked,homeController.productDetail)


//USER shoppingCart
userRoute.get('/home/cart',auth.isUserBlocked,userCartController.userShoppingCartPageLoad)

userRoute.get('/logout',auth.is_Login,userController.userLogout)










module.exports = userRoute;