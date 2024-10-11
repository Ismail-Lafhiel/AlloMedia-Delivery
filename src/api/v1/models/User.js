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
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [
      /^\+?[1-9]\d{1,14}$/,
      "Phone number must be valid and in international format",
    ],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  emailConfirmed: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lastLoginAttempt: { type: Date },
  resetConfirmationCode: { type: String },
  resetCodeExpires: { type: Date },
  lockoutUntil: { type: Date, default: null },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
