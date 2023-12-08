const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const userOTPVeryModel = require("../models/userVerifyOTPModel");

//user otp verification configure

const generateOTP = () => {
  // Generate a random 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmail = async (email, otpCode) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "pa080633@gmail.com",
      pass: "szchhdrguntezzsr",
    },
  });

  const mailOptions = {
    from: "your-email-username",
    to: email,
    subject: "Email OTP Verification",
    text: `Your OTP code is: ${otpCode}`,
  };

  await transporter.sendMail(mailOptions);
};

const generateAndSendOTP = async (email) => {
  const otpCode = generateOTP();
  const otpExpiration = new Date(Date.now() + 60000); // OTP expires in 1 minute

  await userOTPVeryModel.updateOne(
    { email },
    { otpCode, otpExpiration },
    { upsert: true }
  );

  sendEmail(email, otpCode);
};

//PASSWORD HASING

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.error(error.message);
  }
};

//GET REQUEST FOR LOAD USER REGISTRATION

const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.error(error.message);
  }
};

//POST REQUEST FOR LOAD USER REGISTRATION TO INSERT NEW USER
const insertUser = async (req, res) => {
  try {
    const { first_name, last_name, email, mobile, password, confirmPassword } = req.body;
    const hashPassword = await securePassword(password);
    
    if (!confirmPassword) {
      return res.render("registration", {
        password: "Your registration has failed. Please check your password",
      });
    }

    const userExist = await userModel.findOne({ $or: [{ email: email }, { mobile: mobile }] });

    if (userExist) {
      return res.render("registration", {
        password: "User with email or phone already exists",
      });
    }

    const User = new userModel({
      first_name: first_name,
      last_name: last_name,
      email: email,
      mobile: mobile,
      password: hashPassword,
      is_verified: false,
      is_admin: 0,
      status: true,
      isDelete: false,
    });

    const userData = await User.save();

    // Session handling
    if (!req.session.user) {
      req.session.user = {};

    }
    
    req.session.user.email = User.email;
    req.session.user.userId = User._id;


    generateAndSendOTP(userData.email);
    
    // Redirect to the appropriate route
    return res.redirect(`/verify`);
  } catch (error) {
    console.error("Error inserting user:", error.message);
    return res.render("registration", {
      password: "Error during registration. Please try again.",
    });
  }
};





const loadVerify = async (req, res) => {
  try {
    const email = req.session.user.email;

    // Check if the user is already verified
    const userData = await userModel.findOne({ email: email, is_verified: true });

    if (userData) {
      // User is already verified, redirect to a different page
      return res.redirect('/');
    }

    // User is not yet verified, render the verifyOTP page
    res.render("verifyOTP",{email});
  } catch (error) {
    console.log(error.message);
    // Handle the error
    res.render("verifyOTP", { error: "An error occurred." });
  }
};

//VERIFY OTP
const verifyOTP = async (req, res) => {
  try {
    const { userId, email } = req.session.user;
    const otp = req.body.otp;
    const currentTime = new Date();

    const userData = await userModel.findOne({ _id: userId, email: email });
    const OTPData = await userOTPVeryModel.findOne({
      email: email,
      otpCode: otp,
      otpExpiration: { $gt: currentTime }, // Check if the OTP is not expired
    });

    if (!userData || !otp || !OTPData) {
      return res.render("verifyOTP", {
        error: "Invalid OTP or Expired",
      });
    }

    await userModel.updateOne({ _id: userId }, { $set: { is_verified: true } });
    await userOTPVeryModel.findByIdAndDelete(OTPData._id);
    
    req.session.user = {
      userId:userData._id,
      username: userData.first_name + " " + userData.last_name,
    };

    return res.redirect('/');
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    return res.render("verifyOTP", {
      error: "An error occurred during OTP verification. Please try again.",
    });
  }
};



const resendOTPWhenTimeOut = async (req, res) => {
  try {
    const email = req.session.user.email;
    const currentTime = new Date();

    // Delete documents where otpExpiration is less than the current time
    const deleteOtp =  await userOTPVeryModel.deleteOne({email:email},{ otpExpiration: { $lt: currentTime } });
    console.log('Expired OTPs deleted successfully');

    if(deleteOtp){

    generateAndSendOTP(email);
    }

    return res.json({ success: true, message: 'OTP resent successfully', deleteOtp });
  } catch (error) {
    console.error('Error resending OTP:', error.message);
    return res.status(500).json({ success: false, message: 'Error resending OTP' });
  }
};







//USER LOGIN

const loadLogin = async (req, res) => {
  try {

    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};



const loadLoginVerify = async (req, res) => {
  try {
    const {email,password} = req.body;
    const userData = await userModel.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_verified === true) {
          if (userData.status === true) {
            if(userData.isDelete === true){
               res.render("login", { message: "No user found Please sign in" });

            }else{
              req.session.user = {

                isUserAuthenticated:true,
                userId:userData._id,
                username:userData.first_name+" "+userData.last_name,
                
               
              }
              res.redirect('/home')
            }
          } else {
           return res.render("login", { message: "You have been blocked by admin" });
          }
        } else {
          return res.render("login", { message: "Please verify your email" });
        }
      } else {
        return res.render("login", { message: "Email and password are incorrect" });
      }
    } else {
      return res.render("login", { message: "Email and password are incorrect" });
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    return res.render("login", { message: "An error occurred during login. Please try again." });
  }
};


//USER LOGOUT 



const userLogout = async (req, res) => {
  try {
    delete req.session.user;
    res.redirect('/login');
  } catch (error) {
    console.log(error.message);
  }
}



module.exports = {
  loadRegister,
  insertUser,
  loadVerify,
  verifyOTP,
  loadLogin,
  loadLoginVerify,
  userLogout,
  resendOTPWhenTimeOut,

 
};
