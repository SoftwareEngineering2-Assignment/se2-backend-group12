// Import dependencies and libraries
require('dotenv').config();
const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

// Import application and utilities
const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');

// Set up the testing environment
test.before(async (t) => {
t.context.server = http.createServer(app);
t.context.prefixUrl = await listen(t.context.server);
t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});
});

// Close the testing environment after all tests have finished running
test.after.always((t) => {
t.context.server.close();
});

// Test that the GET /statistics route returns the correct response and status code
test('GET /statistics returns correct response and status code', async (t) => {
const {body, statusCode} = await t.context.got('general/statistics');
t.is(typeof body.sources, 'number');
t.assert(body.success);
t.is(statusCode, 200);
});

// Test that the GET /sources route returns the correct response and status code when a valid token is provided
test('GET /sources returns correct response and status code', async (t) => {
const token = jwtSign({id: 1});
const {statusCode} = await t.context.got(`sources/sources?token=${token}`);
t.is(statusCode, 200);
});