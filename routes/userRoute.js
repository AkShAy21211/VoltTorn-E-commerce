const express  = require("express");
const userRoute  = express();
const userController = require("../controllers/userController");
const userModel = require("../models/userModel");
const session = require("express-session");

const config = require("../config/config");
userRoute.use(session({

    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:true,
    cookie:{secure:true}
}));

const auth = require("../middlewares/auth");

userRoute.set('view engine','ejs');
userRoute.set('views','./views/user')

const bodyParser = require("body-parser");
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({extended:true}))


userRoute.use(express.static('public'))
//REGISTER USER ROUTE
userRoute.get('/register',auth.is_Logout,userController.loadRegister);
userRoute.post('/register',userController.insertUser);

//USER VERIFICATION THROUGH EMAIL TO COMPLETE
userRoute.get('/verify',userController.loadVerify);
userRoute.post('/verify',userController.verifyOTP);


//SIGN IN USER

userRoute.get('/',auth.is_Logout,userController.loadLogin);
userRoute.get('/login',auth.is_Logout,userController.loadLogin);

userRoute.post('/',userController.loadLoginVerify);
userRoute.post('/login',userController.loadLoginVerify);
userRoute.get('/home',userController.loadHome);


//USER LOGOUT

userRoute.get('/logout',auth.is_Login,userController.userLogout)









module.exports = userRoute;