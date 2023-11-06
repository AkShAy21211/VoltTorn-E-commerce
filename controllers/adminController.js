const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");



const loadLogin = async(req,res)=>{
    try{

        res.render('login')

    }catch(error){
        console.log(error.message);
    }
}

const loginVerifyAdmin = async(req,res)=>{

    try{
  
      const email = req.body.email;
      const password = req.body.password;
  
      const adminData = await userModel.findOne({email:email});
      if(adminData){
        
        const adminPasswordMatch = await bcrypt.compare(password,adminData.password);
        if(adminPasswordMatch){
          if(adminData.is_admin === 0){
            res.render('login',{message:"Email and password is incorrect"})
  
          }else{
  
            req.session.user_id = adminData._id;
            res.redirect("/admin/dashboard")
  
          }
  
        }else{
          res.render('login',{message:"Email and password is incorrect"})
        }
  
      }else{
        res.render('login',{message:"Email and password is incorrect"})
      }
    }catch(error){
      console.log(error.message);
    }
  }
  
  const loadHomeome = async(req,res)=>{
    try{
      res.render("dashboard")
  
    }catch (error){
  
      console.log(error.message);
  
    }
  };
  
const loadLogout = async(req,res)=>{
  try{

    req.session.destroy();
    res.redirect('/admin')

  }catch(error){
    console.log(error.message);
  }
}

const loadCustomers = async(req,res)=>{

  try{

    const customerData = await userModel.find({is_admin:0})
    if(customerData){
      res.render('customers',{customers:customerData})
    }else{

      console.log("no data found");
    }


  }catch(error){
    console.log(error.message);
  }
}




module.exports = {
    
    loadLogin,
    loginVerifyAdmin,
    loadHomeome,
    loadLogout,
    loadCustomers,
    
}