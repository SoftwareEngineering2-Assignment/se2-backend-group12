/* eslint-disable max-len */
const express = require('express');
const got = require('got');

const router = express.Router();

const User = require('../models/user');
const Dashboard = require('../models/dashboard');
const Source = require('../models/source');

/**
 * Counts the number of users in the database.
 *
 * @returns {Number} - The number of users.
 */
async function countUsers() {
  return User.countDocuments();
}

/**
 * Counts the number of dashboards in the database.
 *
 * @returns {Number} - The number of dashboards.
 */
async function countDashboards() {
  return Dashboard.countDocuments();
}

/**
 * Sums the total number of views across all dashboards in the database.
 *
 * @returns {Number} - The total number of views.
 */
async function sumDashboardViews() {
  const result = await Dashboard.aggregate([
    {
      $group: {
        _id: null,
        views: {$sum: '$views'}
      }
    }
  ]);

  return result[0] && result[0].views ? result[0].views : 0;
}

/**
 * Counts the number of sources in the database.
 *
 * @returns {Number} - The number of sources.
 */
async function countSources() {
  return Source.countDocuments();
}


/**
 * Retrieves statistics on the number of users, dashboards, views, and sources.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} - The statistics response object.
 */
async function getStatistics(req, res, next) {
  try {
    const users = await countUsers();
    const dashboards = await countDashboards();
    const views = await sumDashboardViews();
    const sources = await countSources();

    return res.json({
      success: true,
      users,
      dashboards,
      views,
      sources
    });
  } catch (err) {
    return next(err.body);
  }
}


/**
 * Test URL and return the status code and whether it is active or not.
 * @param {string} url - The URL to test
 * @returns {Object} - An object containing the status code and whether it is active or not
 */
async function testUrl(url) {
  try {
    const {statusCode} = await got(url);
    return {
      status: statusCode,
      active: (statusCode === 200),
    };
  } catch (err) {
    return {
      status: 500,
      active: false,
    };
  }
}


/**
 * Test URL request and return the response and status code.
 * @param {string} url - The URL to request
 * @param {string} type - The request method type (GET, POST, PUT)
 * @param {string} headers - The headers to be sent with the request
 * @param {string} requestBody - The body of the request
 * @param {string} params - The search params to be sent with the request
 * @returns {Object} - An object containing the status code and response
 */
async function testUrlRequest(url, type, headers, requestBody, params) {
  try {
    let statusCode;
    let body;
    switch (type) {
      case 'GET':
        ({statusCode, body} = await got(url, {
          headers: headers ? JSON.parse(headers) : {},
          searchParams: params ? JSON.parse(params) : {}
        }));
        break;
      case 'POST':
        ({statusCode, body} = await got.post(url, {
          headers: headers ? JSON.parse(headers) : {},
          json: requestBody ? JSON.parse(requestBody) : {}
        }));
        break;
      case 'PUT':
        ({statusCode, body} = await got.put(url, {
          headers: headers ? JSON.parse(headers) : {},
          json: requestBody ? JSON.parse(requestBody) : {}
        }));
        break;
      default:
        statusCode = 500;
        body = 'Something went wrong';
    }

    return {
      status: statusCode,
      response: body,
    };
  } catch (err) {
    return {
      status: 500,
      response: err.toString(),
    };
  }
}


router.get('/statistics', getStatistics);


router.get('/test-url', async (req, res) => {
  const {url} = req.query;
  const result = await testUrl(url);
  return res.json(result);
});

router.get('/test-url-request', async (req, res) => {
  const {url, type, headers, body: requestBody, params} = req.query;
  const result = await testUrlRequest(url, type, headers, requestBody, params);
  return res.json(result);
});

module.exports = router;