const { CartModel } = require("../models/cart&WishlistModel");
const { generateOrderID } = require("../helpers/oderIdHelper");
const userModel = require("../models/userModel");
const Razorpay = require("razorpay");
const productModal = require("../models/productModel");
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
    const referredUser = await userModel.findById(user.referredBy).populate('referredBy');
    const previousPurchaseCount = user.referredPurchases;
    if (referredUser && !referredUser.referredBy) {
      referredUser.referredPurchases += 1;
      await referredUser.save();
    }
    if (paymentMethod && paymentMethod === "COD") {
      const order = createOder(
        id,
        selectedAddress,
        user,
        paymentMethod,
        userCart
      );
      await decrementProductStock(userCart);

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
      await decrementProductStock(userCart);
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

const decrementProductStock = async (userCart) => {
  try {
    // Iterate through each item in the user's cart
    for (const cartItem of userCart.cart) {
      const productId = cartItem.product_id;

      // Find and update the product's stock
      const updatedProduct = await productModal.findOneAndUpdate(
        { _id: productId },
        { $inc: { stock: -cartItem.quantity } },
        { new: true }
      );

      // Log the updated product's stock (optional)
    }
  } catch (error) {
    console.error('Error decrementing product stock:', error);
    throw error; // Propagate the error if needed
  }
};


const downloadInvoice = async(req,res)=>{

  try{

    const {order_id} = req.params;
    const user_id = req.session.user?req.session.user.userId:undefined;
    if(user_id){
    const order = await userModel.findById(user_id);

    res.status(200).json({order});
    }

  }catch(error){
    console.error(error);
    res.status(500).json({message:"Internal server error"})
  }
}

const userAddFundWallet = async(req,res)=>{

  try{

    const userId = req.session.user?req.session.user.userId:undefined;
    const amount = req.body;
    console.log(userId,"",amount.amount);
    if(!userId){

      res.status(400).json({message:"no user found"});
    }

    
    const oderId = generateOrderID();

    var options = {
      amount: amount.amount * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: "" + oderId,
    };

    createRazorpayOrder(instance, options, async (err, order) => {
      if (order) {
        res.status(201).json({ order });
      } else {
        console.log(err);
      }
    });


  }catch(error){
    console.error(error);
  }
}
const userAddFundWalletVerify = async(req,res)=>{

  try {
    const id = req.session.user.userId;
    const {  order,amount } = req.body;

    const user = await userModel.findById(id);


    verifyPayment(req.body)
    .then((response) => {
      if (response) {
        const order = createWalletOrder(
          id,
          amount,
        ); 

      }else{
        console.error("Order not placed");
      }
    });

  } catch (error) {
    console.error(error);
  }
}
async function createWalletOrder(id,amount) {

  try{
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
      {
        $inc: { 'wallet.balance':amount}, // Subtract totalAmount from the balance
        $push: {
          'wallet.transactions': {
            type: 'credit',
            amount: parseInt(amount),
            timestamp: Date.now().toString(),
            description: 'Amount credited successfully',
          },
        },
      },
      { new: true } // Return the updated document
    );
    if (!updatedUser) {

      console.log('User not found');

      return false;
    }
  console.log("Payment successfull");
  }catch(error){
   console.error(error);
  }

}


module.exports = {
  verfyUserPaymentOption,
  verifyOnlinePayment,
  downloadInvoice,
  userAddFundWallet,
  userAddFundWalletVerify,
};
