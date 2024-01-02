const { CartModel } = require("../models/cart&WishlistModel");
const { generateOrderID } = require("../helpers/oderIdHelper");
const couponModal = require("../models/couponModal");
const userModel = require("../models/userModel");
const Razorpay = require("razorpay");
const { ObjectId } = require("bson");
const productModal = require("../models/productModel");
const {createRazorpayOrder,verifyPayment} = require("../helpers/razorPayHelper");
var instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
const verfyUserPaymentOption = async (req, res) => {
  try {
    const id = req.params.id;
    const { selectedAddressId, paymentMethod,couponCodeValue } = req.body;
    const user = await userModel.findById(id);
    const userCart = await CartModel.findById(id).populate("cart.product_id");
    const address = await userModel.findOne(
      { _id: id, "addresses._id": selectedAddressId },
      { "addresses.$": 1 }
    );
    const coupon = await couponModal.findOne({code:couponCodeValue});

    if(coupon !== null){
    const updateCoupon = await couponModal.findByIdAndUpdate(
      { 
        _id: coupon._id, 
        'usedUsers.user_id': { $ne: new ObjectId(id) } // Ensure the user is not already in the array
      },
      { 
        $addToSet: { 'usedUsers': { user_id: new ObjectId(id) } } 
      },
      { new: true }
    );
    }
    
    const selectedAddress = address.addresses[0];
    const referredUser = await userModel.findById(user.referredBy).populate('referredBy');
    const previousPurchaseCount = user.referredPurchases;
    await userModel.findByIdAndUpdate({_id:id},{$inc:{referredPurchases:-1}});

    if (referredUser && !referredUser.referredBy && user.referredPurchases <=5 ) {
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
    } else if(paymentMethod && paymentMethod === 'online'){
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

      
    }else if(paymentMethod && paymentMethod=== 'wallet'){

      const balance = user.wallet.balance;
      const totalPurchaseAmout = userCart.total_price;

      if(balance>totalPurchaseAmout){
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
      const updatedUser = await userModel.findOneAndUpdate(
        { _id: id },
        {
          $inc: { 'wallet.balance': -totalPurchaseAmout}, // Subtract totalAmount from the balance
          $push: {
            'wallet.transactions': {
              type: 'debit',
              amount: totalPurchaseAmout,
              timestamp: Date.now().toString(),
              description: 'Amount paid successfully for your order',
            },
          },
        },
        { new: true } // Return the updated document
      );

      
      res.status(200).json({})
      }else{
        res.status(400).json({error:"Insufficent amount in your wallet"});
      }
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
    payment: paymentMethod === 'COD' ? false : paymentMethod === 'wallet' ? false : true,
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

    console.log("called add fund");

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

        console.log(order);
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
            description: 'Amount Added  successfully',
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
