const bcrypt = require("bcryptjs");

// Users Model
const Users = require("../../models/Users");

const userSignUpSetup = () => {
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

module.exports = userSignUpSetup;
