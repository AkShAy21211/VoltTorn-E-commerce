const productModel = require("../models/productModel");
const userModel = require("../models/userModel");
const {WishListModel} = require("../models/cart&WishlistModel");
const offerModal = require("../models/offerModal");
const reviewModal = require("../models/reviewModel");

//USER SETTINGS PAGE

const loadUserSettings = async (req, res) => {
  try {
    const id =
      req.session.user && req.session.user.userId
        ? req.session.user.userId
        : undefined;
        const referralOffer = await offerModal.findOne({offerType:"Referral"})||undefined;

    if (id) {
      const user = await userModel.findById(id);
      res.render("settings", { user,referralOffer });
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


const deleteUserAddress = async(req,res)=>{
  try{

    const id = req.session.user.userId;
    const address_id = req.params.address_id;
    console.log(id," ",address_id);

    if(id && address_id){

      await userModel.findByIdAndUpdate({_id:id},{$pull:{addresses:{_id:address_id}}});
    }
    res.redirect("/home/settings/profile");

  }catch(error){
    console.error(error);
  }
}

const loadOderManagment = async (req, res) => {
  try {
    const user = await userModel.find({ is_admin: false });
    const oders = user.flatMap((user) => user.oders);
    const oderCount = oders.length;
    const oderedCustomers = oders.map((oders) => oders.customerName);
    const customers = oderedCustomers.length;

    console.log(oders);
    res.render("oders", { oders, oderCount, customers });
  } catch (error) {
    console.error(error);
  }
};

const loadUserOdersPage = async (req, res) => {
  try {
    const id =
      req.session.user && req.session.user.userId
        ? req.session.user.userId
        : undefined;
    const oders = (await userModel.find({ _id: id }, { oders: 1 })).flatMap(
      (oders) => oders.oders
    );

    res.render("oders", { oders });
  } catch (error) {
    console.error(error);
  }
};
const forCancelUserOders = async (req, res) => {
  try {
    const id = req.session.user && req.session.user.userId ? req.session.user.userId : undefined;
    const { oder_id, product_id, oder_index, product_index } = req.params;
    const product = await productModel.findById(product_id);

    console.log(product);

    if (product) {
      console.log('ID:', id);
      console.log('Order ID:', oder_id);
      console.log('Product ID:', product_id);

      const userOder = await userModel.updateOne(
        {
          "_id": id,
          "oders.order_id": oder_id,
          "oders.products.product_id": product._id
        },
        {
          $set: {
            "oders.$.products.$[product].cancelled": true,
          },
        },
        {
          arrayFilters: [{"product.product_id": product._id}],
        }
      );
      
      // Log the updated userOder
      console.log('Updated userOrder:', userOder);
      
      // Redirect to the specified route
      res.redirect('/home/settings/oders');
      
    } else {
      res.json({ success: false, message: 'Invalid order ID' });
    }
  } catch (error) {
    console.error('Error in updating products.cancelled:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



const userWishlistLoad = async(req,res)=>{

  try{
    const id = req.session.user.userId;
    const products = await WishListModel.findById(id)

    res.render('wishLists',{products});

  }catch(error){
    console.error(error);
  }
}
const userWishlistLoadProductAdd = async (req, res) => {
  try {
    const id = req.params.product_id;
    const user_id = req.session.user?req.session.user.userId:undefined;
    const product = await productModel.findById(id);
    const existingWishlist = await WishListModel.findById(user_id);
    const existingProduct = await WishListModel.findOne({ _id: user_id, product:product });

    if(user_id){ 
    if (existingWishlist) {
      if (existingProduct) {
        res.status(200).json({ success: "Product already added to wishlist" });
      }else{
     
        existingWishlist.product.push(product);
        await existingWishlist.save();
        res.status(200).json({ success: "Product added to wishlist" });
      }
    
    } else {
      const wishlist = new WishListModel({
        _id: user_id,
        product: [product],
      });

      await wishlist.save();
      res.status(200).json({ success: "Product added to wishlist" });

    }
  }else{
    res.status(400).json({ error: "You need to login to proceed"})

  }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const removeWishlistsItems = async(req,res)=>{

  try{

    const index = req.params.index;
    const user_id = req.session.user?req.session.user.userId:undefined;
    if(user_id){
      const wishlist = await WishListModel.findById(user_id);

      if(wishlist && wishlist.product.length > 0){

        wishlist.product.splice(index, 1);
        await wishlist.save();
        res.redirect('/home/settings/wishlist')

      }

    }else{
      res.status(403).json({ success: false, message: 'User not authenticated' });

    }


  }catch(error){
    console.error(error);
  }
}


const loadUserReviews = async(req,res)=>{

  try{

    const userId = req.session.user?req.session.user.userId:undefined;
    const reviews = await reviewModal.find({user:userId}).populate('user').populate('product');
    res.render('ratings',{reviews});


  }catch(error){
    console.error(error);
  }
}



const addProductReview = async(req,res)=>{

  try{
    const {rating,review,product} = req.query;
    const userId = req.session.user?req.session.user.userId:undefined;
    const reviewData  =  new reviewModal({

      user:userId,
      product:product,
      review:review,
      rating:rating,
      
    });

    await reviewData.save();

    res.status(200).json({reviewData})

  }catch(error){
    console.error(error);
  }
}

const deleteUserReviews = async(req,res)=>{

  try{

    const {id} = req.params;
    const reviews = await reviewModal.findByIdAndDelete(id);
    res.redirect('/home/settings/reviews');



  }catch(error){
    console.error(error);
  }
}

module.exports = {
  loadUserSettings,
  editUserProfile,
  loadOderManagment,
  loadUserOdersPage,
  forCancelUserOders,
  deleteUserAddress,
  userWishlistLoad,
  userWishlistLoadProductAdd,
  removeWishlistsItems,
  addProductReview,
  loadUserReviews,
  deleteUserReviews,
};
