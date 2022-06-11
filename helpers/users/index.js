// Validation
const {
  validateSignUpInput,
  validateLoginInput,
  validateResetInput,
  validatePasswordResetInput,
} = require("../../validation/auth");

const home = (req, res) => {
  return res.json({
    message: "Connected to Authentication API!",
  });
};

const signUp = (req, res) => {
  const { errors, isValid } = validateSignUpInput(req.body);

  //   Validation Check
  if (!isValid) {
    return res.status(400).json(errors);
  }

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

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return res.send(err);
        }
        bcrypt.hash(newUser.password.current, salt, (err, hash) => {
          if (err) {
            return res.send(err);
          }
          passwordfailCount = 0;
          newUser.password.current = hash;
          newUser.password.previous.push(hash);

          newUser
            .save()
            .then((user) => {
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
      errors.email = "User already exists!";
      return res.status(400).json(errors);
    }
  });
};

module.exports = { home, signUp };
