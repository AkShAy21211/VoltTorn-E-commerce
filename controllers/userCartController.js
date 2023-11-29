const { CartModel, WishListModel } = require('../models/cart&WishlistModel');

const productModel = require("../models/productModel");
const userShoppingCartPageLoad = async (req, res) => {
  try {

    const user_id = req.session.user.userId;
    const userCart = await CartModel.findOne({ _id: user_id }).populate("cart.product_id") || undefined;
    
    res.render("cart",{userCart});
  } catch (error) {
    console.error(error);
  }
};
const userAddToCartButton = async (req, res) => {
  try {
      const product_id = req.params.product_id;

      const product = await productModel.findById(product_id);

      const user_id = req.session.user.userId;

      console.log("User ID: " + user_id);

      // Check if the user is authenticated
      if (user_id) {
          // Check if the user already has a cart
          const existingCart = await CartModel.findOne({ _id: user_id });

          if (existingCart) {
              // Check if the product is already in the cart
              const existingProduct = existingCart.cart.find(item => item.product_id.equals(product_id));

              if (existingProduct) {
                  // Update the quantity of the existing product in the cart
                  const updatedCart = await CartModel.findOneAndUpdate(
                      {
                          _id: user_id,
                          'cart.product_id': product_id,
                      },
                      {
                          $inc: { 'cart.$.quantity': 1 },
                      },
                      { new: true }
                  );

                  res.status(200).json({ success: true, message: 'Item Quantity Updated In Cart', cartData: updatedCart });
              } else {
                  // Add a new item to the cart
                  const updatedCart = await CartModel.findOneAndUpdate(
                      { _id: user_id },
                      {
                          $push: {
                              cart: {
                                  product_id: product_id,
                                  quantity: 1,
                                  image: product.variants[0].images[0],
                                  total_price: 0,
                              },
                          },
                      },
                      { new: true }
                  );

                  res.status(200).json({ success: true, message: 'Item Added To Cart', cartData: updatedCart });
              }
          } else {
              // Create a new cart document
              const newCart = new CartModel({
                  _id: user_id,
                  cart: [
                      {
                          product_id: product_id,
                          quantity: 1,
                          image: product.variants[0].images[0],
                          total_price: 0,
                      },
                  ],
              });

              const cartData = await newCart.save();
              res.status(200).json({ success: true, message: 'Item added to cart', cartData });
          }
      } else {
          // If the user is not authenticated, redirect to the login page
        res.status(301).json({ success: false, message: 'User not authenticated', redirect: '/login' });
      }

  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


const updateQuantity =async (req, res) => {
  try {
      const cartId = req.params.product_id;
      const newQuantity = req.body.quantity;
      const product = req.params.product;

      const cart =  await CartModel.findOneAndUpdate({
        _id: cartId,
        'cart.product_id': product,
    },
    {
        $set: { 'cart.$.quantity': newQuantity },
    },
    { new: true })
      console.log(""+cart,newQuantity);

      res.status(200).json({ success: true, message: 'Quantity updated successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


module.exports = {
  userShoppingCartPageLoad,
  userAddToCartButton,
  updateQuantity,
};
