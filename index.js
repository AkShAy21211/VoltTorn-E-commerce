const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/VOLTTRON");
const express = require("express");
const app = express();
const dotenc = require("dotenv").config();
const nocache = require('nocache');
const PORT = 3000;
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(nocache())
const Razorpay = require("razorpay");

//session
const config = require("./config/config");
const session = require("express-session");
const MongoSessionStore = require("connect-mongodb-session")(session);
const store = MongoSessionStore({
  uri:'mongodb://127.0.0.1:27017/VOLTTRON',
  collection:'sessions'
})

const userSession = session({
  secret: config.userSessionSecreat,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
  name: 'userSession', // Set a unique name for user sessions
});

const adminSession = session({
  secret: config.adminSessionSecret,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
  name: 'adminSession', // Set a unique name for admin sessions
});

app.use(userSession);
app.use(adminSession);

app.use((req, res, next) => {
  if (req.url.startsWith("/admin")) {
    res.locals.adminSessionData = req.session.admin;
  } else {
    res.locals.userSessionData = req.session.user;
  }
  next();
});

// FOR USER ROUTE
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

// FOR ADMIN ROUTE
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
