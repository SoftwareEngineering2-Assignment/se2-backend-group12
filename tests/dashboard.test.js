const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');
const http = require('http');
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

test('GET /api/dashboard/:id returns correct response and status code', async (t) => {
  const token = jwtSign({id: 1});
  const dashboardId = '123';
  const {
    statusCode,
    body
  } = await t.context.got(`api/dashboard/${dashboardId}`, {
    headers: {authorization: `Bearer ${token}`}
  });
  t.is(statusCode, 200);
  t.truthy(body.success);
  t.is(body.dashboard.id, dashboardId);
});

test('GET /api/dashboard/:id returns 404 when dashboard not found', async (t) => {
  const token = jwtSign({id: 1});
  const dashboardId = '456';
  const {statusCode} = await t.context.got(`api/dashboard/${dashboardId}`, {
    headers: {authorization: `Bearer ${token}`}
  });
  t.is(statusCode, 404);
});

test('POST /api/dashboard creates a new dashboard', async (t) => {
  const token = jwtSign({id: 1});
  const dashboardData = {
    name: 'Test Dashboard',
    layout: 'grid',
    items: [],
    nextId: 1
  };
  const {
    statusCode,
    body
  } = await t.context.got.post('api/dashboard', {
    headers: {authorization: `Bearer ${token}`},
    json: dashboardData
  });
  t.is(statusCode, 200);
  t.truthy(body.success);
  t.truthy(body.dashboard.id);
});

test('POST /api/dashboard/:id updates an existing dashboard', async (t) => {
  const token = jwtSign({id: 1});
  const dashboardId = '123';
  const dashboardData = {
    name: 'Updated Dashboard',
    layout: 'flex',
    items: [],
    nextId: 1
  };
  const {
    statusCode,
    body
  } = await t.context.got.post(`api/dashboard/${dashboardId}`, {
    headers: {authorization: `Bearer ${token}`},
    json: dashboardData
  });
  t.is(statusCode, 200);
  t.truthy(body.success);
  t.is(body.dashboard.name, dashboardData.name);
});

test('POST /api/dashboard/:id deletes an existing dashboard', async (t) => {
  const token = jwtSign({id: 1});
  const dashboardId = '123';
  const {
    statusCode,
    body
  } = await t.context.got.post(`api/dashboard/${dashboardId}/delete`, {
    headers: {authorization: `Bearer ${token}`}
  });
  t.is(statusCode, 200);
  t.truthy(body.success);
});
