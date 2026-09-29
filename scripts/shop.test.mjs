import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { products } from '../dist/shop/products.mjs';
import { cleanCart, setQuantity, cartSummary, filterProducts, inquiryText } from '../dist/shop/shop-core.mjs';
import { productCard, productDetails } from '../dist/shop/shop-views.mjs';

test('catalog prices and image references match the imported source', () => {
  const source = JSON.parse(fs.readFileSync('data/blr-source-products.json', 'utf8'));
  assert.equal(products.length, 12);
  assert.equal(new Set(products.map(p => p.id)).size, 12);
  for (const p of products) {
    const original = source.find(s => s.name === p.id);
    assert.equal(p.priceCents, Math.round(Number(original.offers.price) * 100));
    assert.equal(p.sourceUrl, original.sourceUrl);
    assert.ok(fs.existsSync('dist' + p.image));
  }
});

test('mixed basket totals use cents, with quantity edits and removal', () => {
  let cart = setQuantity([], products, 'DPS500', 2);
  cart = setQuantity(cart, products, 'ML7425A6008', 1);
  assert.equal(cartSummary(cart, products).totalCents, 57994);
  assert.equal(cartSummary(cart, products).quantity, 3);
  cart = setQuantity(cart, products, 'DPS500', 3);
  assert.equal(cartSummary(cart, products).totalCents, 63241);
  cart = setQuantity(cart, products, 'ML7425A6008', 0);
  assert.equal(cartSummary(cart, products).totalCents, 15741);
});

test('corrupt storage and stale product IDs cannot corrupt the basket', () => {
  assert.deepEqual(cleanCart({ malicious: true }, products), []);
  const cart = cleanCart([null, { id: 'UNKNOWN', quantity: 9 }, { id: 'DPS500', quantity: 2.5 }, { id: 'DPS500', quantity: -1 }, { id: 'DPS500', quantity: 3, priceCents: 1 }, { id: 'DPS500', quantity: 99 }], products);
  assert.deepEqual(cart, [{ id: 'DPS500', quantity: 99 }]);
  assert.equal(cartSummary(cart, products).totalCents, 519453);
  for (const quantity of [-1, 1.5, 100, NaN, Infinity]) assert.throws(() => setQuantity([], products, 'DPS500', quantity));
  assert.throws(() => setQuantity([], products, 'UNKNOWN', 1));
});

test('search, category filtering, empty results and price sorting compose', () => {
  assert.equal(filterProducts(products, 'ml7425a6008')[0].id, 'ML7425A6008');
  assert.equal(filterProducts(products, '24 V', 'Ventilantriebe').length, 4);
  assert.equal(filterProducts(products, 'unknown-xyz').length, 0);
  assert.equal(filterProducts(products, '', 'Sensorik').length, 3);
  const sorted = filterProducts(products, '', 'Alle', 'price-up');
  assert.equal(sorted[0].id, 'AF20-B65');
  assert.equal(filterProducts(products, '', 'Alle', 'price-down')[0].id, 'CLNXEHSERIES26ND');
  assert.equal(products[0].id, 'DPS500');
});

test('email inquiry describes exact basket without implying an order', () => {
  const text = inquiryText([{ id: 'DPS500', quantity: 2 }], products);
  assert.match(text, /unverbindliches Angebot/);
  assert.match(text, /2 × DPS500/);
  assert.match(text, /104,94/);
  assert.match(text, /29\.09\.2026/);
  assert.match(text, /Versandkosten, Verfügbarkeit und Lieferzeit/);
  assert.equal(decodeURIComponent(encodeURIComponent(text)), text);
  assert.throws(() => inquiryText([], products));
});

test('product output escapes external text and links details to the source', () => {
  const p = { ...products[0], id: '<script>alert(1)</script>' };
  assert.ok(!productCard(p).includes('<script>'));
  assert.match(productDetails(products[0]), /https:\/\/www\.blr24\.de\/dps500\.html/);
  assert.match(productCard(products[0]), /aria-label="DPS500 in den Warenkorb legen"/);
});
