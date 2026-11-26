import test from 'node:test';
import assert from 'node:assert/strict';
import { runIdempotent } from '../src/services/user/idempotentRequest.js';

test('double click shares request; lost response retries same key; next action uses new key', async () => {
  const keys = [];
  let reject;
  const pending = new Promise((_, fail) => { reject = fail; });
  const send = key => { keys.push(key); return pending; };
  const first = runIdempotent('test-user', { cart: 1 }, send);
  const twin = runIdempotent('test-user', { cart: 1 }, send);
  assert.equal(first, twin);
  reject(new Error('timeout'));
  await assert.rejects(first);
  await runIdempotent('test-user', { cart: 1 }, key => { keys.push(key); return { id: 42 }; });
  assert.equal(keys[0], keys[1]);
  await runIdempotent('test-user', { cart: 1 }, key => { keys.push(key); return { id: 43 }; });
  assert.notEqual(keys[1], keys[2]);
});
