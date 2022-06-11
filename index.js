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
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log("mongoDB-Atlas Connected!");
  })
  .catch((err) => {
    console.log(err);
  });

// API Routes
const Users = require("./routes/api/users");
const Todos = require("./routes/api/todos");

// Passport - Middleware Authentication
app.use(passport.initialize());
require("./config/passport")(passport);

// Start-up Dependencies - Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// End Points
app.use("/api/projects", Todos);
app.use("/api/users", Users);

app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
