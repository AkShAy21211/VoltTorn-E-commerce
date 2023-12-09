const { CartModel } = require("../models/cart&WishlistModel");
const { generateOrderID } = require("../helpers/oderIdHelper");
const userModel = require("../models/userModel");
const Razorpay = require("razorpay");
const { createRazorpayOrder } = require("../helpers/razorPayHelper");
const { json } = require("body-parser");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;
var instance = new Razorpay({
  key_id: "rzp_test_IqLBbBfcC14Mtr",
  key_secret: "iS5lOhiy9F8G62U1h1mo8lD9",
});

const completeOderCashOnDelivery = async (req, res) => {
  try {
    const id = req.params.id;
    const addressId = req.body.selectedAddressId;
    const user = await userModel.findById(id);
    const userCart = await CartModel.findById(id).populate("cart.product_id");
    const address = await userModel.findOne(
      { _id: id, "addresses._id": addressId },
      { "addresses.$": 1 }
    );
    const selectedAddress = address.addresses[0];

    if (userCart) {
      const userOder = {
        order_id: generateOrderID(),
        customerName: user.first_name + " " + user.last_name,
        address: {
          address: selectedAddress.address,
          country: selectedAddress.country,
          state: selectedAddress.state,
          city: selectedAddress.city,
          zip: selectedAddress.zip,
          mobile: user.mobile,
          email: user.email,
        },
        products: userCart.cart,
        date: Date.now().toString(),
        status: "Pending",
        totalAmount: userCart.total_price,
      };

      const userOderAdd = await userModel.findOneAndUpdate(
        { _id: id },
        { $push: { oders: userOder } }
      );

      if (userOderAdd) {
        await userCart.deleteOne({ _id: id });

        delete req.session.user.cart;

        return res.status(303).redirect("/home/settings/oders");
      }
    } else {
      console.log("no user found");
      res.redirect("/home");
    }
  } catch (error) {
    console.error(error);
  }
};

const completeOnlinePaymentOder = async (req, res) => {
  try {
    const { id } = req.params;
    const { total_price } = req.session.user.cart;
    const oderId = await CartModel.findById(id);
    const addressId = req.body.selectedAddressId;
    const user = await userModel.findById(id);
    const userCart = await CartModel.findById(id).populate("cart.product_id");
    const address = await userModel.findOne(
      { _id: id, "addresses._id": addressId },
      { "addresses.$": 1 }
    );
    const selectedAddress = address.addresses[0];
    if (userCart) {
      const userOder = {
        order_id: generateOrderID(),
        customerName: user.first_name + " " + user.last_name,
        address: {
          address: selectedAddress.address,
          country: selectedAddress.country,
          state: selectedAddress.state,
          city: selectedAddress.city,
          zip: selectedAddress.zip,
          mobile: user.mobile,
          email: user.email,
        },
        products: userCart.cart,
        date: Date.now().toString(),
        status: "Pending",
        totalAmount: userCart.total_price,
      };

      const userOderAdd = await userModel.findOneAndUpdate(
        { _id: id },
        { $push: { oders: userOder } }
      );

      const oderId = generateOrderID();

      var options = {
        amount: userCart.total_price * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + oderId,
      };

      const order = createRazorpayOrder(
        instance,
        options,
        async (err, order) => {
          if (order) {
            await userCart.deleteOne({ _id: id });
            console.log("this is oder", order);

            res.status(200).json({ order });
          } else {
            console.log(err);
          }
        }
      );
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  completeOderCashOnDelivery,
  completeOnlinePaymentOder,
};
