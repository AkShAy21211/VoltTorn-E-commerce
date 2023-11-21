const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");


const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const loginVerifyAdmin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const adminData = await userModel.findOne({ email: email });

    if (adminData) {
      const adminPasswordMatch = await bcrypt.compare(password, adminData.password);

      if (adminPasswordMatch) {
        if (adminData.is_admin === 0) {
          res.render("login", { message: "Email and password are incorrect" });
        } else {
          req.session.admin = {
            isAdminAuthenticated:true,
            username:adminData.first_name+" "+adminData.last_name,
          } // Set admin session variable
          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("login", { message: "Email and password are incorrect" });
      }
    } else {
      res.render("login", { message: "Email and password are incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadHomeome = async (req, res) => {
  try {
    res.render("dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogout = async (req, res) => {
  try {
    req.session.destroy();
        res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};





module.exports = {
  loadLogin,
  loginVerifyAdmin,
  loadHomeome,
  loadLogout,
  
};
