const express = require("express"),
  router = express.Router(),
  passport = require("passport");


// Users Helper Functions for routes
const {
  home,
  signUp,
  login,
  forgotPassword,
  resetTokenCheck,
  resetPassword,
  deleteUser,
  checkUserStatus,
} = require("../../helpers/users");

// JWT Passport Middleware - Token Authentication/Validation
const auth = passport.authenticate("jwt", { session: false });

// Route: GET
// Description: Test route for protected routes
// Access: PUBLIC
router.get("/", home);

// Route: POST /api/users/signup
// Description: User sign-up route
// Access: PUBLIC
router.post("/signup", signUp);

// Route: POST /api/users/login
// Description: User log-in route
// Acces: PUBLIC
router.post("/login", login);

// Route: /api/users/forgot
// Description: Forgot user password route
// Access: PUBLIC
router.post("/forgot", forgotPassword);

// Route: /api/users/reset/:token
// Description: Checks if reset token is valid.
// Access: PUBLIC
router.get("/reset/:token", resetTokenCheck);

// Route: /api/users/reset/:token
// Description: Reset Password page with form submission
// Access: PUBLIC
router.post("/reset/:token", resetPassword);

// Route: /api/users/remove/:id
// Description: Removes all of users information from the database
// Access: PRIVATE
router.delete("/remove/:id", auth, deleteUser);

// Route: /api/users/status
// Description: Checks if user has token validation and is in the database.
// Access: PRIVATE
router.get("/status", auth, checkUserStatus);

module.exports = router;
