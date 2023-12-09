
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
  
  module.exports = {
    createRazorpayOrder,
  };
  