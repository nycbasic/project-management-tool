const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    current: {
      type: String,
      required: true,
      unique: true
    },
    previous: [],
    count: { type: Number },
    resetted: { type: Boolean }
  },
  avatar: {
    type: String
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
