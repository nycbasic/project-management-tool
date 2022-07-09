const bcrypt = require("bcryptjs"),
  jwt = require("jsonwebtoken"),
  gravatar = require("gravatar");

// Users Model
const Users = require("../../../models/Users");

const userSignUpSetup = (data) => {
  const { fullName, email, password } = data;
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

  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(password, salt);

  newUser.password.current = hash;
  newUser.password.previous.push(hash);

  return newUser;
};

const createJWT = (payload, secret) => {
  jwt.sign(payload, secret, { expires: 3600 }, (err, token) => {
    if (err) {
      console.log("FROM CREATEJWT ERROR HANDLER")
      return err;
    }
    return token;
  });
};

module.exports = { userSignUpSetup, createJWT };
