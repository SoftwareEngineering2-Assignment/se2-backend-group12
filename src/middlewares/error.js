/* eslint-disable no-console */
const {
  pipe,
  has,
  ifElse,
  assoc,
  identity,
  allPass,
  propEq
} = require('ramda');

const withFormatMessageForProduction = ifElse(
  // Check if the error status is 500 and NODE_ENV is production
  allPass([propEq('status', 500), () => process.env.NODE_ENV === 'production']),
  // If both conditions are true, set the error message to 'Internal server error occurred.'
  assoc('message', 'Internal server error occurred.'),
  identity
);

module.exports = (error, req, res, next) =>
  /**
   * @name error
   * @description Middleware that handles errors
   */
  pipe(
    // Add the 'message' property to the error object if it doesn't already exist
    (e) => ({...e, message: e.message}),
    // If the error object has a 'status' property, return it as is, otherwise set it to 500
    ifElse(has('status'), identity, assoc('status', 500)),
    // Format the error message for production if needed
    withFormatMessageForProduction,
    // Send the error response with the appropriate HTTP status code and the formatted error object
    (fError) => res.status(fError.status).json(fError)
  )(error);
