// Import validation schemas from utilities
const {schemas: validationSchemas} = require('../utilities/validation');

// Middleware function that tests the validity of a body given a specified schema
module.exports = async (req, res, next, schema) => {
  /**
   * @name validation
   * @description Middleware that tests the validity of a body given a specified schema
   */
  try {
    // Extract the request body
    const {body} = req;

    // Validate the request body using the specified schema
    await validationSchemas[schema].validate(body);

    // Call the next middleware function
    next();
  } catch (err) {
    // If there is an error, call the error handling middleware function
    next({
      message: `Validation Error: ${err.errors[0]}`,
      status: 400
    });
  }
};
