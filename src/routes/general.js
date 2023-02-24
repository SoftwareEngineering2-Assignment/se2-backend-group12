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
    const users = countUsers();
    const dashboards = countDashboards();
    const views = sumDashboardViews();
    const sources = countSources();

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

router.get('/statistics', getStatistics);

/**
 * Checks the status code of the specified URL.
 * @param {string} url - The URL to check.
 * @returns {Promise<number>} The status code of the URL.
 */
async function checkUrlStatusCode(url) {
  const {statusCode} = await got(url);
  return statusCode;
}

router.get('/test-url',
  async (req, res) => {
    try {
      const {url} = req.query;
      const {statusCode} = await got(url);
      return res.json({
        status: statusCode,
        active: (statusCode === 200),
      });
    } catch (err) {
      return res.json({
        status: 500,
        active: false,
      });
    }
  });

router.get('/test-url-request',
  async (req, res) => {
    try {
      const {url, type, headers, body: requestBody, params} = req.query;

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

      return res.json({
        status: statusCode,
        response: body,
      });
    } catch (err) {
      return res.json({
        status: 500,
        response: err.toString(),
      });
    }
  });

module.exports = router;

module.exports = router;
