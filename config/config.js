const userSessionSecreat = 'This is session secret';
const adminSessionSecret = 'This is session secret';
const mailchimp = require("@mailchimp/mailchimp_marketing");
const mailChimp = mailchimp.setConfig({
  apiKey: process.env.MAIL_CHIMP,
  server: "us1",
});


module.exports = {userSessionSecreat,adminSessionSecret};