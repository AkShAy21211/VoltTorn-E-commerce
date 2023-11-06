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

adminRoute.get("/",adminAuth.is_Logout,adminController.loadLogin);
adminRoute.post("/", adminController.loginVerifyAdmin);

adminRoute.get('/dashboard',adminAuth.is_Login,adminController.loadHomeome);
adminRoute.get('/logout',adminAuth.is_Login,adminController.loadLogout);

adminRoute.get('/customers',adminAuth.is_Login,adminController.loadCustomers)


adminRoute.get("*", function (req, res) {
  res.redirect("/admin");
});
module.exports = adminRoute;
