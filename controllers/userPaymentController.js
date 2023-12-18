const { CartModel } = require("../models/cart&WishlistModel");
const { generateOrderID } = require("../helpers/oderIdHelper");
const userModel = require("../models/userModel");
const Razorpay = require("razorpay");
const {createRazorpayOrder,verifyPayment} = require("../helpers/razorPayHelper");
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
const verfyUserPaymentOption = async (req, res) => {
  try {
    const id = req.params.id;
    const { selectedAddressId, paymentMethod } = req.body;
    const user = await userModel.findById(id);
    const userCart = await CartModel.findById(id).populate("cart.product_id");
    const address = await userModel.findOne(
      { _id: id, "addresses._id": selectedAddressId },
      { "addresses.$": 1 }
    );
    const selectedAddress = address.addresses[0];

    if (paymentMethod && paymentMethod === "COD") {
      const order = createOder(
        id,
        selectedAddress,
        user,
        paymentMethod,
        userCart
      );

      await userCart.deleteOne({ _id: id });
      delete req.session.user.cart;
      return res.status(201).json({});
    } else {
      const oderId = generateOrderID();

      var options = {
        amount: userCart.total_price * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + oderId,
      };

      createRazorpayOrder(instance, options, async (err, order) => {
        if (order) {
          console.log(order);
          res.status(201).json({ order });
        } else {
          console.log(err);
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const verifyOnlinePayment = async (req, res) => {
  try {
    const id = req.session.user.userId;
    const { selectedAddressId, paymentMethod } = req.body;
    const user = await userModel.findById(id);
    const userCart = await CartModel.findById(id).populate("cart.product_id");
    const address = await userModel.findOne(
      { _id: id, "addresses._id": selectedAddressId },
      { "addresses.$": 1 }
    );
    const selectedAddress = address?.addresses?.[0];

    console.log(req.body);

    verifyPayment(req.body)
      .then((response) => {
        if (response) {
          const order = createOder(
            id,
            selectedAddress,
            user,
            paymentMethod,
            userCart
          ); 
        }else{
          console.error("Order not placed");
        }
      });
      await userCart.deleteOne({ _id: id });
      delete req.session.user.cart;
      return res.status(201).redirect('/home/settings/oders');
  } catch (error) {
    console.error(error);
  }
};

async function createOder(id, selectedAddress, user, paymentMethod, userCart) {
  const userOder = {
    order_id: generateOrderID(),
    customerName: user.first_name + " " + user.last_name,
    payment: paymentMethod=='COD'?false:true,
    payment_mode: paymentMethod,
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

  return true;
}

module.exports = {
  verfyUserPaymentOption,
  verifyOnlinePayment,
};
