const { ObjectId } = require("mongodb");
const { CartModel, WishListModel } = require("../models/cart&WishlistModel");
const productModel = require("../models/productModel");

const userShoppingCartPageLoad = async (req, res) => {
  try {
    // Check if the user is logged in
    if (req.session.user && req.session.user.userId && req.session.user) {
      const user_id = req.session.user.userId;
      const userCart = await CartModel.findOne({ _id: user_id }).populate(
        "cart.product_id"
      );

      // Check if userCart is defined and has the cart property
      const userCartCount =
        userCart && userCart.cart ? userCart.cart.length : 0;

      res.render("cart", { userCart, userCartCount });
    } else {
      // If the user is not logged in, render the cart page with an empty cart
      res.render("cart", { userCart: { cart: [] }, userCartCount: 0 });
    }
  } catch (error) {
    console.error(error);
  }
};

const userAddToCartButton = async (req, res) => {
  try {
    const product_id = req.params.product_id;
    const productPrice = req.body.productPrice;

    const product = await productModel.findById(product_id);

    const user_id = req.session.user.userId;

    if (user_id) {
      const existingCart = await CartModel.findOne({ _id: user_id });

      if (existingCart) {
        const existingProduct = existingCart.cart.find((item) =>
          item.product_id.equals(product_id)
        );

        if (existingProduct) {
          // Return a JSON response with redirectTo property
          return res.status(200).json({
            success: true,
            redirectTo: "/home/cart",
          });
        } else {

            //when new item added in existing cart

          const updatedCart = await CartModel.findOneAndUpdate(
            { _id: user_id },
            {
              $push: {
                cart: {
                  product_id: product_id,
                  quantity: 1,
                  image: product.variants[0].images[0],
                  price: parseFloat(productPrice),
                },
              },
            },
            { new: true }
          );

          const total_price = updatedCart.cart.reduce((total, item) => total + item.price, 0);

          await CartModel.findOneAndUpdate(
            { _id: user_id },{$set:{total_price:total_price}}
          );
          // Return a JSON response with message and redirectTo properties
          return res.status(200).json({
            success: true,
            total_price,
            message: "Item added to cart",
            redirectTo: "/home/cart",
          });
        }
      } else {

        //when new cart is created 

        const newCart = new CartModel({
          _id: user_id,
          cart: [
            {
              product_id: product_id,
              quantity: 1,
              image: product.variants[0].images[0],
              price: parseFloat(productPrice),
            },
          ],
          total_price:parseFloat(productPrice),
        });

        const cartData = await newCart.save();

        // Return a JSON response with message and redirectTo properties
        return res.status(200).json({
          success: true,
          message: "Item added to cart",
          redirectTo: "/home/cart",
        });
      }
    } else {
      // Redirect if the user is not authenticated
      return res.status(301).json({
        success: false,
        message: "User not authenticated",
        redirectTo: "/login",
      });
    }
  } catch (error) {
    console.error(error);
    // Handle internal server error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const cartId = req.params.product_id;
    const newQuantity = req.body.quantity;
    const product = req.params.product;

    const productDetails = await productModel.findById(product);

    const newProductPrice =
      parseFloat(
        productDetails.price -
          productDetails.price * (productDetails.discount / 100)) * newQuantity;

    const cart = await CartModel.findOneAndUpdate(
      {
        _id: cartId,
        "cart.product_id": product,
      },
      {
        $set: {
          "cart.$.quantity": newQuantity,
          "cart.$.price": newProductPrice,
        },
      },
      { new: true }
    );

    const total_price = cart.cart.reduce((total, item) => total + item.price, 0);

    await CartModel.findOneAndUpdate({_id:cart},{$set:{total_price:total_price}});



    res.status(200).json({
      success: true,
      message: "Quantity updated successfully",
      cart,
      total_price,
      newProductPrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  userShoppingCartPageLoad,
  userAddToCartButton,
  updateQuantity,
};
