const validator = require("validator"),
  isEmpty = require("../helpers/is-empty");

exports.validateProjectNameInput = function validateProjectNameInput(data) {
  let errors = {};
  let { name } = data;

  name = !isEmpty(name) ? name : "";

  if (validator.isEmpty(name)) {
    errors.name = "Please enter a project name";
  } else if (!validator.isLength(name, { min: 4 })) {
    errors.name = "Project name must have atleast 4 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

exports.validateTaskInputs = function validateTaskInputs(data) {
  let errors = {};
  let { title, text } = data;

  title = !isEmpty(title) ? title : "";
  text = !isEmpty(text) ? text : "";

  if (validator.isEmpty(title)) {
    errors.title = "Please enter a title";
  } else if (!validator.isLength(title, { min: 4 })) {
    errors.title = "Title must have atleast 4 characters";
  }

  if (validator.isEmpty(text)) {
    errors.text = "Please enter in a description of task";
  } else if (!validator.isLength(text, { min: 8 })) {
    errors.text = "Task description must have atleast 8 characters";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
