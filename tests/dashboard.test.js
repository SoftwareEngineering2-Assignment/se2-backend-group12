const test = require('ava').default;
const got = require('got');
const Dashboard = require('../src/routes/dashboards')
const listen = require('test-listen');
const http = require('http');
const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');
const mongoose = require('mongoose');

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

test('GET /dashboards returns correct response and status code', async (t) => {
  const token = jwtSign({id: 1});
  const {
    statusCode,
    body
  } = await t.context.got(`dashboards`, {
    headers: {authorization: `Bearer ${token}`}
  });
  t.is(statusCode, 200);
  t.truthy(body.success);
});

test('GET /dashboards returns 404 when dashboard not found', async (t) => {
  const token = jwtSign({id: 1});
  const {statusCode, body} = await t.context.got(`dashboards`, {
    headers: {authorization: `Bearer ${token}`}
  });
  t.is(statusCode, 404);
  t.truthy(body.success);
});

test('POST /create-dashboard creates a new dashboard', async (t) => {
  const token = jwtSign({id: 1});

  // Send request to create a new dashboard
  const {statusCode, body} = await t.context.got.post('create-dashboard', {
    json: {
      name: 'Test Dashboard'
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
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
