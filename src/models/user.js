/* eslint-disable func-names */ // Disable eslint rule for function names

const mongoose = require('mongoose'); // Import Mongoose library
const beautifyUnique = require('mongoose-beautiful-unique-validation'); // Import plugin for Mongoose

const {passwordDigest, comparePassword} = require('../utilities/authentication/helpers'); // Import functions for password authentication
const {constants: {min}} = require('../utilities/validation'); // Import validation constants

mongoose.pluralize(null); // Disable Mongoose's default pluralization

const UserSchema = new mongoose.Schema( // Define Mongoose schema for User model
  {
    email: { // Define email field
      index: true, // Create index for faster querying
      type: String,
      unique: 'A user already exists with that email!', // Unique constraint with custom error message
      required: [true, 'User email is required'], // Required field with custom error message
      lowercase: true // Convert email to lowercase
    },
    username: { // Define username field
      index: true, // Create index for faster querying
      type: String,
      unique: 'A user already exists with that username!', // Unique constraint with custom error message
      required: [true, 'Username is required'], // Required field with custom error message
    },
    password: { // Define password field
      type: String,
      required: [true, 'User password is required'], // Required field with custom error message
      select: false, // Exclude field from default queries
      minlength: min // Minimum length validation rule
    },
    registrationDate: {type: Number} // Define registrationDate field
  }
);

UserSchema.plugin(beautifyUnique); // Use plugin to turn duplicate errors into regular Mongoose validation errors

UserSchema.pre('save', function (next) { // Define pre-save hook to hash passwords and set registration date
  if (this.isModified('password')) { // Check if password has been modified
    this.password = passwordDigest(this.password); // Hash password
  }
  if (this.isModified('email') || this.isModified('username')) { // Check if email or username has been modified
    this.registrationDate = Date.now(); // Set registration date to current time
  }
  return next();
});

UserSchema.methods.comparePassword = function (password) { // Define model method to compare hashed passwords
  return comparePassword(password, this.password); // Compare provided password to hashed password
};

module.exports = mongoose.model('users', UserSchema); // Export User model schema with 'users' collection name.
