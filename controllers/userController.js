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
  const otpExpiration = new Date(Date.now() + 600000); // OTP expires in 10 minutes

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
    console.log(error.message);
  }
};

//GET REQUEST FOR LOAD USER REGISTRATION

const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};

//POST REQUEST FOR LOAD USER REGISTRATION TO INSERT NEW USER
const insertUser = async (req, res) => {
  try {
    const hashPassword = await securePassword(req.body.password);

    const User = new userModel({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      mobile: req.body.mobile,
      password: hashPassword,
      is_verified: false,
      is_admin: 0,
      status: true,
    });

    const confirmPassword = req.body.password === req.body.confirmPassword;
    if (!confirmPassword) {
      const passwordMessage =
        "Your registration has failed. Please check your password" ||
        "Your registration has been completed";
      return res.render("registration", {
        password: passwordMessage,
      });
    }

    const userData = await User.save();
    generateAndSendOTP(userData.email);
    // Redirect to the OTP verification page with _id and email as URL parameters
    return res.redirect(`/verify?_id=${userData._id}&email=${userData.email}`);
  } catch (error) {
    console.error("Error inserting user:", error.message);
    return res.render("registration", {
      password: "Error during registration. Please try again.",
    });
  }
};
const loadVerify = async (req, res) => {
  try {
    const email = req.query.email;

    // Check if the user is already verified
    const userData = await userModel.findOne({ email: email, is_verified: true });

    if (userData) {
      // User is already verified, redirect to a different page
      return res.redirect('/');
    }

    // User is not yet verified, render the verifyOTP page
    res.render("verifyOTP");
  } catch (error) {
    console.log(error.message);
    // Handle the error
    res.render("verifyOTP", { error: "An error occurred." });
  }
};

//VERIFY OTP
const verifyOTP = async (req, res) => {
  try {
    const id = req.query._id;
    const email = req.query.email;
    const otp = req.body.otp;

    const userData = await userModel.findOne({ _id: id, email: email });
    const OTPData = await userOTPVeryModel.findOne({
      email: email,
      otpCode: otp,
    });

    if (!userData || !otp) {
      return res.render("verifyOTP", {
        error: "Invalid OTP or user already verified",
      });
    }

    if (userData && OTPData.otpCode === otp) {
      await userModel.updateOne({ _id: id }, { $set: { is_verified: true } });
      await userOTPVeryModel.deleteOne({ otpCode: otp });
      return res.redirect('/');
    }

  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    return res.render("verifyOTP", {
      error: "An error occurred during OTP verification. Please try again.",
    });
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
    const email = req.body.email;
    const password = req.body.password;
    const userData = await userModel.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_verified === true) {
          if (userData.status === false) {
            return res.render("login", { message: "You have been blocked by the admin" });
          } else {
            req.session.user = {

              isUserAuthenticated:true,
              username:userData.first_name+" "+userData.last_name,
             
            }

            return res.redirect("/home");
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

const userLogout = async(req,res)=>{
  try{

    req.session.destroy();
    res.redirect('/login');

  }catch(error){
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
 
};
