const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt            = require('jsonwebtoken');
const User           = require('../models/User');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(u => done(null, u))
    .catch(err => done(err, null));
});

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 1) Try to find by googleId
    let user = await User.findOne({ googleId: profile.id });

    // 2) If not found by googleId, try to find by email
    if (!user) {
      const email = profile.emails[0].value;
      user = await User.findOne({ email });

      if (user) {
        // Attach googleId to existing local user
        user.googleId = profile.id;
        await user.save();
      }
    }

    // 3) If still no user, create brand‐new
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        name:      profile.displayName,
        email:     profile.emails[0].value,
      });
    }

    return done(null, user);
  } catch (err) {
    console.error('GoogleStrategy error:', err);
    return done(err, null);
  }
}));
