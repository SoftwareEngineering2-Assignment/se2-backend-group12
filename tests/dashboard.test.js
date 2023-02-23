const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');
const http = require('http');
const mongoose = require('mongoose');
const Dashboard = require('../src/routes/dashboards');
const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');

test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({
    http2: true,
    throwHttpErrors: false,
    responseType: 'json',
    prefixUrl: t.context.prefixUrl
  });
});

test.after.always((t) => {
  t.context.server.close();
});

// This test checks if the GET /dashboards endpoint returns the correct response and status code
test('GET /dashboards returns correct response and status code', async (t) => {
// Create a JWT token with user ID 1
  const token = jwtSign({id: 1});
  // Send a GET request to the /dashboards endpoint with the JWT token in the Authorization header
  const {
    statusCode,
    body
  } = await t.context.got('dashboards', {headers: {authorization: `Bearer ${token}`}});

  // Assert that the response status code is 200
  t.is(statusCode, 200);
  // Assert that the response body contains a truthy value for the "success" key
  t.truthy(body.success);
})
;

// This test checks if the GET /dashboards endpoint returns the correct response and status code
test('GET /dashboards returns 404 when dashboard not found', async (t) => {
  // Create a JWT token with user ID 1
  const token = jwtSign({id: 1});
  // Send a GET request to the /dashboards endpoint with the JWT token in the Authorization header
  const {
    statusCode,
    body
  } = await t.context.got('dashboards', {headers: {authorization: `Bearer ${token}`}});

  // Assert that the response status code is 404
  t.is(statusCode, 404);
  // Assert that the response body contains a truthy value for the "success" key
  t.truthy(body.success);
});

test('POST /create-dashboard creates a new dashboard', async (t) => {
  const token = jwtSign({id: 1});

  // Send request to create a new dashboard
  const {
    statusCode,
    body
  } = await t.context.got.post('create-dashboard', {
    json: {name: 'Test Dashboard'},
    headers: {Authorization: `Bearer ${token}`}
  });

  // Verify that the response has a success status code
  t.is(statusCode, 200);

  // Verify that the new dashboard was created
  const dashboard = await Dashboard.get({
    owner: mongoose.Types.ObjectId(1),
    name: 'Test Dashboard'
  });
  t.truthy(dashboard);
});

test('POST /delete-dashboard deletes dashboard and returns success response', async (t) => {
  // Generate a JWT token for a user with ID 1
  const token = jwtSign({id: 1});

  // Send a request to delete a dashboard with ID 123
  const {
    statusCode,
    body
  } = await t.context.got.post('delete-dashboard', {
    headers: {authorization: `Bearer ${token}`},
    json: {id: 123}
  });

  // Assert that the response status code is 200
  t.is(statusCode, 200);

  // Assert that the response body contains a truthy success property
  t.truthy(body.success);
});
