// Import middleware modules
const authorization = require('./authorization');
const error = require('./error');
const validation = require('./validation');

// Export middleware as an object
module.exports = {
  authorization,
  error,
  validation,
};
