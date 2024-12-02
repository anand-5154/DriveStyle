const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/userModels"); // Ensure this points to your correct User model

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const existingUser = await User.findOne({ email: profile.emails[0].value });
          if (existingUser) {
            existingUser.googleId = profile.id;
            user = await existingUser.save();
          } else {
            user = await User.create({
              username: profile.displayName,
              email: profile.emails[0].value,
              phonenumber: 9526735154, // Placeholder
              password: "null", // Placeholder
              admin: 0,
              block: false,
            });
          }
        }

        console.log("User from Google Login:", user); // Debugging
        return done(null, user); // Ensure `user` includes `_id`
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
      }
    }
  )
);


// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user._id); // Use `_id` to store in the session
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Find the user by `_id`
    if (user) {
      done(null, user); // Attach user object to `req.user`
    } else {
      done(new Error("User not found"), null);
    }
  } catch (err) {
    done(err, null);
  }
});
