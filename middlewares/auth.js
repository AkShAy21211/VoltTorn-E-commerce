
const session = require("express-session");

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


  


module.exports = {
    is_Login,
    is_Logout,
    
};
