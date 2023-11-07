const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const categoryModel = require("../models/categoryModel");

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
      const adminPasswordMatch = await bcrypt.compare(
        password,
        adminData.password
      );
      if (adminPasswordMatch) {
        if (adminData.is_admin === 0) {
          res.render("login", { message: "Email and password is incorrect" });
        } else {
          req.session.user_id = adminData._id;
          res.redirect("/admin/dashboard");
        }
      } else {
        res.render("login", { message: "Email and password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email and password is incorrect" });
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

const loadCustomers = async (req, res) => {
  try {
    const customerData = await userModel.find({ is_admin: 0 });
    if (customerData) {
      res.render("customers", { customers: customerData });
    } else {
      console.log("no data found");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//DELETE USRES

const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;

    await userModel.deleteOne({ _id: id });
    res.redirect("/admin/customers");
  } catch (error) {
    console.log(error.message);
  }
};

//BLOCK USERS

const blockUnblockUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await userModel.findOne({ _id: id });

    if (!userData) {
      return res.status(404).send("User not found");
    }

    const updatedStatus = !userData.status; // Toggle the status

    const updatedUser = await userModel.updateOne(
      { _id: id },
      { $set: { status: updatedStatus } }
    );

    if (updatedUser) {
      res.redirect("/admin/customers");
    } else {
      res.status(500).send("Failed to update user status");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};



//ADMIN ADD NEW CATEGORY

const addNewCategory = async (req, res) => {
  try {
    const name = req.body.name;
    const description = req.body.description;

    const Category = new categoryModel({
      category: name,
      description: description,
    });

    const CategoryData = await Category.save();
    console.log(CategoryData);
    res.redirect('/admin/category');
  } catch (error) {
    console.log(error.message);
  }
};

//ADMIN CATEGORY PAGE LOAD

const loadCategory = async (req, res) => {
  try {
   
    const CategoryData = await categoryModel.find({});
    if(CategoryData){
      res.render('category',{CategoryData});
    }
  } catch {
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  loginVerifyAdmin,
  loadHomeome,
  loadLogout,
  loadCustomers,
  deleteUser,
  blockUnblockUser,
  loadCategory,
  addNewCategory,
};
