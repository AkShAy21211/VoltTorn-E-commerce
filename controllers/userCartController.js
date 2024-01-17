const { CartModel } = require("../models/cart&WishlistModel");
const productModel = require("../models/productModel");
const countryState = require("country-state-city");
const { calculateTotalDiscount } = require("../helpers/totalDiscountHelper");
const { generateOrderID } = require("../helpers/oderIdHelper");
const userModel = require("../models/userModel");
const offerModel = require("../models/offerModal");
const couponModal = require("../models/couponModal");
const { ObjectId } = require("bson");
const { ref } = require("pdfkit");

const userShoppingCartPageLoad = async (req, res) => {
  try {
    // Check if the user is logged in
    if (req.session.user && req.session.user.userId && req.session.user) {
      const user_id = req.session.user.userId;
      const userCart = await CartModel.findOne({ _id: user_id }).populate(
        "cart.product_id"
      );
      req.session.user.cartCount =
        userCart && userCart.cart ? userCart.cart.length : 0;
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
          req.session.user.cart = existingProduct;

          return res.status(200).json({
            success: true,
            redirectTo: "/home/cart",
            message: "Product already added ",
            cartCount: existingCart.cart.length,
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
                  name: product.name,
                  image: product.variants.images[0],
                  price: parseFloat(productPrice),
                },
              },
            },
            { new: true }
          );

          const total_price = updatedCart.cart.reduce(
            (total, item) => total + item.price,
            0
          );

          await CartModel.findOneAndUpdate(
            { _id: user_id },
            { $set: { total_price: total_price } }
          );
          // Return a JSON response with message and redirectTo properties
          req.session.user.cart = updatedCart;

          return res.status(200).json({
            success: true,
            total_price,
            message: "Product added to cart",
            redirectTo: "/home/cart",
            cartCount: updatedCart.cart.length,
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
              name: product.name,
              image: product.images[0],
              price: parseFloat(productPrice),
            },
          ],
          total_price: parseFloat(productPrice),
        });

        const cartData = await newCart.save();

        // Return a JSON response with message and redirectTo properties
        req.session.user.cart = newCart;

        return res.status(200).json({
          success: true,
          message: "Product added to cart",
          redirectTo: "/home/cart",
          cartCount: newCart.cart.length,
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

const userBuyNowButton = async (req, res) => {
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
          req.session.user.cart = existingProduct;

          return res.status(200).json({
            success: true,
            redirectTo: "/home/cart",
            message: "Product already added to cart",
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
                  name: product.name,
                  image: product.variants.images[0],
                  price: parseFloat(productPrice),
                },
              },
            },
            { new: true }
          );

          const total_price = updatedCart.cart.reduce(
            (total, item) => total + item.price,
            0
          );

          await CartModel.findOneAndUpdate(
            { _id: user_id },
            { $set: { total_price: total_price } }
          );
          // Return a JSON response with message and redirectTo properties
          req.session.user.cart = updatedCart;

          return res.status(200).json({
            success: true,
            total_price,
            message: "Product added to cart",
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
              name: product.name,
              image: product.images[0],
              price: parseFloat(productPrice),
            },
          ],
          total_price: parseFloat(productPrice),
        });

        const cartData = await newCart.save();

        // Return a JSON response with message and redirectTo properties
        req.session.user.cart = newCart;

        return res.status(200).json({
          success: true,
          message: "Product added to cart",
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

    if (newQuantity > productDetails.stock) {
      return res
        .status(400)
        .json({ error: `Quantity exceeds available stock` });
    }

    const newProductPrice =
      parseFloat(
        productDetails.price -
        productDetails.price * (productDetails.discount / 100)
      ) * newQuantity;

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

    const total_price = cart.cart.reduce(
      (total, item) => total + item.price,
      0
    );

    await CartModel.findOneAndUpdate(
      { _id: cart },
      { $set: { total_price: total_price } }
    );

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

const deleteCartItem = async (req, res) => {
  try {
    const id = req.session.user.userId;
    const product_id = req.params.product_id;

    // Assuming CartModel has a 'cart' array and 'total_price' field
    const cart = await CartModel.findById(id);

    const updatedCart = await CartModel.findOneAndUpdate(
      { _id: id },
      { $pull: { cart: { _id: product_id } } },
      { new: true } // Return the modified document
    );

    const total_price = updatedCart.cart.reduce(
      (total, item) => total + item.price,
      0
    );

    await CartModel.findOneAndUpdate(
      { _id: id },
      { $set: { total_price: total_price } },
      { new: true }
    );

    console.log(updatedCart);
    const userCartCount =
      updatedCart && updatedCart.cart ? updatedCart.cart.length : 0;
    req.session.user.cartCount -= 1;
    delete req.session.user.cart.cart;
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      }
    });

    res.status(200).json({
      success: true,
      updatedCart,
      total_price,
      userCartCount,
    });

    console.log(total_price);

    console.log(userCartCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const loadCheckOutPage = async (req, res) => {
  try {
    const id = req.session.user.userId || null;
    let purchaseCount;
    const user = await userModel.findById(id);
    const dataState = req.body.dataState;
    const states = countryState.State.getStatesOfCountry("IN");
    const coupon = await couponModal.find({ isActive: true, expiry: { $gt: new Date() } });
    const cart = await CartModel.findById(req.session.user.userId).populate(
      "cart.product_id"
    );

    const productIds = cart.cart.map(item => item.product_id._id);

    // Assuming your productModel has a schema like { _id: ObjectId, status: Boolean, ...otherFields }
    const productsWithFalseStatus = await productModel.find({ _id: { $in: productIds }, status: false });

    if(productsWithFalseStatus.length>0){

      return res.status(400).json({error:"Product no longer avaliable",productsWithFalseStatus});
    }

    
    const categoryOffer = await offerModel.find({
      offerType: "Category",
      isActive: true,
      endDate: { $gt: new Date() },
    });
    const productOffer = await offerModel.find({
      offerType: "Product",
      isActive: true,
      endDate: { $gt: new Date() },
    });

    // if (referralOffer !== null) {
    //   purchaseCount = user.referredPurchases > 0 ? user.referredPurchases : null;
    // }

    if (!categoryOffer || !productOffer) {
      console.log("Category or product offer not found");
      return;
    }

    const matchedCategoryProducts = cart.cart.filter(
      (product) => categoryOffer.some((offer) => offer.offer === product.product_id.category)
    );


    const matchedOfferProducts = cart.cart.filter(
      (product) => productOffer.some((offer) => offer.offer === product.name)
    );

    let categoryDiscount;
    if (matchedCategoryProducts.length > 0) {
      categoryDiscount = categoryOffer.map((offer) => offer.percentage / 100);
      console.log(categoryDiscount);

    }

    let productDiscount;
    if (matchedOfferProducts.length > 0) {
      productDiscount = productOffer.map((offer) => offer.percentage / 100);
      console.log(productDiscount);
    }


    const isDiscountApplied = (product) => product.discountApplied === true;

    if (matchedCategoryProducts.length > 0) {
      console.log("category offer");

      // Update prices for products in matchedCategoryProducts
      matchedCategoryProducts.forEach((product, index) => {
        if (!isDiscountApplied(product)) {
          const discount = categoryDiscount[index];
          product.price -= product.price * discount;
          product.price = parseInt(product.price); // Convert to integer
          product.discountApplied = true; // Mark the discount as applied
        }
      });
    }

    if (matchedOfferProducts.length > 0) {
      console.log("product offer");
      // Update prices for products in matchedOfferProducts
      matchedOfferProducts.forEach((product, index) => {
        if (!isDiscountApplied(product)) {
          const discount = productDiscount[index];
          product.price -= product.price * discount;
          product.price = parseInt(product.price); // Convert to integer
          product.discountApplied = true; // Mark the discount as applied
        }
      });
    }
    const total_price = cart.cart.reduce((total, item) => total + item.price, 0);
    cart.total_price = parseInt(total_price); // Convert total_price to integer

    // Save the updated cart to the database
    await cart.save();

    const total_discount = await calculateTotalDiscount(cart.cart);
    res.render("checkout", {
      states,
      user,
      cart,
      total_discount,
      purchaseCount,
      // referralOffer,
      coupon,
    });
  
  } catch (error) {
    console.error(error);
  }
};


// const applayReferralOffer = async (req, res) => {
//   try {
//     let { id } = req.params;

//     const cart = await CartModel.findById(id);

//     const user = await userModel.findById(id);

//     if (user) {
//       const offer = await offerModel.findOne({
//         offerType: "Referral",
//         isActive: true,
//         endDate: { $gt: new Date() },
//       });


//     } else {
//       console.log("User not found.");
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


// const cancelReferralOffer = async (req, res) => {
//   try {
//     let { id } = req.params;

//     const cart = await CartModel.findById(id);

//     const user = await userModel.findById(id);
//     const total_price = cart.cart.reduce(
//       (total, item) => total + item.price,
//       0
//     );
//     if (user) {
//       const offer = await offerModel.findOne({
//         offerType: "Referral",
//         isActive: true,
//         endDate: { $gt: new Date() },
//       });
//       const offerDiscount = (offer.percentage / 100) * cart.total_price;
//       const previousPurchaseCount = user.referredPurchases;

//       if (
//         user.referredPurchases <= 5 &&
//         user.referredPurchases >= previousPurchaseCount
//       ) {
//         const updatedCart = await CartModel.findOneAndUpdate(
//           { _id: id },
//           { $set: { total_price: total_price } },
//           { new: true }
//         );
//         res.status(200).json({ updatedCart });
//       }
//     } else {
//       console.log("User not found.");
//       res.status(404).json({ message: "User not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


const loadAvaliableCoupons = async (req, res) => {

  try {
    const { total } = req.query;
    const { id } = req.params;

    console.log(id);
    const coupons = await couponModal.find({
      isActive: true,
      expiry: { $gt: new Date() },
    });

    const availableCoupons = coupons.filter((coupon) => {
      // Check if the user with the given id has used the coupon
      const userUsedCoupon = coupon.usedUsers.some((usedUser) => usedUser.user_id.equals(id));

      // Include the coupon in the availableCoupons array only if the user hasn't used it
      return !userUsedCoupon;
    });
    console.log(availableCoupons);
    if (availableCoupons) {
      res.status(200).json({ availableCoupons })

    }



  } catch (error) {
    console.error(error);
  }
}



const applayCouponCode = async (req, res) => {
  try {
    const { code } = req.query;
    const { id } = req.params;
    const cart = await CartModel.findById(id);
    const userData = await userModel.findById(id);
    const coupon = await couponModal.findOne({ code: code });


    if (coupon) {
      const isCouponUsed = coupon.usedUsers.includes(id);
      if (isCouponUsed) {
        return res.status(400).json({ message: "Coupon already used or invalid" });
      }
    } else {
      return res.status(400).json({ message: "Invalid coupon code" });

    }

    if (coupon) {
      if (coupon.minOrderAmount <= cart.total_price) {
        const couponDiscount = (coupon.discountPercentage / 100) * cart.total_price;
        const updatedCart = await CartModel.findOneAndUpdate(
          { _id: id },
          { $inc: { total_price: -couponDiscount } },
          { new: true }
        );
        return res.status(200).json({ updatedCart, message: "Coupon applied", couponDiscount });
      } else {
        return res.status(400).json({ message: "Minimum purchase requirement has not been met" });
      }
    } else {
      return res.status(400).json({ message: "Invalid Coupon" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const removeCouponCode = async (req, res) => {

  try {
    const { id } = req.params;
    const { code } = req.query;

    console.log(id, code);

    const cart = await CartModel.findById(id);

    const userData = await userModel.findById(id);

    if (userData) {

      const coupon = await couponModal.findOne({ code: code, isActive: true, expiry: { $gt: new Date() } });

      const total_price = cart.cart.reduce(
        (total, item) => total + item.price,
        0
      );
      const couponDiscount = (coupon.discountPercentage / 100) * total_price;



      if (coupon && couponDiscount) {

        const updatedCart = await CartModel.findOneAndUpdate(
          { _id: id },
          { $inc: { total_price: couponDiscount } },
          { new: true }
        );



        return res.status(200).json({ updatedCart });
      } else {

        return res.status(400).json({ message: "Invail Coupon " });

      }

    } else {
      console.log("User not found.");
      return res.status(404).json({ message: "User not found" });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" })
  }
}



const stateCityLoad = async (req, res) => {
  try {
    const dataState = req.body.dataState;
    const states = countryState.State.getStatesOfCountry("IN");
    const city = countryState.City.getCitiesOfState("IN", dataState).map(
      (City) => City.name
    );

    res.status(200).json({
      success: true,
      city,
    });
    console.log(city);
  } catch (error) {
    console.error(error);
  }
};

const addUserBellingAddress = async (req, res) => {
  try {
    const { address, country, state, city, postalCode } = req.body;

    const userAddress = {
      address: address,
      country: country,
      state: state,
      city: city,
      zip: postalCode,
    };
    await userModel.findOneAndUpdate(
      { _id: req.session.user.userId },
      { $push: { addresses: userAddress } }
    );

    res.redirect("/home/cart/checkout");
  } catch (error) {
    console.error(error);
  }
};

const editUserBillingAddress = async (req, res) => {
  try {
    const { address, country, state, city, postalCode } = req.body;
    const addressId = req.params.id;

    const result = await userModel.findOneAndUpdate(
      { "addresses._id": addressId },
      {
        $set: {
          "addresses.$.address": address,
          "addresses.$.country": country,
          "addresses.$.state": state,
          "addresses.$.city": city,
          "addresses.$.zip": postalCode,
        },
      },
      { new: true }
    );

    res.redirect("/home/cart/checkout");
  } catch (error) {
    console.error(error);
    // Handle the error appropriately, e.g., send an error response to the client
    res.status(500).send("Internal Server Error");
  }
};

//compete cash on deliver methood payment and add producvt to user oders

module.exports = {
  userShoppingCartPageLoad,
  userAddToCartButton,
  userBuyNowButton,
  updateQuantity,
  deleteCartItem,
  loadCheckOutPage,
  addUserBellingAddress,
  stateCityLoad,
  editUserBillingAddress,
  // applayReferralOffer,
  // cancelReferralOffer,
  loadAvaliableCoupons,
  applayCouponCode,
  removeCouponCode
};
