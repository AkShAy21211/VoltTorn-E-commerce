const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
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
    });

    const confirmPassword = req.body.password === req.body.confirmPassword;
    if (!confirmPassword) {
      const password =
        "Your registration has been failed please check your password" ||
        "Your registration has been completed";
      res.render("registration", {
        password,
      });
    } else {
      const userData = await User.save();
      setTimeout(() => {
        res.redirect(`/verify?_id=${userData._id}&email=${userData.email}`);
      }, 1000);
      // Redirect to the OTP verification page with _id and email as URL parameters
      generateAndSendOTP(userData.email);
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadVerify = async (req, res) => {
  try {
    res.render("verifyOTP");
  } catch (error) {
    console.log(error.message);
  }
};

//VERIFY OTP
const verifyOTP = async (req, res) => {
  try {
    const { _id, email } = req.query;
    const otp = req.body.otp;

    const userData = await userModel.findOne({ _id, email });
    const OTPData = await userOTPVeryModel.findOne({
      email: email,
      otpCode: otp,
    });

    if (!userData || !otp) {
      res.render("verifyOTP", {
        error: "Invalid OTP or user already verified",
      });
    } else {
      if (userData && OTPData.otpCode === otp) {
        const updateUser = await userModel.updateOne({ is_verified: true });
        await OTPData.deleteOne({ otpCode: otp });

        res.redirect('/login')
      }
    }
  } catch (error) {}
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
        if (userData.is_verified === false) {
          res.render("login", { message: "Please verify your email" });
        } else {
          req.session.user_id = userData._id;
          res.redirect("/home");
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

const loadHome = async (req, res) => {
  try {
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};

//USER LOGOUT 

const userLogout = async(req,res)=>{
  try{

    req.session.destroy();
    res.redirect('/');

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
  loadHome,
  userLogout
};
