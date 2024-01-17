const session = require("express-session");
const userModel = require("../models/userModel");
const {CartModel, WishListModel} = require("../models/cart&WishlistModel");

const is_Login = async (req, res, next) => {
    try {
        if (req.session.user && req.session.user.isUserAuthenticated) {
            // User is logged in, proceed to the next middleware or route handler
            next();
        } else {
            // User is not logged in, redirect to the login page
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const is_Logout = async (req, res, next) => {
    try {
        if (!req.session.user || !req.session.user.isUserAuthenticated) {
            // User is logged in, proceed to the next middleware or route handler
            next();
        } else {
            // User is not logged in or already logged out, redirect to the home page
            res.redirect('/home');
        }
    } catch (error) {
       
    }
};
const isUserBlocked = async (req, res, next) => {
    try {
        // Check if the user is authenticated (logged in)
        if (req.session.user && req.session.user.userId && req.session.user.isUserAuthenticated) {
            const id = req.session.user.userId;
            const user = await userModel.findOne({ _id: id });

            if (user && user.status === true) {
                // User is not blocked, proceed to the next middleware or route handler
                next();
            } else {
                // Destroy the user's session
                delete req.session.user
                 
                
                        // Redirect to the login route after destroying the session
               res.redirect('/login');
                   
                
            }
        } else {
            // If the user is not logged in, allow access to home or related routes
            next();
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const in_cart = async(req,res,next)=>{

    try {
        const cart = await CartModel.findById(req.session.user.userId);
        if (req.session.user && cart) {
            next();
        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }

}


const cartCount = async (req, res, next) => {
    if (req.session && req.session.user) {
        try {
            const cart = await CartModel.findById(req.session.user.userId)||{};
            res.locals.cartCount = cart.cart?cart.cart.length:0;
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    } else {
        res.locals.cartCount = 0;
    }
    next();
};


const wishCount = async (req, res, next) => {
    if (req.session && req.session.user) {
        try {
            const wishlist = await WishListModel.findById(req.session.user.userId)||{};
            res.locals.wishCount = wishlist.product?wishlist.product.length:0;

            
        } catch (error) {
            console.error('Error fetching cart count:', error);
        }
    } else {
        res.locals.wishlist = 0;
    }
    next();
};
module.exports = {
    is_Login,
    is_Logout,
    isUserBlocked,
    in_cart,
    cartCount,
    wishCount
    
};
