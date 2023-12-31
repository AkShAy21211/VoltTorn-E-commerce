const { ObjectId } = require("mongodb");
const { CartModel, WishListModel } = require("../models/cart&WishlistModel");
const productModel = require("../models/productModel");
const countryState = require("country-state-city");
const {calculateTotalDiscount} = require("../helpers/totalDiscountHelper");
const {generateOrderID} = require("../helpers/oderIdHelper");
const userModel = require("../models/userModel");
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
              name:product.name,
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


const deleteCartItem = async (req, res) => {
  try {
    const id = req.session.user.userId;
    const product_id = req.params.product_id;

    // Assuming CartModel has a 'cart' array and 'total_price' field
    const cart = await CartModel.findById(id);

    console.log("product id  ", product_id);

    const updatedCart = await CartModel.findOneAndUpdate(
      { _id: id },
      { $pull: { cart: { _id: product_id } } },
      { new: true } // Return the modified document
    );

    const total_price = updatedCart.cart.reduce((total, item) => total + item.price, 0);

    await CartModel.findOneAndUpdate({ _id: id }, { $set: { total_price: total_price } });

    console.log(updatedCart);
    const userCartCount =
    updatedCart && updatedCart.cart ? updatedCart.cart.length : 0;

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
      error: 'Internal Server Error',
    });
  }
};



const loadCheckOutPage = async(req,res)=>{

  try{
    const user = await userModel.findById(req.session.user.userId);
    const dataState = req.body.dataState;
    const states = countryState.State.getStatesOfCountry("IN");
    const cart = await CartModel.findById(req.session.user.userId);

   
    const total_discount = await calculateTotalDiscount(cart.cart); 

    res.render('checkout',{states,user,cart,total_discount});

  

  }catch(error){
    console.error(error);
  }
}

const stateCityLoad = async(req,res)=>{

  try{
    const dataState = req.body.dataState;
    const states = countryState.State.getStatesOfCountry("IN");
    const city = countryState.City.getCitiesOfState("IN",dataState).map(City=> City.name);

    res.status(200).json({
      success: true,
      city
    });
console.log(city);
  

  }catch(error){
    console.error(error);
  }
}



const addUserBellingAddress = async(req,res)=>{

  try{

 const  {address,country,state,city,postalCode} = req.body;

 const userAddress = {

  address:address,
  country:country,
  state:state,
  city:city,
  zip:postalCode,

 }
await userModel.findOneAndUpdate({_id:req.session.user.userId},{$push:{addresses:userAddress}});

res.redirect('/home/cart/checkout')
}catch(error){
    console.error(error);
  }
}



const editUserBillingAddress = async(req,res)=>{

  try{

 const  {address,country,state,city,postalCode} = req.body;
 const addressId = req.params.id;

 const userAddress = {
  address:address,
  country:country,
  state:state,
  city:city,
  zip:postalCode,
 }

 await userModel.findOneAndUpdate({'addresses._id':addressId},{$set:{addresses:userAddress}});
 res.redirect('/home/cart/checkout')
}catch(error){
    console.error(error);
  }
}



//compete cash on deliver methood payment and add producvt to user oders

const completeOderCashOnDelivery = async(req,res)=>{

  try{

    const id = req.params.id;

    console.log("ef ef fe fe f ef e fe fe f ef e fe  ",id);
    const user = await userModel.findById(id)

    console.log(user);
    const userCart = await CartModel.findById(id).populate('cart.product_id');

    console.log(userCart);
    
    if(userCart){
      const userOder  = {
        oder_id:generateOrderID(),
        customerName: user.first_name+" "+user.last_name,
        products: userCart.cart,
        date:Date.now().toString(),
        status:'Pending',
        totalAmount: userCart.total_price, 
      }
      const userOderAdd = await userModel.findOneAndUpdate({_id:id},{$push:{oders:userOder}});




      if(userOderAdd){

        await userCart.deleteOne({_id:id});

        res.redirect('/home/cart');

      }

    }else{

      console.log("no user found");
      res.redirect('/home/cart');

    }


  }catch(error){
    console.error(error);
  }
}



module.exports = {
  userShoppingCartPageLoad,
  userAddToCartButton,
  updateQuantity,
  deleteCartItem,
  loadCheckOutPage,
  addUserBellingAddress,
  stateCityLoad,
  editUserBillingAddress,
  completeOderCashOnDelivery,
};
