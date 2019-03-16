const isEmpty = require("../helpers/is-empty");

module.exports = function validateRandomAlerts(data) {
  let alert = {};

  if (!data) {
    alert.message = "ID does not exist";
  }

  if ((typeof data !== "boolean" && data.length < 1) || data.todos.length < 1) {
    alert.first_message = "No data to display!";
    alert.second_message = "No data to delete!";
  }

  return {
    alert,
    noAlert: isEmpty(alert)
  };
};
