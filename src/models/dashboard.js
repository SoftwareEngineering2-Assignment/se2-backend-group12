const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const {passwordDigest, comparePassword} = require('../utilities/authentication/helpers');

// Mongoose does not automatically pluralize collection names.
mongoose.pluralize(null);

// Define the schema for the Dashboard object.
const DashboardSchema = new mongoose.Schema({
  name: {
    index: true, // create an index for this field for faster search
    type: String,
    required: [true, 'Dashboard name is required']
  },
  layout: {
    type: Array,
    default: []
  },
  items: {
    type: Object,
    default: {}
  },
  nextId: {
    type: Number,
    min: 1,
    default: 1
  },
  password: {
    type: String,
    select: false, // prevent this field from being selected by default
    default: null
  },
  shared: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // reference the User schema
  },
  createdAt: {type: Date}
});

// Plugin for Mongoose that turns duplicate errors into regular Mongoose validation errors.
DashboardSchema.plugin(beautifyUnique);

// Pre-save hook that hashes passwords and sets the creation date.
DashboardSchema.pre('save', function (next) {
  if (this.isModified('password')) {
    this.password = passwordDigest(this.password);
  }
  if (this.isModified('name')) {
    this.createdAt = Date.now();
  }
  return next();
});

// Model method that compares hashed passwords.
DashboardSchema.methods.comparePassword = function (password) {
  return comparePassword(password, this.password);
};

// Export the Dashboard schema as a Mongoose model.
module.exports = mongoose.model('dashboards', DashboardSchema);
