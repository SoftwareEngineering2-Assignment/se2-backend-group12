// const test = require('ava').default;
// const got = require('got');
// const listen = require('test-listen');
// const http = require('http');
// const mongoose = require('mongoose');
// const Dashboard = require('../src/routes/dashboards');
// const app = require('../src/index');
// const {jwtSign} = require('../src/utilities/authentication/helpers');
// const {request} = require('express');
//
// test.before(async (t) => {
//   t.context.server = http.createServer(app);
//   t.context.prefixUrl = await listen(t.context.server);
//   t.context.got = got.extend({
//     http2: true,
//     throwHttpErrors: false,
//     responseType: 'json',
//     prefixUrl: t.context.prefixUrl
//   });
// });
//
// test.after.always((t) => {
//   t.context.server.close();
// });
//
// // This test checks if the GET /dashboards endpoint returns the correct response and status code
// test('GET /dashboards returns correct response and status code', async (t) => {
// // Create a JWT token with user ID 1
//   const token = jwtSign({id: 1});
//   // Send a GET request to the /dashboards endpoint with the JWT token in the Authorization header
//   const {
//     statusCode,
//     body
//   } = await t.context.got('dashboards', {headers: {authorization: `Bearer ${token}`}});
//
//   // Assert that the response status code is 200
//   t.is(statusCode, 200);
//   // Assert that the response body contains a truthy value for the "success" key
//   t.truthy(body.success);
// })
// ;
//
// // This test checks if the GET /dashboards endpoint returns the correct response and status code
// test('GET /dashboards returns 404 when dashboard not found', async (t) => {
//   // Create a JWT token with user ID 1
//   const token = jwtSign({id: 1});
//   // Send a GET request to the /dashboards endpoint with the JWT token in the Authorization header
//   const {
//     statusCode,
//     body
//   } = await t.context.got('dashboards', {headers: {authorization: `Bearer ${token}`}});
//
//   // Assert that the response status code is 404
//   t.is(statusCode, 404);
//   // Assert that the response body contains a truthy value for the "success" key
//   t.truthy(body.success);
// });
//
// test('POST /create-dashboard creates a new dashboard', async (t) => {
//   const token = jwtSign({id: 1});
//
//   // Send request to create a new dashboard
//   const {
//     statusCode,
//     body
//   } = await t.context.got.post('create-dashboard', {
//     json: {name: 'Test Dashboard'},
//     headers: {Authorization: `Bearer ${token}`}
//   });
//
//   // Verify that the response has a success status code
//   t.is(statusCode, 200);
//
//   // Verify that the new dashboard was created
//   const dashboard = await Dashboard.get({
//     owner: mongoose.Types.ObjectId(1),
//     name: 'Test Dashboard'
//   });
//   t.truthy(dashboard);
//   t.truthy(request.body.success)
// });
//
// test('POST /delete-dashboard deletes dashboard and returns success response', async (t) => {
//   // Generate a JWT token for a user with ID 1
//   const token = jwtSign({id: 1});
//
//   // Send a request to delete a dashboard with ID 123
//   const {
//     statusCode,
//     body
//   } = await t.context.got.post('delete-dashboard', {
//     headers: {authorization: `Bearer ${token}`},
//     json: {id: 123}
//   });
//
//   // Assert that the response status code is 200
//   t.is(statusCode, 200);
//
//   // Assert that the response body contains a truthy success property
//   t.truthy(request.body.success);
// });
//
// // Test for GET /dashboard to retrieve a dashboard belonging to the authenticated user
// test('GET /dashboard retrieves the correct dashboard and sources', async (t) => {
// // Generate a JWT token for the authenticated user with ID 1
//   const token = jwtSign({id: 1});
//
//   // Make a GET request to /dashboard with query parameters for dashboard ID 1 and the JWT token in the Authorization header
//   const {statusCode, body} = await t.context.got('dashboard?id=1', {headers: {authorization: `Bearer ${token}`}});
//
//   // Assert that the status code of the response is 200
//   t.is(statusCode, 200);
//
//   // Assert that the body of the response contains a truthy value for the 'success' property
//   t.truthy(body.success);
//
//   // Assert that the body of the response contains an object for the 'dashboard' property
//   t.is(typeof body.dashboard, 'object');
//
//   // Assert that the dashboard object has properties for 'id', 'name', 'layout', 'items', and 'nextId'
//   t.truthy(body.dashboard.id);
//   t.truthy(body.dashboard.name);
//   t.truthy(body.dashboard.layout);
//   t.truthy(body.dashboard.items);
//   t.truthy(body.dashboard.nextId);
//
//   // Assert that the body of the response contains an array for the 'sources' property
//   t.true(Array.isArray(body.sources));
//
//   // Assert that the sources array contains only string values
//   t.true(body.sources.every((s) => typeof s === 'string'));
// });
//
// // Test for GET /dashboard with invalid dashboard ID
// test('GET /dashboard with invalid ID returns error response', async (t) => {
// // Generate a JWT token for the authenticated user with ID 1
//   const token = jwtSign({id: 1});
//
//   // eslint-disable-next-line max-len
//   // Make a GET request to /dashboard with an invalid dashboard ID and the JWT token in the Authorization header
//   const {statusCode, body} = await t.context.got('dashboard?id=invalid', {headers: {authorization: `Bearer ${token}`}});
//
//   // Assert that the status code of the response is 409
//   t.is(statusCode, 409);
//
//   // Assert that the body of the response contains a truthy value for the 'status' property
//   t.truthy(body.status);
//
//   // Assert that the body of the response contains a message for the 'message' property
//   t.truthy(body.message);
// });
//
// // Test for GET /dashboard for non-existent dashboard belonging to the authenticated user
// test('GET /dashboard for non-existent dashboard returns error response', async (t) => {
// // Generate a JWT token for the authenticated user with ID 1
//   const token = jwtSign({id: 1});
//
//   // eslint-disable-next-line max-len
//   // Make a GET request to /dashboard with a non-existent dashboard ID and the JWT token in the Authorization header
//   const {statusCode, body} = await t.context.got('dashboard?id=999', {headers: {authorization: `Bearer ${token}`}});
//
//   // Assert that the status code of the response is 409
//   t.is(statusCode, 409);
//
//   // Assert that the body of the response contains a truthy value for the 'status' property
//   t.truthy(body.status);
//
//   // Assert that the body of the response contains a message for the 'message' property
//   t.truthy(body.message);
// });
//
//
// // Test that saving a dashboard returns a success response and the updated dashboard data
// test('POST /save-dashboard returns success and updated dashboard data', async (t) => {
//   // Create a mock dashboard with layout, items, and nextId properties to be saved
//   const mockDashboard = {
//     id: '6087b0d02ac9ca145cde97c3',
//     layout: [{x: 0, y: 0, w: 2, h: 2, i: '1', minW: 2, maxW: 6}],
//     items: {'1': {id: '1', type: 'line', chartType: 'line', dataSource: 'test', x: 0, y: 0, w: 2, h: 2}},
//     nextId: 2
//   };
//   // Create a JWT for an authenticated user
//   const token = jwtSign({id: 1});
//   // Send a request to save the mock dashboard data to the API
//   const res = await request(app)
//     .post('/save-dashboard')
//     .set('Authorization', `Bearer ${token}`)
//     .send(mockDashboard);
//   // Assert that the response status is 200
//   t.is(res.status, 200);
//   // Assert that the response body contains a 'success' property with a truthy value
//   t.truthy(res.body.success);
// });
//
// // Test that saving a dashboard with an invalid ID returns an error response
// test('POST /save-dashboard with invalid ID returns error response', async (t) => {
//   // Create a mock dashboard with an invalid ID to be saved
//   const mockDashboard = {
//     id: 'invalid-id',
//     layout: [{x: 0, y: 0, w: 2, h: 2, i: '1', minW: 2, maxW: 6}],
//     items: {1: {id: '1', type: 'line', chartType: 'line', dataSource: 'test', x: 0, y: 0, w: 2, h: 2}},
//     nextId: 2
//   };
//   // Create a JWT for an authenticated user
//   const token = jwtSign({id: 1});
//   // Send a request to save the mock dashboard data to the API
//   const res = await request(app)
//     .post('/save-dashboard')
//     .set('Authorization', `Bearer ${token}`)
//     .send(mockDashboard);
//   // Assert that the response status is 409
//   t.is(res.status, 409);
//   // Assert that the response body contains a 'status' property with a value of 409
//   t.is(res.body.status, 409);
//   // Assert that the response body contains a 'message' property with a string value
//   t.is(typeof res.body.message, 'string');
// });
//
//
// // eslint-disable-next-line max-len
// // Test that saving a dashboard with an ID that doesn't belong to the authenticated user returns an error response
// test('POST /save-dashboard with invalid owner ID returns error response', async (t) => {
//   // Create a mock dashboard with an ID that doesn't belong to the authenticated user to be saved
//   const mockDashboard = {
//     id: 'invalid-id',
//     layout: [{x: 0, y: 0, w: 2, h: 2, i: '1', minW: 2, maxW: 6}],
//     items: {1: {id: '1', type: 'line', chartType: 'line', dataSource: 'test', x: 0, y: 0, w: 2, h: 2}},
//     nextId: 2
//   };
//   // Create a JWT for a user who doesn't own the dashboard
//   const token = jwtSign({id: 2});
//   // Send a request to save the mock dashboard data to the API
//   const res = await request(app)
//     .post('/save-dashboard')
//     .set('Authorization', `Bearer ${token}`)
//     .send(mockDashboard);
//   // Assert that the response status is 409
//   t.is(res.status, 409);
//   // Assert that the response body contains a 'status' property with a value of 409
//   t.is(res.body.status, 409);
//   // Assert that the response body contains a 'message' property with a string value
//   t.is(typeof res.body.message, 'string');
// });
//
//
// test('Clone dashboard with a unique name successfully', async (t) => {
//   // Create a new dashboard with a unique name for the authenticated user
//   const name = 'Test Dashboard';
//   const dashboard = new Dashboard({
//     name,
//     layout: [],
//     items: [],
//     nextId: 0,
//     owner: mongoose.Types.ObjectId()
//   });
//   await dashboard.save();
//   // Generate a JWT token for the authenticated user
//   const token = jwtSign({id: dashboard.owner});
//
//   // Clone the dashboard with a new name
//   const newDashboardName = 'Cloned Dashboard';
//   const res = await t.context.got.post('clone-dashboard', {
//     headers: {authorization: `Bearer ${token}`},
//     json: {dashboardId: dashboard._id, name: newDashboardName},
//     responseType: 'json'
//   });
//
//   // Check that the response is successful and the new dashboard exists
//   t.is(res.statusCode, 200);
//   t.true(res.body.success);
//   const clonedDashboard = await Dashboard.findOne({name: newDashboardName});
//   t.truthy(clonedDashboard);
// });
//
// test('Attempt to clone a dashboard with a non-unique name fails', async (t) => {
//   // Create two dashboards with the same name for the authenticated user
//   const name = 'Test Dashboard';
//   const dashboard1 = new Dashboard({
//     name,
//     layout: [],
//     items: [],
//     nextId: 0,
//     owner: mongoose.Types.ObjectId()
//   });
//   await dashboard1.save();
//   const dashboard2 = new Dashboard({
//     name,
//     layout: [],
//     items: [],
//     nextId: 0,
//     owner: mongoose.Types.ObjectId()
//   });
//   await dashboard2.save();
//   // Generate a JWT token for the authenticated user
//   const token = jwtSign({id: dashboard1.owner});
//
//   // Attempt to clone the first dashboard with the same name as the second
//   const res = await t.context.got.post('clone-dashboard', {
//     headers: {authorization: `Bearer ${token}`},
//     json: {dashboardId: dashboard1._id, name: dashboard2.name},
//     responseType: 'json'
//   });
//
//   // Check that the response indicates a failure and the error message is correct
//   t.is(res.statusCode, 409);
//   t.is(res.body.status, 409);
//   t.is(res.body.message, 'A dashboard with that name already exists.');
// });
