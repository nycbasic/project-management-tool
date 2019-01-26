const validator = require("validator"),
  isEmpty = require("./is-empty");

module.exports = function validateResetInput(data) {
  let errors = {};
  let { email } = data;

  email = !isEmpty(email) ? email : "";

  if (!validator.isEmail(email)) {
    errors.email = "Please enter in a valid email address!";
  }
  if (validator.isEmpty(email)) {
    errors.email = "Please enter in your email address!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
