const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

const app = require('../src/index');
const { jwtSign } = require('../src/utilities/authentication/helpers');

test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({
    http2: true,
    throwHttpErrors: false,
    responseType: 'json',
    prefixUrl: t.context.prefixUrl,
  });
});

test.after.always((t) => {
  t.context.server.close();
});

test('GET /sources returns correct response and status code', async (t) => {
  // Generate a JWT token with user ID 1
  const token = jwtSign({ id: 1 });

  // Make a GET request to the '/api/sources' endpoint with the JWT token in the query string
  const { statusCode, body } = await t.context.got('sources', {
    searchParams: { token },
    throwHttpErrors: false,
  });

  // Check that the response status code is 200
  t.is(statusCode, 200);

  // Check that the response body is an array
  t.true(Array.isArray(body));

  // Check that the response body contains at least one source object
  t.true(body.length > 0);
});
