const bcrypt = require("bcryptjs"),
  gravatar = require("gravatar"),
  jwt = require("jsonwebtoken"),
  passport = require("passport"),
  async = require("async"),
  nodemailer = require("nodemailer"),
  crypto = require("crypto");

// Validation
const {
  validateSignUpInput,
  validateLoginInput,
  validateResetInput,
  validatePasswordResetInput,
} = require("../../validation/auth");

// Users Model
const Users = require("../../models/Users");
// Password fail counter
let passwordfailCount = 0;

// Route: GET /api/users
const home = (req, res) => {
  return res.json({
    message: "Connected to Authentication API!",
  });
};

// Route: POST /api/users/signup
const signUp = (req, res) => {
  const { errors, isValid } = validateSignUpInput(req.body);

  // Validation Check
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // MongoDB Database Query: findOne
  Users.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      const { fullName, email, password } = req.body;
      const avatar = gravatar.url(email, {
        size: "200",
        rating: "pg",
        default: "mm",
      });

      const newUser = new Users({
        fullName,
        email,
        avatar,
        password: {
          current: password,
          status: true,
        },
      });

      // Salt Password
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return res.send(err);
        }

        // Hash & Salt Password
        bcrypt.hash(newUser.password.current, salt, (err, hash) => {
          if (err) {
            return res.send(err);
          }
          // Not sure why I put a password fail count here, *revist*
          passwordfailCount = 0;
          newUser.password.current = hash;
          newUser.password.previous.push(hash);

          // Saves the user credentials in the database
          newUser
            .save()
            .then((user) => {
              const { id, fullName, avatar } = user;

              const payload = {
                id,
                fullName,
                avatar,
              };

              // Creates a signed JWT token & sends it back to the client
              jwt.sign(
                payload,
                process.env.SECRET,
                { expiresIn: 3600 },
                (err, token) => {
                  if (err) {
                    return res.status(400).send(err.response.data);
                  }
                  return res.json({
                    token: `Bearer ${token}`,
                    status: 200,
                  });
                }
              );
            })
            .catch((err) => {
              console.log(err);
              return res.json(err.respones.data);
            });
        });
      });
    } else {
      // Take a look at this
      errors.email = "User already exists!";
      return res.status(400).json(errors);
    }
  });
};

module.exports = { home, signUp };
