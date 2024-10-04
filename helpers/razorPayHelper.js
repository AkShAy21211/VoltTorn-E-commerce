

const createRazorpayOrder = (razorpayInstance, options, callback) => {
  razorpayInstance.orders.create(options, function (err, order) {
    if (err) {
      // Handle error
      console.error(err);
      callback(err, null);
    } else {
      // Order created successfully
      callback(null, order);
    }
  });
};

const CryptoJS = require("crypto-js");

const verifyPayment = (details) => {
  return new Promise((resolve, reject) => {
    const razorpay_order_id = details.response.razorpay_order_id;
    const razorpay_payment_id = details.response.razorpay_payment_id;

    const secret = "iS5lOhiy9F8G62U1h1mo8lD9"; // Replace this with your actual secret key

    // Concatenate the order_id and payment_id with '|'
    const dataToHash = razorpay_order_id + '|' + razorpay_payment_id;

    // Create an HMAC-SHA256 hash using crypto-js
    const hmac = CryptoJS.HmacSHA256(dataToHash, secret).toString(CryptoJS.enc.Hex);


    if (hmac === details.response.razorpay_signature) {
      resolve("Payment successful");
    } else {
      reject("Payment failed");
    }
  });
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
};
