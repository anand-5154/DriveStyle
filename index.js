const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const userRoutes = require("./Routes/userRoutes.js");
const adminRoutes = require("./Routes/adminRoutes.js");
const morgan= require('morgan')
require("dotenv").config();
const passport = require('passport');

const port = process.env.PORT || 3000;



const connectToMongoDB = require("./config/mongooseConnect.js");
connectToMongoDB();



app.use(morgan('dev'))



const nocache = require("nocache");
app.use(nocache());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "my secret",
  })
);



////////////////////////////////////

// Import Google strategy configuration
require('./passportConfig.js');  // Ensure correct path to your passport.js file
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth routes
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/loginpage" }),
  (req, res) => {
    // Ensure the user is stored in the session
    req.session.user = {
      _id: req.user._id, // `_id` from the logged-in user
      username: req.user.username,
      email: req.user.email,
    };

    req.session.currentUser = {
      _id: req.user._id, // `_id` from the logged-in user
      username: req.user.username,
      email: req.user.email,
    };

    // login
const verifyLogin = async (req, res) => {
  try {
    console.log("loginakkum");

    const checking = await userCollection.findOne({ email: req.body.email });
    const cartData = await cartCollection
      .find({ userId: req.session?.currentUser?._id })
      .populate("productId");

    if (checking) {
      if (checking.block === false) {
        if (checking.password === req.body.password) {
          if (checking.admin === 1) {
            req.session.admin = true;
            res.redirect("/adminHome");
          } else {
            req.session.user = checking;
            req.session.currentUser = checking;
            res.render("userViews/landingpage", {
              user: req.session.user,
              currentUser: req.session.currentUser,
              cartData,
              message: null, // No message to display
            });
          }
          console.log("login Successful");
          console.log(req.session.currentUser);
        } else {
          res.redirect("/loginpage?message=Password%20Incorrect");
          console.log("wrong password");
        }
      } else {
        res.redirect("/loginpage?message=Account%20Blocked");
        console.log("Account Blocked");
      }
    } else {
      res.redirect("/loginpage?message=Username%20Incorrect");
      console.log("Username Incorrect");
    }
  } catch (error) {
    console.log(error);
  }
};


    console.log("Session after Google Login:", req.session.user); // Debugging
    res.redirect("/"); // Redirect after login
  }
);

/////////////////


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRoutes);
app.use(adminRoutes);

app.use("/*", async (req, res) => {
  try {
    // const cartData = await cartCollection
    //   .find({ userId: req.session?.currentUser?._id })
    //   .populate('productId');

    res.render("userViews/errorPage", { signIn: req.session.signIn, user: req.session.user });
  } catch (error) {
    console.error("Error occurred while fetching cart data:", error);
   
  }
});


app.listen(port, () => {
  console.log("listening to server on http://localhost:3000");
});
