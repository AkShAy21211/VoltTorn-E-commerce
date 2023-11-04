const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const userOTPVeryModel =require("../models/userVerifyOTPModel");

//user otp verification configure


const generateOTP = () => {
  // Generate a random 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmail = async (email, otpCode) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port:587,
    secure:false,
    requireTLS:true,
    auth: {
      user: 'pa080633@gmail.com',
      pass: 'szchhdrguntezzsr',
    },
  });

  const mailOptions = {
    from: 'your-email-username',
    to: email,
    subject: 'Email OTP Verification',
    text: `Your OTP code is: ${otpCode}`,
  };

  await transporter.sendMail(mailOptions);
};

const generateAndSendOTP = async (email) => {
  const otpCode = generateOTP();
  const otpExpiration = new Date(Date.now() + 600000); // OTP expires in 10 minutes

  await userOTPVeryModel.updateOne({ email }, { otpCode, otpExpiration }, { upsert: true });

  sendEmail(email, otpCode);
};


//PASSWORD HASING 

const securePassword = async(password)=>{
  try{

    const passwordHash = await bcrypt.hash(password,10);
    return passwordHash;


  }catch(error){
    console.log(error.message);
  }
}



const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};



const insertUser = async(req,res)=>{
  try{
    const hashPassword = await securePassword(req.body.password);

   const User = new userModel({

    first_name:req.body.first_name,
    last_name:req.body.last_name,
    email:req.body.email,
    mobile:req.body.mobile,
    password:hashPassword,
    is_verified:false,
    is_admin:0,


   });

   const confirmPassword = req.body.confirmPassword;

   if(req.body.password === confirmPassword){

   }else{

    res.render('registration',{password:"Password is incorrect or Password dont match"})
   }
   
   const userData = await User.save();

  

   if(userData){
    res.render('registration',{message:"Your registration has been successfully completed, Please verify your email"})
    
    
    generateAndSendOTP(userData.email)

   }else{
    res.render('registration',{message:"Your registration has been failed"})

   }

  }catch(error){
    console.log(error.message);
  }
}

const loadVerify = async(req,res)=>{

  try{

    res.render('verifyOTP');

  }catch(error){
    console.log(error.message);
  }
}





module.exports={

    loadRegister,
    insertUser,
    loadVerify,
    
}