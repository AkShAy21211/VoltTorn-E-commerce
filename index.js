require("dotenv").config();
const express = require("express");
const flash = require("express-flash");
const nocache = require("nocache");
const passport = require("passport");
const config = require("./config/config");
const session = require("express-session");
const morgan = require("morgan");
config.connectMongoose();



const PORT = process.env.PORT || 3000;
const app = express();
app.use(morgan("dev"));
app.use(nocache());

//session

const MongoSessionStore = require("connect-mongodb-session")(session);
const store = MongoSessionStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
});
app.set("view engine", "ejs");
app.set("views", "./views/user");
app.use(express.static(path.join(__dirname, 'public')));
const userSession = session({
  secret: config.userSessionSecreat,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
  name: "userSession", // Set a unique name for user sessions
});

const adminSession = session({
  secret: config.adminSessionSecret,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
  },
  name: "adminSession", // Set a unique name for admin sessions
});

app.use(userSession);
app.use(adminSession);

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.url.startsWith("/admin")) {
    res.locals.adminSessionData = req.session.admin;
  } else {
    res.locals.userSessionData = req.session.user;
  }
  next();
});

app.use(flash());

// FOR USER ROUTE
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

// FOR ADMIN ROUTE
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

app.use((req, res) => {
  res.status(404).render("error"); // Assuming 'user/error' is your error page
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
