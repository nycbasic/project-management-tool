const validator = require("validator"),
  isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};
  let { email, password } = data;

  email = !isEmpty(email) ? email : "";
  password = !isEmpty(password) ? password : "";

  if (!validator.isEmail(email)) {
    errors.email = "Please enter in a valid email address!";
  }
  if (validator.isEmpty(email)) {
    errors.email = "Please enter in your email address!";
  }
  if (!validator.isLength(password, { min: 8, max: 16 })) {
    errors.password = "Password must be between 8 and 16 characters!";
  }
  if (validator.isEmpty(password)) {
    errors.password = "Please enter your password!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
