const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "First name is required"],
    minlength: [3, "First name must be at least 3 characters long"],
    unique: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: [true, "Last name is required"],
    minlength: [3, "Last name must be at least 3 characters long"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Email is invalid"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  emailConfirmed: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lastLoginAttempt: { type: Date },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
