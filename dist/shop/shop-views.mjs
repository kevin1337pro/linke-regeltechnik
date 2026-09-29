import { money } from './shop-core.mjs';
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function productCard(p) {
  const e = escapeHTML;
  return `<article class="product-card" data-product-id="${e(p.id)}">
    <a class="product-image-link" href="${e(p.sourceUrl)}" data-product="${e(p.id)}" aria-label="Produktdetails zu ${e(p.id)}"><span class="product-category">${e(p.category)}</span><img src="${e(p.image)}" alt="${e(p.brand)} ${e(p.id)}" width="369" height="250" loading="lazy"></a>
    <div class="product-card-body"><span class="product-brand">${e(p.brand)}</span><h2><a href="${e(p.sourceUrl)}" data-product="${e(p.id)}">${e(p.id)}</a></h2><p class="product-type">${e(p.type)}</p><div class="product-highlights">${p.highlights.map(h => `<span>${e(h)}</span>`).join('')}</div><div class="product-price-row"><span class="product-price">${money(p.priceCents)}</span><button class="product-add" type="button" data-add="${e(p.id)}" aria-label="${e(p.id)} in den Warenkorb legen">+</button></div><div class="product-links"><button type="button" class="detail-trigger" data-product="${e(p.id)}" aria-label="Details zu ${e(p.id)}">Details ansehen</button><a href="${e(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Bei BLR24 ansehen ↗</a></div></div>
  </article>`;
}

export function productDetails(p) {
  const e = escapeHTML;
  return `<div class="product-detail-grid"><div class="detail-image"><img src="${e(p.image)}" alt="${e(p.brand)} ${e(p.id)}"></div><div class="detail-content"><div class="eyebrow">${e(p.brand)}</div><h2 id="product-dialog-title">${e(p.id)}</h2><p class="detail-type">${e(p.type)}</p><p class="detail-description">${e(p.description)}</p><dl class="detail-specs">${Object.entries(p.specs).map(([k,v]) => `<dt>${e(k)}</dt><dd>${e(v)}</dd>`).join('')}</dl><div class="detail-price">${money(p.priceCents)}</div><p class="detail-tax">Inkl. 19 % MwSt., zzgl. Versand · Preisstand 29.09.2026</p><form id="detail-add-form" class="detail-buy" data-id="${e(p.id)}"><label class="quantity-field" for="detail-quantity">Menge<input id="detail-quantity" name="quantity" type="number" min="1" max="99" step="1" value="1" required inputmode="numeric"></label><button type="submit" class="button button-dark">In den Warenkorb <span aria-hidden="true">+</span></button></form><p class="detail-error" id="detail-error" role="status"></p><a class="detail-source" href="${e(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Originalartikel & Direktkauf bei BLR24 ↗</a></div></div>`;
}

export function cartLine(p) {
  const e = escapeHTML;
  return `<article class="cart-line" data-cart-item="${e(p.id)}"><img src="${e(p.image)}" alt=""><div><div class="cart-line-title"><h3>${e(p.id)}</h3><button type="button" data-remove="${e(p.id)}" aria-label="${e(p.id)} aus dem Warenkorb entfernen">×</button></div><p>${e(p.type)}<br>Einzelpreis ${money(p.priceCents)}</p><div class="cart-line-bottom"><div class="quantity-stepper"><button type="button" data-decrease="${e(p.id)}" aria-label="Menge für ${e(p.id)} verringern">−</button><input type="number" min="1" max="99" step="1" inputmode="numeric" value="${p.quantity}" data-quantity="${e(p.id)}" aria-label="Menge für ${e(p.id)}"><button type="button" data-increase="${e(p.id)}" aria-label="Menge für ${e(p.id)} erhöhen" ${p.quantity >= 99 ? 'disabled' : ''}>+</button></div><strong>${money(p.lineCents)}</strong></div></div></article>`;
}
