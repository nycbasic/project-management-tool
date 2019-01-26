const validator = require("validator"),
  isEmpty = require("./is-empty");

module.exports = function validatePasswordResetInput(data) {
  let errors = {};
  let { password, password2 } = data;

  password = !isEmpty(password) ? password : "";
  password2 = !isEmpty(password2) ? password2 : "";

  if (!validator.isLength(password, { min: 8, max: 16 })) {
    errors.password = "Password must be between 8 and 16 characters!";
  }
  if (
    !password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
  ) {
    errors.password =
      "Password must contain at least 8 or more characters with a mix of letters, numbers & symbols";
  }
  if (validator.isEmpty(password)) {
    errors.password = "Please enter a password!";
  } else if (!validator.equals(password, password2)) {
    errors.password2 = "Password does not match!";
  }
  if (validator.isEmpty(password2)) {
    errors.password2 = "Please confirm your password!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
