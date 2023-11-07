const express = require("express");
const adminRoute = express();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const userModel = require("../models/userModel");
const session = require("express-session");

const config = require("../config/config");
adminRoute.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

const adminAuth = require("../middlewares/adminauth");
adminRoute.set("view engine", "ejs");
adminRoute.set("views", "./views/admin");

const bodyParser = require("body-parser");
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));

adminRoute.use(express.static("public"));

//ADMIN LOGIN
adminRoute.get("/",adminAuth.is_Logout,adminController.loadLogin);
adminRoute.post("/", adminController.loginVerifyAdmin);
adminRoute.get('/dashboard',adminController.loadHomeome);

//ADMIN LOGOUT
adminRoute.get('/logout',adminAuth.is_Login,adminController.loadLogout);

//ADMIN CUSTOMER ROUTE
adminRoute.get('/customers',adminAuth.is_Login,adminController.loadCustomers)
adminRoute.get('/delete-user',adminController.deleteUser);
adminRoute.get('/block-unblock-user',adminController.blockUnblockUser);

//ADMIN CATEGORY ROUTE
adminRoute.get('/category',adminController.loadCategory);
adminRoute.post('/category/add',adminController.addNewCategory);




adminRoute.get("*", function (req, res) {
  res.redirect("/admin");
});
module.exports = adminRoute;
