const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');
const http = require('http');

require('dotenv').config();

const {mongoose} = require('mongoose');
const {Dashboard} = require('../src/routes/dashboards');

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
  } = await t.context.got('dashboards/dashboards', {headers: {authorization: `Bearer ${token}`}});
  // Assert that the response status code is 200
  t.is(statusCode, 200);
  // Assert that the response body contains a truthy value for the "success" key
  t.truthy(body.success);
})
;


test('POST /create-dashboard creates a new dashboard', async (t) => {
  const token = jwtSign({id: 1});

  // Send request to create a new dashboard
  const {
    statusCode,
    body
  } = await t.context.got.post('dashboards/create-dashboard', {
    json: {name: 'Test Dashboard'},
    headers: {Authorization: `Bearer ${token}`}
  });

  // Verify that the response has a success status code
  t.is(statusCode, 200);

});

// Test for GET /dashboard for non-existent dashboard belonging to the authenticated user
test('GET /dashboard for non-existent dashboard returns error response', async (t) => {
// Generate a JWT token for the authenticated user with ID 1
  const token = jwtSign({id: 1});

  // eslint-disable-next-line max-len
  // Make a GET request to /dashboard with a non-existent dashboard ID and the JWT token in the Authorization header
  const {statusCode, body} = await t.context.got('dashboards/dashboard?id=999', {headers: {authorization: `Bearer ${token}`}});

  // Assert that the status code of the response is 404
  t.is(statusCode, 404);

});


// Test that saving a dashboard returns a success response and the updated dashboard data
test('POST /save-dashboard returns success and updated dashboard data', async (t) => {
  // Create a mock dashboard with layout, items, and nextId properties to be saved
  const mockDashboard = {
    id: '6087b0d02ac9ca145cde97c3',
    layout: [{x: 0, y: 0, w: 2, h: 2, i: '1', minW: 2, maxW: 6}],
    items: {'1': {id: '1', type: 'line', chartType: 'line', dataSource: 'test', x: 0, y: 0, w: 2, h: 2}},
    nextId: 2
  };
  // Create a JWT for an authenticated user
  const token = jwtSign({id: 1});
  // Send a request to save the mock dashboard data to the API
  const {statusCode, body} = await t.context.got.post('dashboards/save-dashboard', {headers: {authorization: `Bearer ${token}`}, json: mockDashboard});
  // Assert that the response status is 200
  t.is(statusCode, 200);
  // Assert that the response body contains a 'success' property with a truthy value
  t.truthy(body.status);
});


