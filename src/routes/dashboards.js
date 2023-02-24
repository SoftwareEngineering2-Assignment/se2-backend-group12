// Disable eslint rule for maximum line length
/* eslint-disable max-len */

// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');

// Import middleware for authorization
const {authorization} = require('../middlewares');

// Create an instance of the express router
const router = express.Router();

// Import required models
const Dashboard = require('../models/dashboard');
const Source = require('../models/source');

/**
 * Endpoint to retrieve all dashboards belonging to the authenticated user. This route handles a
 * GET request to retrieve all dashboards belonging to the authenticated user.
 * Authorization middleware is used to check if the user is authorized to access the endpoint.
 * An async function is used to handle the request and response objects.
 * The ID of the authenticated user is obtained from the JWT token.
 * The find() method is used to retrieve all dashboards belonging to the authenticated user using their ID.
 * The forEach() method is used to loop through each found dashboard and format the data to only
 * include the ID, name, and views count. The formatted dashboard data is returned in a JSON response
 * with a success boolean. Any errors caught are passed to the error-handling middleware.
 *
 * @name GET /dashboards
 * @function
 * @memberof module:routes/dashboard
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {object} The formatted dashboard data in a JSON response.
 * @throws {object} Any caught errors are passed to the error-handling middleware.
 *
 * @example
 * GET /dashboards
 */
router.get('/dashboards',
  // Middleware function to check if the user is authorized to access the endpoint
  authorization,
  // Async function to handle the request and response objects
  async (req, res, next) => {
    try {
      // Get the ID of the authenticated user from the JWT token
      const {id} = req.decoded;
      // Find all dashboards belonging to the authenticated user using their ID
      const foundDashboards = await Dashboard.find({owner: mongoose.Types.ObjectId(id)});
      // Create an empty array to store the formatted dashboard data
      const dashboards = [];
      // Loop through each found dashboard and format the data to only include the ID, name, and views count
      foundDashboards.forEach((s) => {
        dashboards.push({
          id: s._id,
          name: s.name,
          views: s.views
        });
      });

      // Return the formatted dashboard data in a JSON response
      return res.json({
        success: true,
        dashboards
      });
    } catch (err) {
      // Pass any caught errors to the error-handling middleware
      return next(err.body);
    }
  });

/**
 * Endpoint to create a dashboard. The route creates a new dashboard for the user.
 * It requires the user to be authenticated, so it checks the authorization first.
 * It then checks if a dashboard with the same name already exists.
 * If the dashboard does not exist, it creates a new dashboard with an empty layout, no items,
 * a next id of 1, and the owner id. Finally, it sends a success response to the user.
 *
 * @route POST /create-dashboard
 * @description Creates a new dashboard for the user
 * @access Private
 * @param {string} name - The name of the dashboard to create
 * @returns {JSON} Returns a success status if the dashboard is created successfully, otherwise returns an error message.
 */
router.post('/create-dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const {name} = req.body;
      const {id} = req.decoded;
      const foundDashboard = await Dashboard.findOne({
        owner: mongoose.Types.ObjectId(id),
        name
      });
      if (foundDashboard) {
        return res.json({
          status: 409,
          message: 'A dashboard with that name already exists.'
        });
      }
      await new Dashboard({
        name,
        layout: [],
        items: {},
        nextId: 1,
        owner: mongoose.Types.ObjectId(id)
      }).save();

      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  });

/**
 * Endpoint to delete a dashboard. This code defines a route for deleting a dashboard.
 * The route requires the user to be authorized before executing the async function.
 * The function extracts the ID of the dashboard to be deleted from the request body,
 * finds and deletes the dashboard with the specified ID and owned by the authenticated user.
 * If the dashboard was not found, it returns an error response.
 * If the dashboard was successfully deleted, it returns a success response.
 * Any errors caught during the process are passed to the error-handling middleware.
 *
 * @route POST /delete-dashboard
 * @param {Object} req - The request object
 * @param {Object} req.body - The request body containing the ID of the dashboard to be deleted
 * @param {Object} req.decoded - The decoded JWT token containing the ID of the authenticated user
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Object} A JSON object indicating the success of the operation
 * @throws {Error} If an error occurs while processing the request
 */
router.post('/delete-dashboard',
// Middleware function to check if the user is authorized to access the endpoint
  authorization,
  // Async function to handle the request and response objects
  async (req, res, next) => {
    try {
      // Extract the ID of the dashboard to be deleted from the request body
      const {id} = req.body;
      // Find and delete the dashboard with the specified ID and owned by the authenticated user
      const foundDashboard = await Dashboard.findOneAndRemove({
        _id: mongoose.Types.ObjectId(id),
        owner: mongoose.Types.ObjectId(req.decoded.id)
      });
      // If no dashboard was found matching the specified ID and owner, return an error response
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }
      // If the dashboard was successfully deleted, return a success response
      return res.json({success: true});
    } catch (err) {
      // Pass any caught errors to the error-handling middleware
      return next(err.body);
    }
  });

/**
 Retrieves the specified dashboard and associated sources for the authenticated user.

 @param {Object} req - The HTTP request object.
 @param {Object} res - The HTTP response object.
 @param {function} next - The next middleware function to call.
 @returns {Object} A JSON response with the formatted dashboard and sources data.
 @throws {Object} An error response if the specified dashboard is not found.
 */
router.get('/dashboard',
// Middleware function to check if the user is authorized to access the endpoint
  authorization,
  // Async function to handle the request and response objects
  async (req, res, next) => {
    try {
      // Extract the ID of the dashboard to be retrieved from the request query parameters
      const {id} = req.query;

      // Find the dashboard with the specified ID and owned by the authenticated user
      const foundDashboard = await Dashboard.findOne({
        _id: mongoose.Types.ObjectId(id),
        owner: mongoose.Types.ObjectId(req.decoded.id)
      });

      // If no dashboard was found matching the specified ID and owner, return an error response
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }

      // Format the retrieved dashboard data to include only the ID, name, layout, items, and nextId
      const dashboard = {
        id: foundDashboard._id,
        name: foundDashboard.name,
        layout: foundDashboard.layout,
        items: foundDashboard.items,
        nextId: foundDashboard.nextId
      };

      // Find all sources belonging to the authenticated user and format the data to only include the name
      const foundSources = await Source.find({owner: mongoose.Types.ObjectId(req.decoded.id)});
      const sources = foundSources.map((s) => s.name);

      // Return the formatted dashboard and sources data in a JSON response
      return res.json({
        success: true,
        dashboard,
        sources
      });
    } catch (err) {
      // Pass any caught errors to the error-handling middleware
      return next(err.body);
    }
  });

/**
 * Saves a dashboard layout and items for an authenticated user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next function in the middleware chain.
 * @return {Object} - The JSON response containing the success status.
 * @throws {Object} - The error object to be handled by the error-handling middleware.
 */
router.post('/save-dashboard', authorization, async (req, res, next) => {
  try {
    // Extract the ID, layout, items, and nextId from the request body
    const {
      id,
      layout,
      items,
      nextId
    } = req.body;

    // Find the dashboard with the specified ID and owned by the authenticated user,
    // and update its layout, items, and nextId
    const result = await Dashboard.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(id),
      owner: mongoose.Types.ObjectId(req.decoded.id)
    }, {
      $set: {
        layout,
        items,
        nextId
      }
    }, {new: true});

    // If no dashboard was found matching the specified ID and owner, return an error response
    if (result === null) {
      return res.json({
        status: 409,
        message: 'The selected dashboard has not been found.'
      });
    }

    // Return a success JSON response
    return res.json({success: true});
  } catch (err) {
    // Pass any caught errors to the error-handling middleware
    return next(err.body);
  }
});

/**
 * Clone a dashboard with a new name.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.dashboardId - The ID of the dashboard to clone.
 * @param {string} req.body.name - The new name for the cloned dashboard.
 * @param {Object} res - The HTTP response object.
 * @param {Object} next - The next middleware function.
 * @returns {Object} The HTTP response.
 */
router.post('/clone-dashboard', authorization, async (req, res, next) => {
  try {
    // Extract dashboard ID and new name from request body
    const {
      dashboardId,
      name
    } = req.body;

    // Check if a dashboard with the new name already exists for the authenticated user
    const foundDashboard = await Dashboard.findOne({
      owner: mongoose.Types.ObjectId(req.decoded.id),
      name,
    });
    if (foundDashboard) {
      return res.json({
        status: 409,
        message: 'A dashboard with that name already exists.',
      });
    }

    // Find the dashboard to clone and ensure it is owned by the authenticated user
    const oldDashboard = await Dashboard.findOne({
      _id: mongoose.Types.ObjectId(dashboardId),
      owner: mongoose.Types.ObjectId(req.decoded.id),
    });

    // Create a new dashboard with the specified name and properties of the cloned dashboard
    await new Dashboard({
      name,
      layout: oldDashboard.layout,
      items: oldDashboard.items,
      nextId: oldDashboard.nextId,
      owner: mongoose.Types.ObjectId(req.decoded.id),
    }).save();

    // Return a success response
    return res.json({success: true});
  } catch (err) {
    // Pass any caught errors to the error-handling middleware
    return next(err.body);
  }
});

/**
 * Toggles the shared status of a dashboard with the specified ID.
 *
 * @param {Request} req - The request object.
 * @param {string} req.body.dashboardId - The ID of the dashboard to be shared.
 * @param {Object} req.decoded - The decoded user object obtained from the authorization header.
 * @param {string} req.decoded.id - The ID of the authenticated user.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Response} The response object with a JSON body.
 */
router.post('/share-dashboard',
  // Middleware function to check if the user is authorized to access the endpoint
  authorization,
  // Async function to handle the request and response objects
  async (req, res, next) => {
    try {
      // Extract the ID of the dashboard to be shared from the request body
      const {dashboardId} = req.body;

      // Extract the ID of the authenticated user from the decoded token
      const {id} = req.decoded;

      // Find the dashboard with the specified ID and owned by the authenticated user
      const foundDashboard = await Dashboard.findOne({
        _id: mongoose.Types.ObjectId(dashboardId),
        owner: mongoose.Types.ObjectId(id)
      });

      // If no dashboard was found matching the specified ID and owner, return an error response
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }

      // Toggle the shared property of the found dashboard
      foundDashboard.shared = !(foundDashboard.shared);

      // Save the updated dashboard to the database
      await foundDashboard.save();

      // Return a JSON response indicating success and the updated shared property value
      return res.json({
        success: true,
        shared: foundDashboard.shared
      });
    } catch (err) {
      // Pass any caught errors to the error-handling middleware
      return next(err.body);
    }
  });

/**
 * Endpoint to check if a password is needed to access a dashboard
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - JSON response containing whether a password is needed
 */
router.post('/check-password-needed', async (req, res, next) => {
  try {
    const {
      user,
      dashboardId
    } = req.body;
    const userId = user.id;

    // Look up the dashboard by ID and select the 'password' field
    const foundDashboard = await Dashboard.findById(dashboardId)
      .select('+password');

    if (!foundDashboard) {
      return res.json({
        status: 409,
        message: 'The specified dashboard has not been found.'
      });
    }

    // Construct a simplified dashboard object
    const dashboard = {
      name: foundDashboard.name,
      layout: foundDashboard.layout,
      items: foundDashboard.items
    };

    if (userId && foundDashboard.owner.equals(userId)) {
      // If the requesting user is the owner of the dashboard, increment the 'views' count and return the dashboard
      foundDashboard.views += 1;
      await foundDashboard.save();

      return res.json({
        success: true,
        owner: 'self',
        shared: foundDashboard.shared,
        hasPassword: !!foundDashboard.password,
        dashboard
      });
    }

    if (!foundDashboard.shared) {
      // If the dashboard is not shared, indicate that no further action is needed
      return res.json({
        success: true,
        owner: '',
        shared: false
      });
    }

    if (!foundDashboard.password) {
      // If the dashboard is shared and does not have a password, increment the 'views' count and return the dashboard
      foundDashboard.views += 1;
      await foundDashboard.save();

      return res.json({
        success: true,
        owner: foundDashboard.owner,
        shared: true,
        passwordNeeded: false,
        dashboard
      });
    }

    // If the dashboard is shared and has a password, indicate that the password is needed
    return res.json({
      success: true,
      owner: '',
      shared: true,
      passwordNeeded: true
    });
  } catch (err) {
    return next(err.body);
  }
});

/**
 * Check the password for a specified dashboard.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body containing the dashboard ID and password.
 * @param {string} req.body.dashboardId - The ID of the dashboard to check the password for.
 * @param {string} req.body.password - The password to check against the dashboard's stored password.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - The next middleware function in the chain.
 * @returns {Object} - The JSON response containing the success status, whether the password was correct,
 * the dashboard owner, and the dashboard object.
 */
router.post('/check-password',
  async (req, res, next) => {
    try {
      const {
        dashboardId,
        password
      } = req.body;

      // Find the dashboard with the given id and select the password field.
      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId)})
        .select('+password');
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }

      // If the password is incorrect, return a response with correctPassword = false.
      if (!foundDashboard.comparePassword(password, foundDashboard.password)) {
        return res.json({
          success: true,
          correctPassword: false
        });
      }

      // If the password is correct, increment the views count for the dashboard and return its details.
      foundDashboard.views += 1;
      await foundDashboard.save();

      const dashboard = {};
      dashboard.name = foundDashboard.name;
      dashboard.layout = foundDashboard.layout;
      dashboard.items = foundDashboard.items;

      return res.json({
        success: true,
        correctPassword: true,
        owner: foundDashboard.owner,
        dashboard
      });
    } catch (err) {
      return next(err.body);
    }
  });


/**
 * Changes the password of a dashboard owned by the authenticated user.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.dashboardId - The ID of the dashboard to update.
 * @param {string} req.body.password - The new password for the dashboard.
 * @param {Object} req.decoded - The decoded JWT payload with the authenticated user's ID.
 * @param {Object} res - The HTTP response object.
 * @param {function} next - The next middleware function in the request chain.
 * @returns {Object} A JSON response indicating the operation result.
 * @throws {Object} An error object containing a `status` and a `message` property
 *                   if the dashboard is not found or the operation fails.
 */

router.post('/change-password',
  authorization,
  async (req, res, next) => {
    try {
      // Get the dashboard ID and new password from the request body
      const {
        dashboardId,
        password
      } = req.body;

      // Get the user ID from the decoded token
      const {id} = req.decoded;

      // Find the dashboard with the specified ID and owned by the user
      const foundDashboard = await Dashboard.findOne({
        _id: mongoose.Types.ObjectId(dashboardId),
        owner: mongoose.Types.ObjectId(id)
      });

      // If the dashboard is not found, return an error response
      if (!foundDashboard) {
        return res.status(409)
          .json({
            message: 'The specified dashboard has not been found.'
          });
      }

      // Set the new password for the dashboard and save it to the database
      foundDashboard.password = password;
      await foundDashboard.save();

      // Return a success response
      return res.json({success: true});
    } catch (err) {
      // If an error occurs, pass it to the error-handling middleware
      return next(err);
    }
  });

module.exports = router;
