const validator = require("validator"),
  isEmpty = require("../helpers/is-empty");

exports.validateSignUpInput = function validateSignUpInput(data) {
  let errors = {};
  let { fullName, email, password, password2 } = data;

  fullName = !isEmpty(fullName) ? fullName : "";
  email = !isEmpty(email) ? email : "";
  password = !isEmpty(password) ? password : "";
  password2 = !isEmpty(password2) ? password2 : "";

  if (!validator.isLength(fullName, { min: 3, max: 30 })) {
    errors.fullName = "Name must be between 3 and 30 charaters!";
  }
  if (validator.isEmpty(fullName)) {
    errors.fullName = "Name field is required!";
  }
  if (validator.isEmpty(email)) {
    errors.email = "Email field is required!";
  }
  if (!validator.isEmail(email)) {
    errors.email = "Please enter in a valid email address!";
  }
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
    errors.password = "Password does not match!";
  }
  if (validator.isEmpty(password2)) {
    errors.password2 = "Please confirm your password!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

exports.validateLoginInput = function validateLoginInput(data) {
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

exports.validateResetInput = function validateResetInput(data) {
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

exports.validatePasswordResetInput = function validatePasswordResetInput(data) {
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
