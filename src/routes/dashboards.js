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
 * Endpoint to retrieve all dashboards belonging to the authenticated user.
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
 * This route handles a GET request to retrieve all dashboards belonging to the authenticated user.
 * Authorization middleware is used to check if the user is authorized to access the endpoint.
 * An async function is used to handle the request and response objects.
 * The ID of the authenticated user is obtained from the JWT token.
 * The find() method is used to retrieve all dashboards belonging to the authenticated user using their ID.
 * The forEach() method is used to loop through each found dashboard and format the data to only include the ID, name, and views count.
 * The formatted dashboard data is returned in a JSON response with a success boolean.
 * Any errors caught are passed to the error-handling middleware.
 */

/**
 * Endpoint to create a dashboard
 *
 @route POST /create-dashboard
 @description Creates a new dashboard for the user
 @access Private
 @param {string} name - The name of the dashboard to create
 @returns {JSON} Returns a success status if the dashboard is created successfully, otherwise returns an error message.
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
 * The route creates a new dashboard for the user.
 * It requires the user to be authenticated, so it checks the authorization first.
 * It then checks if a dashboard with the same name already exists.
 * If the dashboard does not exist, it creates a new dashboard with an empty layout, no items,
 * a next id of 1, and the owner id.
 * Finally, it sends a success response to the user.
 */

/**
 * Endpoint to delete a dashboard.
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
 * This code defines a route for deleting a dashboard.
 * The route requires the user to be authorized before executing the async function.
 * The function extracts the ID of the dashboard to be deleted from the request body,
 * finds and deletes the dashboard with the specified ID and owned by the authenticated user.
 * If the dashboard was not found, it returns an error response.
 * If the dashboard was successfully deleted, it returns a success response.
 * Any errors caught during the process are passed to the error-handling middleware.
 */

router.get('/dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const {id} = req.query;

      const foundDashboard = await Dashboard.findOne({
        _id: mongoose.Types.ObjectId(id),
        owner: mongoose.Types.ObjectId(req.decoded.id)
      });
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }

      const dashboard = {};
      dashboard.id = foundDashboard._id;
      dashboard.name = foundDashboard.name;
      dashboard.layout = foundDashboard.layout;
      dashboard.items = foundDashboard.items;
      dashboard.nextId = foundDashboard.nextId;

      const foundSources = await Source.find({owner: mongoose.Types.ObjectId(req.decoded.id)});
      const sources = [];
      foundSources.forEach((s) => {
        sources.push(s.name);
      });

      return res.json({
        success: true,
        dashboard,
        sources
      });
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/save-dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const {
        id,
        layout,
        items,
        nextId
      } = req.body;

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

      if (result === null) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }
      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/clone-dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const {
        dashboardId,
        name
      } = req.body;

      const foundDashboard = await Dashboard.findOne({
        owner: mongoose.Types.ObjectId(req.decoded.id),
        name
      });
      if (foundDashboard) {
        return res.json({
          status: 409,
          message: 'A dashboard with that name already exists.'
        });
      }

      const oldDashboard = await Dashboard.findOne({
        _id: mongoose.Types.ObjectId(dashboardId),
        owner: mongoose.Types.ObjectId(req.decoded.id)
      });

      await new Dashboard({
        name,
        layout: oldDashboard.layout,
        items: oldDashboard.items,
        nextId: oldDashboard.nextId,
        owner: mongoose.Types.ObjectId(req.decoded.id)
      }).save();

      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/check-password-needed',
  async (req, res, next) => {
    try {
      const {
        user,
        dashboardId
      } = req.body;
      const userId = user.id;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId)})
        .select('+password');
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }

      const dashboard = {};
      dashboard.name = foundDashboard.name;
      dashboard.layout = foundDashboard.layout;
      dashboard.items = foundDashboard.items;

      if (userId && foundDashboard.owner.equals(userId)) {
        foundDashboard.views += 1;
        await foundDashboard.save();

        return res.json({
          success: true,
          owner: 'self',
          shared: foundDashboard.shared,
          hasPassword: foundDashboard.password !== null,
          dashboard
        });
      }
      if (!(foundDashboard.shared)) {
        return res.json({
          success: true,
          owner: '',
          shared: false
        });
      }
      if (foundDashboard.password === null) {
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

router.post('/check-password',
  async (req, res, next) => {
    try {
      const {
        dashboardId,
        password
      } = req.body;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId)})
        .select('+password');
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      if (!foundDashboard.comparePassword(password, foundDashboard.password)) {
        return res.json({
          success: true,
          correctPassword: false
        });
      }

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

router.post('/share-dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const {dashboardId} = req.body;
      const {id} = req.decoded;

      const foundDashboard = await Dashboard.findOne({
        _id: mongoose.Types.ObjectId(dashboardId),
        owner: mongoose.Types.ObjectId(id)
      });
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      foundDashboard.shared = !(foundDashboard.shared);

      await foundDashboard.save();

      return res.json({
        success: true,
        shared: foundDashboard.shared
      });
    } catch (err) {
      return next(err.body);
    }
  });

router.post('/change-password',
  authorization,
  async (req, res, next) => {
    try {
      const {
        dashboardId,
        password
      } = req.body;
      const {id} = req.decoded;

      const foundDashboard = await Dashboard.findOne({
        _id: mongoose.Types.ObjectId(dashboardId),
        owner: mongoose.Types.ObjectId(id)
      });
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      foundDashboard.password = password;

      await foundDashboard.save();

      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  });

module.exports = router;
