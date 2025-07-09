import test from 'node:test';
import assert from 'node:assert/strict';

// ensure test environment before loading the app
process.env.NODE_ENV = 'test';
const { default: app, _resetPolicies } = await import('../index.js');

const startServer = () => {
  const server = app.listen(0);
  const port = server.address().port;
  const url = `http://localhost:${port}`;
  return { server, url };
};

const headers = { 'Content-Type': 'application/json' };

// helper to fetch JSON
const jsonFetch = async (url, options) => {
  const res = await fetch(url, options);
  let body;
  try { body = await res.json(); } catch { body = undefined; }
  return { res, body };
};

test('POST /policy returns 200 when success', async () => {
  _resetPolicies();
  const { server, url } = startServer();
  const body = { status: 'ok', street: 'Test' };
  // force case1
  const origRandom = Math.random;
  Math.random = () => 0.2;
  const { res, body: data } = await jsonFetch(`${url}/policy`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  Math.random = origRandom;
  assert.equal(res.status, 200);
  assert.ok(data.policyNumber);
  server.close();
});

test('POST /policy returns 400 on case3', async () => {
  const { server, url } = startServer();
  const origRandom = Math.random;
  Math.random = () => 0;
  const { res } = await jsonFetch(`${url}/policy`, {
    method: 'POST',
    headers,
    body: JSON.stringify({})
  });
  Math.random = origRandom;
  assert.equal(res.status, 400);
  server.close();
});

test('POST /policy returns 429 on case2', async () => {
  const { server, url } = startServer();
  const origRandom = Math.random;
  Math.random = () => 0.99;
  const { res } = await jsonFetch(`${url}/policy`, {
    method: 'POST',
    headers,
    body: JSON.stringify({})
  });
  Math.random = origRandom;
  assert.equal(res.status, 429);
  server.close();
});

test('Callback endpoint returns data when policy exists', async () => {
  _resetPolicies();
  const { server, url } = startServer();
  const origRandom = Math.random;
  Math.random = () => 0.2; // case1 to create policy
  const create = await jsonFetch(`${url}/policy`, { method: 'POST', headers, body: JSON.stringify({}) });
  const policy = create.body.policyNumber;
  Math.random = origRandom;
  const { res, body: cbBody } = await jsonFetch(`${url}/cb5d8aa6-c9f4-4517-87d9-3a92a2fc1262`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ policyNumber: policy })
  });
  assert.equal(res.status, 200);
  assert.equal(cbBody.policyNumber, policy);
  server.close();
});

test('Callback endpoint returns 404 when policy missing', async () => {
  const { server, url } = startServer();
  const { res } = await jsonFetch(`${url}/cb5d8aa6-c9f4-4517-87d9-3a92a2fc1262`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ policyNumber: 'missing' })
  });
  assert.equal(res.status, 404);
  server.close();
});

test('Process callback endpoint responds', async () => {
  const { server, url } = startServer();
  const { res, body } = await jsonFetch(`${url}/callback/test`, {
    method: 'POST',
    headers,
    body: JSON.stringify({})
  });
  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  server.close();
});
