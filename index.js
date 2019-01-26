const express = require("express"),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  passport = require("passport");
cors = require("cors");

require("dotenv").config();
const db = process.env.DB;

const app = express();
const PORT = process.env.PORT;

// Database
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("mongoDB-Atlas Connected!");
  })
  .catch(err => {
    console.log(err);
  });

// API - Routes
users = require("./routes/api/users");

// Passport - Middleware Authentication
app.use(passport.initialize());
require("./config/passport")(passport);

// Start-up Dependencies - Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//Routes
app.use("/api/users", users);

app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
