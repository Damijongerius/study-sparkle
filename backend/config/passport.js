const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, UserData } = require('../models');
const { generateUniqueFriendCode } = require('../utils/friendCode');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // If not, create a new user based on Google profile
          const username = profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Math.floor(Math.random() * 1000);
          const friendCode = await generateUniqueFriendCode();

          user = new User({
            googleId: profile.id,
            username,
            friendCode,
          });

          await user.save();

          // Initialize user data
          const userData = new UserData({
            userId: user._id,
            plans: [],
            stickerCards: [
              {
                name: 'Starter Card',
                slots: 9,
                status: 'in-progress',
              },
            ],
          });
          await userData.save();

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️ Google OAuth credentials missing. Google Login will not be available.');
}

// We're using custom session management in the existing auth middleware, 
// but Passport expects these for some internal flows.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
