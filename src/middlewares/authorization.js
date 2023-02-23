const jwt = require('jsonwebtoken');
const {
  pathOr,
  compose,
  trim,
  split,
  last,
  isNil
} = require('ramda');

// Get the secret from environment variables
const secret = process.env.SERVER_SECRET;

// Extract the token from the request and return it
const getToken = compose(
  trim, // Trim any extra whitespace
  last, // Get the last element of the array
  split(' '), // Split the string into an array of strings using space as the separator
  pathOr('', ['headers', 'authorization']) // Extract the "authorization" header from the request and return an empty string if it's not present
);

// Verify the token using the jwt.verify function and return a promise
const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });

// Middleware that checks if a token is present in the request and if it's valid
const authorization = async (req, res, next) => {
  // Get the token from the request
  const token = getToken(req);
  // If the token is not present, return an error message
  if (isNil(token)) {
    return next({
      message: 'Authorization Error: token missing.',
      status: 403
    });
  }
  try {
    // Verify the token and extract the payload
    const decoded = await verifyToken(token);
    // Add the payload to the request object for later use
    req.decoded = decoded;
    // Call the next middleware function
    next();
  } catch (err) {
    // If the token is invalid, return an error message
    if (err.name === 'TokenExpiredError') {
      next({
        message: 'TokenExpiredError',
        status: 401
      });
    } else {
      next({
        message: 'Authorization Error: Failed to verify token.',
        status: 403
      });
    }
  }
};

// Export the authorization middleware function
module.exports = authorization;
