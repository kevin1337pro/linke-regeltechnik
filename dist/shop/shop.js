import { products } from './products.mjs';
import { cleanCart, setQuantity, cartSummary, filterProducts, inquiryText, money, MAX_QUANTITY } from './shop-core.mjs';
import { productCard, productDetails, cartLine } from './shop-views.mjs';

const storageKey = 'linke-regeltechnik-cart-v1';
let cart = [];
try { cart = cleanCart(JSON.parse(localStorage.getItem(storageKey) || '[]'), products); } catch { cart = []; }
let selectedCategory = 'Alle';
let toastTimer;
const grid = document.querySelector('#product-grid');
const search = document.querySelector('#product-search');
const sort = document.querySelector('#product-sort');
const productDialog = document.querySelector('#product-dialog');
const cartDialog = document.querySelector('#cart-dialog');

function announce(message) {
  const toast = document.querySelector('#shop-toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
  document.querySelector('#cart-status')?.replaceChildren(document.createTextNode(message));
}

function updateCounts() {
  const { quantity } = cartSummary(cart, products);
  document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = String(quantity); });
  document.querySelector('[data-open-cart]').setAttribute('aria-label', `Warenkorb öffnen, ${quantity} Artikel`);
}

function saveCart() {
  try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch { /* Cart remains usable in this page session. */ }
  updateCounts();
}

function addProduct(id, quantity) {
  const current = cart.find(p => p.id === id)?.quantity || 0;
  if (!Number.isInteger(quantity) || quantity < 1 || current + quantity > MAX_QUANTITY) throw new Error(`Maximal ${MAX_QUANTITY} Stück pro Artikel. Bitte passen Sie die Menge an.`);
  cart = setQuantity(cart, products, id, current + quantity);
  saveCart();
  announce(`${quantity} × ${id} zum Warenkorb hinzugefügt.`);
}

function renderProducts() {
  const found = filterProducts(products, search.value, selectedCategory, sort.value);
  grid.innerHTML = found.map(productCard).join('');
  document.querySelector('#result-count').textContent = `${found.length} ${found.length === 1 ? 'Produkt' : 'Produkte'}`;
  document.querySelector('#no-results').hidden = found.length !== 0;
  grid.hidden = found.length === 0;
}

function renderCart() {
  const summary = cartSummary(cart, products);
  document.querySelector('#cart-content').innerHTML = summary.lines.length
    ? summary.lines.map(cartLine).join('') + '<p id="cart-status" class="sr-only" role="status"></p>'
    : '<div class="cart-empty"><h3>Platz für Ihr nächstes Projekt.</h3><p>Ihr Warenkorb ist noch leer. Entdecken Sie unsere Produktauswahl und fügen Sie passende Artikel hinzu.</p><button class="button button-dark" type="button" data-close-dialog="cart-dialog">Produkte entdecken ↗</button></div><p id="cart-status" class="sr-only" role="status"></p>';
  document.querySelector('#cart-checkout').hidden = summary.lines.length === 0;
  document.querySelector('#cart-total').textContent = money(summary.totalCents);
  document.querySelector('#copy-fallback').hidden = true;
  const email = document.querySelector('#email-inquiry');
  if (summary.lines.length) {
    email.href = `mailto:info@linke-regeltechnik.de?subject=${encodeURIComponent('Unverbindliche Produktanfrage – BLR24 / Linke Regeltechnik')}&body=${encodeURIComponent(inquiryText(cart, products))}`;
  } else email.removeAttribute('href');
}

function openCart() {
  if (productDialog.open) productDialog.close();
  renderCart();
  if (!cartDialog.open) cartDialog.showModal();
}

document.querySelector('[data-open-cart]').addEventListener('click', openCart);
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
});

document.addEventListener('click', event => {
  const close = event.target.closest('[data-close-dialog]');
  if (close) document.getElementById(close.dataset.closeDialog)?.close();
  const detail = event.target.closest('[data-product]');
  if (detail) {
    event.preventDefault();
    const product = products.find(p => p.id === detail.dataset.product);
    if (!product) return;
    document.querySelector('#product-detail').innerHTML = productDetails(product);
    productDialog.showModal();
  }
  const add = event.target.closest('[data-add]');
  if (add) { try { addProduct(add.dataset.add, 1); } catch (error) { announce(error.message); } }
});

productDialog.addEventListener('submit', event => {
  const form = event.target.closest('#detail-add-form');
  if (!form) return;
  event.preventDefault();
  try {
    addProduct(form.dataset.id, Number(new FormData(form).get('quantity')));
    productDialog.close();
  } catch (error) { document.querySelector('#detail-error').textContent = error.message; }
});

function changeCart(id, quantity, focusAttribute) {
  try {
    cart = setQuantity(cart, products, id, quantity);
    saveCart(); renderCart();
    const focusTarget = Array.from(cartDialog.querySelectorAll(`[${focusAttribute}]`)).find(el => el.getAttribute(focusAttribute) === id && !el.disabled);
    (focusTarget || cartDialog.querySelector('[data-close-dialog]')).focus();
    announce(quantity === 0 ? `${id} entfernt.` : `${id}: Menge ${quantity}.`);
  } catch (error) { renderCart(); announce(error.message); }
}

cartDialog.addEventListener('click', event => {
  for (const [attr, delta] of [['data-increase', 1], ['data-decrease', -1], ['data-remove', 0]]) {
    const target = event.target.closest(`[${attr}]`);
    if (!target) continue;
    const id = target.getAttribute(attr);
    const current = cart.find(p => p.id === id)?.quantity || 0;
    changeCart(id, attr === 'data-remove' ? 0 : current + delta, attr);
    break;
  }
});
cartDialog.addEventListener('change', event => {
  const input = event.target.closest('[data-quantity]');
  if (!input) return;
  if (!input.value.trim() || !input.checkValidity()) { renderCart(); announce('Bitte eine ganze Menge zwischen 1 und 99 wählen.'); return; }
  changeCart(input.dataset.quantity, Number(input.value), 'data-quantity');
});

document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  const text = inquiryText(cart, products);
  try { await navigator.clipboard.writeText(text); announce('Anfragetext kopiert.'); }
  catch { document.querySelector('#copy-fallback').hidden = false; const field = document.querySelector('#inquiry-text'); field.value = text; field.focus(); field.select(); announce('Bitte den markierten Anfragetext kopieren.'); }
});

search.addEventListener('input', renderProducts);
sort.addEventListener('change', renderProducts);
document.querySelector('#category-filters').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  selectedCategory = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
  renderProducts();
});
document.querySelector('#reset-filters').addEventListener('click', () => {
  search.value = ''; selectedCategory = 'Alle'; sort.value = 'recommended';
  document.querySelectorAll('[data-category]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.category === 'Alle')));
  renderProducts(); search.focus();
});
window.addEventListener('storage', event => {
  if (event.key !== storageKey && event.key !== null) return;
  try { cart = cleanCart(JSON.parse(event.newValue || '[]'), products); } catch { cart = []; }
  updateCounts(); if (cartDialog.open) renderCart();
});
updateCounts();
const initialSearch = new URLSearchParams(window.location.search).get('artikel');
if (initialSearch) { search.value = initialSearch.slice(0, 100); renderProducts(); }
