const assert = require('assert');
const { normalizeStringArray, normalizeProductArrayFields } = require('../controllers/productController');

try {
  const one = normalizeStringArray('S, M, L');
  assert.deepStrictEqual(one, ['S', 'M', 'L']);

  const two = normalizeStringArray('["Red","Blue"]');
  assert.deepStrictEqual(two, ['Red', 'Blue']);

  const normalized = normalizeProductArrayFields({
    sizes: 'S, M, L',
    colors: 'Red, Blue,Green',
  });

  assert.deepStrictEqual(normalized.sizes, ['S', 'M', 'L']);
  assert.deepStrictEqual(normalized.colors, ['Red', 'Blue', 'Green']);

  console.log('array normalization tests passed');
} catch (error) {
  console.error(error);
  process.exit(1);
}
