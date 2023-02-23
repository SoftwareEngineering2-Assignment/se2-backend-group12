/* eslint-disable func-names */

const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const {constants: {expires}} = require('../utilities/validation');

// Define the schema for the reset tokens
const ResetSchema = new mongoose.Schema({
  // Username is required and unique, and is stored in lowercase for case-insensitive comparisons
  username: {
    index: true,
    type: String,
    required: true,
    unique: 'A token already exists for that username!',
    lowercase: true
  },
  // The reset token itself, required
  token: {
    type: String,
    required: true
  },
  // The expiration date for the token, defaults to current date and time and is indexed to allow automatic expiration
  expireAt: {
    type: Date,
    default: Date.now,
    index: {expires},
  },
});

// Plugin for Mongoose that turns duplicate errors into regular Mongoose validation errors.
ResetSchema.plugin(beautifyUnique);

// Set the Mongoose pluralization rules
mongoose.pluralize(null);

// Export the Mongoose model for the reset tokens
module.exports = mongoose.model('reset-tokens', ResetSchema);
