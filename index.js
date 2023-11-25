const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/VOLTTRON");
const express = require("express");
const app = express();
const PORT = 3000;
const morgan = require("morgan");

app.use(morgan("dev"));

//session
const config = require("./config/config");
const session = require("express-session");
const MongoSessionStore = require("connect-mongodb-session")(session);
const flash = require("express-flash")
const store = MongoSessionStore({
  uri:'mongodb://127.0.0.1:27017/VOLTTRON',
  collection:'sessions'
})


app.use(session({
  secret: config.SessionSecret,
  resave: false,
  saveUninitialized: false,
  store:store,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

app.use(flash())
app.use((req, res, next) => {
  console.log(req.session);
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
