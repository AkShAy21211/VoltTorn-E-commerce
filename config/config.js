const userSessionSecreat = 'This is session secret';
const adminSessionSecret = 'This is session secret';
const mongoose = require("mongoose");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const mailChimp = mailchimp.setConfig({
  apiKey: process.env.MAIL_CHIMP,
  server: "us1",
});

const connectMongoose = async ()=>{
  try{
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  }catch(error){
    console.error("Failed to connect to MongoDB",error);
    process.exit(1);
  }
}

module.exports = {userSessionSecreat,adminSessionSecret,connectMongoose};