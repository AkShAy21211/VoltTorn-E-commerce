const is_Login = async (req, res, next) => {
    try {
        if (req.session.admin && req.session.admin.isAdminAuthenticated) {
            // User is logged in, proceed to the next middleware or route handler
            next();
        } else {
            // User is not logged in, redirect to the admin login page
            res.redirect('/admin');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};
const is_Logout = async (req, res, next) => {
    try {
        if (!req.session.admin || !req.session.admin.isAdminAuthenticated) {
            // User is not logged in, proceed to the next middleware or route handler
            next();
        } else {
            // User is logged in, redirect to the admin dashboard
            res.redirect('/admin/dashboard');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};



module.exports = {
    is_Login,
    is_Logout
};
