const nodemailer = require("nodemailer");


const sendResetEmail = async (name,email, token) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });
  
    const mailOptions = {
      from: "pa080633@gmail.com",
      to: email,
      subject: "Reset password Link",
      html: `<p> HI `+name+`,please copy the link <a href="/reset-password?token=`+token+`"> and reset password </a></p>`,
    };
  
     transporter.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.error(err);
        }else{
            console.log("email has been send");
        }
    });
  };

  module.exports ={
    sendResetEmail,
  }