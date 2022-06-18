const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;

const mongoose = require("mongoose"),
  Users = mongoose.model("Users");

const token = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET
};

module.exports = passport => {
  passport.use(
    new JwtStrategy(token, (payload, done) => {
      Users.findById(payload.id)
        .then(user => {
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch(err => {
          return err;
        });
    })
  );
};
