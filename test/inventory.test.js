var test = require('node:test');
var assert = require('node:assert/strict');
var inventory = require('../lib/inventory');
var orders = require('../lib/orders');

test('allows the exact sellable quantity while protecting reservations', function () {
  var products = [{ id: 1, name: 'Ghee', stock: 1, reserved: 0 },
    { id: 2, name: 'Chilli', stock: 4, reserved: 3 }];
  assert.equal(inventory.check(products, [{ id: 1, qty: 1 }, { id: 2, qty: 1 }]).ok, true);
  assert.equal(inventory.check(products, [{ id: 2, qty: 2 }]).ok, false);
  assert.equal(inventory.check(products, [{ id: 2, qty: 1 }, { id: 2, qty: 1 }]).ok, false);
});

test('cancellation restores physical stock once and preserves reservations', function () {
  var products = [{ id: 1, stock: 5, reserved: 2 }, { id: 2, stock: 6, reserved: 1 }];
  var items = [{ id: 1, qty: 2 }, { id: 2, qty: 2 }];
  inventory.reserve(products, items);
  var db = { products: products, orders: [{ id: 1007, status: 'pending', items: items }] };
  assert.equal(orders.cancel(db, 1007).ok, true);
  assert.deepEqual(products, [{ id: 1, stock: 5, reserved: 2 }, { id: 2, stock: 6, reserved: 1 }]);
  assert.equal(orders.cancel(db, 1007).ok, false);
  assert.equal(products[0].stock, 5);
});
