const bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken"),
  async = require("async"),
  nodemailer = require("nodemailer"),
  crypto = require("crypto");

// Hashing + Salt
const { userSignUpSetup, createJWT } = require("./userSignUpSetup");

// Users Model
const Users = require("../../../models/Users");

// Validation
const {
  validateSignUpInput,
  validateLoginInput,
  validateResetInput,
  validatePasswordResetInput,
} = require("../../../validation/users");

// Password fail counter
let passwordfailCount = 0;

// Route: GET /api/users
const home = (req, res) => {
  return res.json({
    message: "User Authentication API!",
  });
};

// Route: POST /api/users/signup
const signUp = (req, res) => {
  // Validation Check
  const { errors, isValid } = validateSignUpInput(req.body);
  const { fullName, password, password2, email } = req.body;

  if (!isValid) {
    return res.status(400).json(errors);
  }

  // MongoDB Database Query: findOne
  Users.findOne({ email }).then((user) => {
    if (!user) {
      // Reset passwordfail count;
      passwordfailCount = 0;
      // Salt + hash password and sets the user up to be saved in the database
      const newUser = userSignUpSetup({ fullName, password, password2, email });
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

          // Creates a signed JWT token & payload, sends it back to the client.
          const token = createJWT(payload, process.env.SECRET);
          if (token) {
            return res.json({
              token: `Bearer ${token}`,
              status: 200,
            });
          }
          return token;
        })
        .catch((err) => {
          return res.status(500).json(err);
        });
    } else {
      // Take a look at this
      errors.email = "User already exists!";
      return res.status(400).json(errors);
    }
  });
};

const login = (req, res) => {
  const { isValid, errors } = validateLoginInput(req.body);
  const { email, password } = req.body;

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Users.findOne({ email }).then((user) => {
    // Checks if the email is already registered
    if (!user) {
      errors.email = "Email not found or User does not exist!";
      return res.status(400).json(errors);
    } else {
      // Checks if the password matches
      bcrypt.compare(password, user.password.current).then((success) => {
        // Checks to see if a reset email has already been sent
        if (user.password.resetted) {
          res.json({
            msg: "You must reset your password!",
          });
          return false;
        } else if (!success) {
          // If a reset email has not been sent, checks to see if the password doesn't match and fails
          passwordfailCount++;
          if (passwordfailCount <= 1) {
            errors.password = "Password is invalid, please try again!";
          } else if (passwordfailCount <= 2) {
            errors.password =
              "Password is invalid, one more try before your password gets resetted!";
          } else {
            // if the password fails 3 times
            errors.password =
              "Your password has been reseted, please check your email to reset your password!";
            user.password.resetted = true;
            passwordfailCount = 0;
            user.save();

            // Email is sent with instructions on how to reset password
            async.waterfall([
              (done) => {
                crypto.randomBytes(20, (err, buf) => {
                  const token = buf.toString("hex");
                  done(err, token);
                });
              },
              (token, done) => {
                Users.findOne({ email })
                  .then((user) => {
                    if (!user) {
                      errors.email =
                        "No account with that email address exists!";
                      return res.status(400).json(errors);
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000;

                    user.save().then((user, err) => {
                      done(err, token, user);
                    });
                  })
                  .catch((err) => {
                    errors.email =
                      "Something went wrong! Please contact your administrator!";
                    return res.status(400).json(errors);
                  });
              },
              (token, user, done) => {
                const transporter = nodemailer.createTransport({
                  service: process.env.MAIL_SERVICE,
                  auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD,
                  },
                  tls: {
                    rejectUnauthorized: false,
                  },
                });

                const email = {
                  from: '"Password Reset" <password-reset@test.com>',
                  to: user.email,
                  subject: "Your Password Reset Confirmation",
                  text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'https://nycbasic.github.io/mini-auth/#/reset/${token}\n\n'
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n`,
                };

                transporter.sendMail(email, (err) => {
                  if (err) {
                    console.log(err);
                  }
                  return done(
                    err,
                    res.status(200).json({
                      msg: `Email has been sent to ${user.email} for your password reset`,
                    })
                  );
                });
              },
            ]);
          }
          res.status(400).json(errors);
        } else {
          // Logs user in and clear specific fields related to user tries
          user.password.resetted = false;
          user.password.status = true;
          passwordfailCount = 0;
          user.save();
          //   Assign JWT
          const { id, fullName, avatar } = user;
          const payload = {
            id,
            fullName,
            avatar,
          };

          jwt.sign(
            payload,
            process.env.SECRET,
            { expiresIn: 3600 },
            (err, token) => {
              if (err) {
                return res.status(400).json(err.response.data);
              }
              return res.json({
                token: `Bearer ${token}`,
                status: 200,
              });
            }
          );
        }
      });
    }
  });
};

const forgotPassword = (req, res) => {
  const { isValid, errors } = validateResetInput(req.body);
  const { email } = req.body;

  if (!isValid) {
    return res.status(400).json(errors);
  }

  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString("hex");
        done(err, token);
      });
    },
    (token, done) => {
      Users.findOne({ email })
        .then((user) => {
          if (!user) {
            errors.email = "No account with that email address exists!";
            return res.status(400).json(errors);
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000;
          passwordfailCount = 0;

          user.save().then((user, err) => {
            done(err, token, user);
          });
        })
        .catch((err) => {
          errors.email =
            "Something went wrong! Please contact your administrator!";
          return res.status(400).json(errors);
        });
    },
    (token, user, done) => {
      const transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const email = {
        from: '"Password Reset" <password-reset@test.com>',
        to: user.email,
        subject: "Your Password Reset Confirmation",
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'https://nycbasic.github.io/mini-auth/#/reset/${token}\n\n'
        'If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      transporter.sendMail(email, (err) => {
        if (err) {
          console.log(err);
        }
        return done(
          err,
          res.status(200).json({
            msg: `Email has been sent to ${user.email} for your password reset`,
          })
        );
      });
    },
  ]);
};

const resetTokenCheck = (req, res) => {
  let errors = {};
  Users.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        errors.msg = "Password reset token is invalid or has expired.";
        errors.expiredToken = true;
        res.status(206).json(errors);
      } else {
        res.status(200).json({ validToken: true });
      }
    })
    .catch((err) => {
      throw err;
    });
};

const resetPassword = (req, res) => {
  const { errors, isValid } = validatePasswordResetInput(req.body);
  const { password } = req.body;
  if (!isValid) {
    return res.status(400).json(errors);
  }
  async.waterfall([
    (done) => {
      Users.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      }).then((user) => {
        const passwordExist = user.password.previous.some((value) => {
          return bcrypt.compareSync(password, value);
        });

        if (!user) {
          errors.msg = "Password reset token is invalid or has expired.";
          res.status(400).json(errors);
        } else if (passwordExist) {
          errors.password =
            "Password was previously used! Create another password!";
          return res.status(400).json(errors);
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            if (err) {
              return res.send(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
              if (err) {
                return res.send(err);
              }
              user.password.current = hash;
              user.password.previous.push(hash);
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
              user.password.resetted = undefined;
              user.save((err) => {
                done(err, user);
              });
            });
          });
        }
      });
    },
    (user, done) => {
      const transport = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      });
      const email = {
        to: user.email,
        from: '"Password Reset" <password-reset@test.com>',
        subject: "Your password has been changed",
        text:
          "Hello,\n\n" +
          "This is a confirmation that the password for your account " +
          user.email +
          " has just been changed.\n",
      };
      transport.sendMail(email, (err) => {
        errors.msg = "Success! Your password has been changed.";
        res.status(200).json(errors);
        done(err);
      });
    },
  ]);
};

const deleteUser = (req, res) => {
  Users.findOne({ _id: req.params.id }).then((user) => {
    if (!user) {
      res.status(400).json({
        msg: "User not found!",
      });
    }
    user.remove();
    res.status(200).json({
      msg: "You have been removed!",
    });
  });
};

const checkUserStatus = (req, res) => {
  if (req.user) {
    return res.status(200).json({
      success: true,
    });
  }
};

module.exports = {
  home,
  signUp,
  login,
  forgotPassword,
  resetTokenCheck,
  resetPassword,
  deleteUser,
  checkUserStatus,
};
