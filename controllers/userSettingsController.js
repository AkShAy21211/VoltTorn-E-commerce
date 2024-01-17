const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const { WishListModel } = require("../models/cart&WishlistModel");
const offerModal = require("../models/offerModal");
const reviewModal = require("../models/reviewModel");
const returnModal = require("../models/returnModel");
const countryState = require("country-state-city");

//USER SETTINGS PAGE

const loadUserSettings = async (req, res) => {
  try {
    const id =
      req.session.user && req.session.user.userId
        ? req.session.user.userId
        : undefined;
    const referralOffer =
      (await offerModal.findOne({ offerType: "Referral" })) || undefined;

    if (id) {
      const user = await userModel.findById(id);
      res.render("settings", { user, referralOffer });
    } else {
      res.render("settings");
    }
  } catch (error) {
    console.error(error);
  }
};

const editUserProfile = async (req, res) => {
  try {
    const id = req.params.id ? req.params.id : {};
    const { firstName, lastName, mobile, email } = req.body;
    const image = req.file ? req.file.filename : null;

    console.log(mobile);

    const updateObject = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      mobile: mobile,
    };

    if (image) {
      updateObject.image = image;
    }

    // Update the user profile
    const updateUserProfile = await userModel.findOneAndUpdate(
      { _id: id },
      { $set: updateObject },
      { new: true } // Return the updated document
    );

    res.redirect("/home/settings/profile");
  } catch (error) {
    console.error(error);
  }
};



const loadUserAddress = async (req, res) => {
  try {
    const id = req.session.user.userId;
    const states = countryState.State.getStatesOfCountry("IN");

    if (id ) {
    const user  = await userModel.findById(id);
    
    res.render("address",{user,states});
    }
  } catch (error) {
    console.error(error);
  }
};
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

    res.redirect("/home/settings/address");
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

    res.redirect("/home/settings/address");
  } catch (error) {
    console.error(error);
    // Handle the error appropriately, e.g., send an error response to the client
    res.status(500).send("Internal Server Error");
  }
};

const deleteUserAddress = async (req, res) => {
  try {
    const id = req.session.user.userId;
    const address_id = req.params.id;
    console.log(id, " ", address_id);

    if (id && address_id) {
      await userModel.findByIdAndUpdate(
        { _id: id },
        { $pull: { addresses: { _id: address_id } } }
      );
    }
    res.redirect("/home/settings/address");
  } catch (error) {
    console.error(error);
  }
};

// const loadOderManagment = async (req, res) => {
//   try {
//     const user = await userModel.find({ is_admin: false });
//     const oders = user.flatMap((user) => user.oders);
//     const oderCount = oders.length;
//     const oderedCustomers = oders.map((oders) => oders.customerName);
//     const customers = oderedCustomers.length;

//     console.log(oders);
//     res.render("oders", { oders, oderCount, customers });
//   } catch (error) {
//     console.error(error);
//   }
// };

const loadUserOdersPage = async (req, res) => {
  try {
    const returnData = await returnModal.find({});
    const id =
      req.session.user && req.session.user.userId
        ? req.session.user.userId
        : undefined;
    let oders = (await userModel.find({ _id: id }, { oders: 1 })).flatMap(
      (oders) => oders.oders
    );
     oders = oders.sort((a, b) => b.date - a.date);

    res.render("oders", { oders, returnData });
  } catch (error) {
    console.error(error);
  }
};

const forCancelUserOders = async (req, res) => {
  try {
    const id =
      req.session.user && req.session.user.userId
        ? req.session.user.userId
        : undefined;
    const { oder_id, product_id, oder_index, product_index } = req.params;
    const product = await productModel.findById(product_id);
    const userOrder = await userModel.findById(id);
    const order = userOrder.oders[oder_index];
    const orderProduct = order.products[product_index];
    const productPrice = orderProduct.price;
    const productQuantity = orderProduct.quantity;

    if (product) {
      const userOder = await userModel.updateOne(
        {
          _id: id,
          "oders.order_id": oder_id,
          "oders.products.product_id": product._id,
        },
        {
          $set: {
            "oders.$.products.$[product].cancelled": true,
          },
        },
        {
          arrayFilters: [{ "product.product_id": product._id }],
        }
      );

      if (order.payment) {
        const updatedUser = await userModel.findOneAndUpdate(
          { _id: id },
          {
            $inc: { "wallet.balance": productPrice }, // Subtract totalAmount from the balance
            $push: {
              "wallet.transactions": {
                type: "credit",
                amount: productPrice,
                timestamp: Date.now().toString(),
                description: "Amount for cancelled order credited successfully",
              },
            },
          },
          { new: true } // Return the updated document
        );
      }
      await incrementProductStock(product, productQuantity);
      res.redirect("/home/settings/oders");
    } else {
      res.json({ success: false, message: "Invalid order ID" });
    }
  } catch (error) {
    console.error("Error in updating products.cancelled:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const forReturnOders = async (req, res) => {
  try {
    console.log("called");
    const id =
      req.session.user && req.session.user.userId
        ? req.session.user.userId
        : undefined;
    const { oder_id, product_id, oder_index, product_index, reason, quantity } =
      req.params;
      const user = await userModel.find(id);
    const product = await productModel.findById(product_id);
    const userOrder = await userModel.findById(id);

    let order = userOrder.oders.sort((a, b) => b.date - a.date);
    order = userOrder.oders[oder_index];
  
    const orderProduct = order.products[product_index];
    const productPrice = orderProduct.price;
    const returnData = await returnModal.findOne({orderId:order._id,productId:product_id});


    console.log( order);

    if (product_id && order && reason && quantity) {
      const returnData = new returnModal({
        productId: product_id,
        orderId: order._id,
        customerName: order.customerName,
        returnReason: reason,
        quantity: quantity,
        status: "Pending",
      });

      console.log(order.products.length);

      if (order.products.length == 1) {
        console.log("1 only");
        const userOder = await userModel.updateOne(
          {
            _id: id,
            "oders.order_id": oder_id,
            "oders.products.product_id": product._id,
          },
          {
            $set: {
              "oders.$[order].products.$[product].returned": "Pending",
            },
          },
          {
            arrayFilters: [
              { "order.order_id": oder_id },
              { "product._id": orderProduct._id },
            ],
          }
        );

        res.status(200);
        // await userModel.findOneAndUpdate({'oders._id':order._id},{$set:{'oders.$.status':"Returned"}},{new:true});

      } else {
        console.log("more than one");
      
          const update = await userModel.updateOne(
            {
              _id: id,
              "oders.order_id": oder_id,
              "oders.products.product_id": product._id,
            },
            {
              $set: {
                "oders.$[order].products.$[product].returned": "Pending",
              },
            },
            {
              arrayFilters: [
                { "order.order_id": oder_id },
                { "product._id": orderProduct._id },
              ]
            }
          );
          res.status(200);

          // await userModel.findOneAndUpdate({'oders._id':order._id},{$set:{'oders.$.status':"Returned"}},{new:true});

      
 
      }
      
      





      await returnData.save();
      res.redirect("/home/settings/oders");
    }
  } catch (error) {
    console.error(error);
  }
};

const userWishlistLoad = async (req, res) => {
  try {
    const id = req.session.user.userId;
    const products = await WishListModel.findById(id).populate('product');

    res.render("wishLists", { products});
  } catch (error) {
    console.error(error);
  }
};
const userWishlistLoadProductAdd = async (req, res) => {
  try {
    const id = req.params.product_id;
    const user_id = req.session.user ? req.session.user.userId : undefined;
    const product = await productModel.findById(id);
    const existingWishlist = await WishListModel.findById(user_id);
    const existingProduct = await WishListModel.findOne({
      _id: user_id,
      product: product._id,
    });

    if (user_id) {
      if (existingWishlist) {
        if (existingProduct) {
          res
            .status(200)
            .json({ success: "Product already added to wishlist",wishCount:existingWishlist.product.length });
        } else {
          existingWishlist.product.push(product);
          await existingWishlist.save();
          res.status(200).json({ success: "Product added to wishlist" ,wishCount:existingWishlist.product.length});
        }
      } else {
        const wishlist = new WishListModel({
          _id: user_id,
          product: [product],
        });

        await wishlist.save();
        res.status(200).json({ success: "Product added to wishlist" ,wishCount:wishlist.product.length});
      }
    } else {
      res.status(400).json({ error: "You need to login to proceed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const removeWishlistsItems = async (req, res) => {
  try {
    const index = req.params.index;
    const user_id = req.session.user ? req.session.user.userId : undefined;
    if (user_id) {
      const wishlist = await WishListModel.findById(user_id);

      if (wishlist && wishlist.product.length > 0) {
        wishlist.product.splice(index, 1);
        await wishlist.save();
        res.redirect("/home/settings/wishlist");
      }
    } else {
      res
        .status(403)
        .json({ success: false, message: "User not authenticated" });
    }
  } catch (error) {
    console.error(error);
  }
};

const loadUserReviews = async (req, res) => {
  try {
    const userId = req.session.user ? req.session.user.userId : undefined;
    const reviews = await reviewModal
      .find({ user: userId })
      .populate("user")
      .populate("product");
    res.render("ratings", { reviews });
  } catch (error) {
    console.error(error);
  }
};

const addProductReview = async (req, res) => {
  try {
    const { rating, review, product } = req.query;
    const userId = req.session.user ? req.session.user.userId : undefined;
    const reviewData = new reviewModal({
      user: userId,
      product: product,
      review: review,
      rating: rating,
    });

    await reviewData.save();

    res.status(200).json({ reviewData });
  } catch (error) {
    console.error(error);
  }
};

const deleteUserReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await reviewModal.findByIdAndDelete(id);
    res.redirect("/home/settings/reviews");
  } catch (error) {
    console.error(error);
  }
};

const loadUserWallet = async (req, res) => {
  try {
    const userId = req.session.user ? req.session.user.userId : undefined;

    const userData = await userModel.findById(userId);

    res.render("wallet", { userData });
  } catch (error) {
    console.error(error);
  }
};
const incrementProductStock = async (product, productQuantity) => {
  try {
    const updatedProduct = await productModel.findOneAndUpdate(
      { _id: product },
      { $inc: { stock: productQuantity } },
      { new: true }
    );

    // Log the updated product's stock (optional)
  } catch (error) {
    console.error("Error decrementing product stock:", error);
    throw error; // Propagate the error if needed
  }
};
module.exports = {
  loadUserSettings,
  editUserProfile,
  // loadOderManagment,
  stateCityLoad,
  addUserBellingAddress,
  editUserBillingAddress,
  loadUserAddress,
  loadUserOdersPage,
  forCancelUserOders,
  forReturnOders,
  deleteUserAddress,
  userWishlistLoad,
  userWishlistLoadProductAdd,
  removeWishlistsItems,
  addProductReview,
  loadUserReviews,
  deleteUserReviews,
  loadUserWallet,
};
