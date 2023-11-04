const express  = require("express");
const userRoute  = express();
const userController = require("../controllers/userController");
const userModel = require("../models/userModel");

userRoute.set('view engine','ejs');
userRoute.set('views','./views/user')

const bodyParser = require("body-parser");
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({extended:true}))


const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'../public/userImages'))
    },
    filename: function (req, file, cb) {
      const name = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  const upload = multer({ storage: storage })


userRoute.use(express.static('public'))

userRoute.get('/register',userController.loadRegister);
userRoute.post('/register',userController.insertUser);
userRoute.get('/verify',userController.loadVerify);




module.exports = userRoute;