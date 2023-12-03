
const mongoose = require("mongoose");

// Function to calculate the total discount for a given cart
const calculateTotalDiscount = async (cart) => {
  let totalDiscount = 0;

  // Loop through each item in the cart
  for (const cartItem of cart) {
    // Retrieve the product details from the database
    const product = await mongoose.model("Product").findById(cartItem.product_id);

    // If the product has a discount, calculate the discount for the item
    if (product.discount) {
      const itemDiscount = (product.discount / 100) * product.price * cartItem.quantity;
      totalDiscount += itemDiscount;
    }
  }

  return totalDiscount;
};

// Export the function to use in other modules
module.exports = {
  calculateTotalDiscount,
};
