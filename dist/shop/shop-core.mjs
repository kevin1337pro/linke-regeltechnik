export const MAX_QUANTITY = 99;
export const money = cents => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export function cleanCart(raw, products) {
  if (!Array.isArray(raw)) return [];
  const known = new Set(products.map(p => p.id));
  const result = new Map();
  for (const item of raw) {
    if (!item || !known.has(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
    result.set(item.id, Math.min(MAX_QUANTITY, (result.get(item.id) || 0) + item.quantity));
  }
  return [...result].map(([id, quantity]) => ({ id, quantity }));
}

export function setQuantity(cart, products, id, quantity) {
  if (!products.some(p => p.id === id)) throw new Error('Unbekannter Artikel.');
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) throw new Error(`Bitte eine ganze Menge zwischen 0 und ${MAX_QUANTITY} wählen.`);
  const current = cleanCart(cart, products);
  const index = current.findIndex(item => item.id === id);
  if (quantity === 0) return current.filter(item => item.id !== id);
  if (index < 0) current.push({ id, quantity }); else current[index] = { id, quantity };
  return current;
}

export function cartSummary(cart, products) {
  const lines = cleanCart(cart, products).map(item => {
    const p = products.find(product => product.id === item.id);
    return { ...p, quantity: item.quantity, lineCents: p.priceCents * item.quantity };
  });
  return { lines, quantity: lines.reduce((n, p) => n + p.quantity, 0), totalCents: lines.reduce((n, p) => n + p.lineCents, 0) };
}

export function filterProducts(products, query = '', category = 'Alle', sort = 'recommended') {
  const words = query.toLocaleLowerCase('de').trim().split(/\s+/).filter(Boolean);
  const matched = products.filter(p => {
    const text = [p.id, p.brand, p.type, p.category, p.description, ...p.highlights, ...Object.values(p.specs)].join(' ').toLocaleLowerCase('de');
    return (category === 'Alle' || category === p.category) && words.every(word => text.includes(word));
  });
  if (sort === 'price-up') matched.sort((a, b) => a.priceCents - b.priceCents);
  if (sort === 'price-down') matched.sort((a, b) => b.priceCents - a.priceCents);
  return matched;
}

export function inquiryText(cart, products) {
  const summary = cartSummary(cart, products);
  if (!summary.lines.length) throw new Error('Ihr Warenkorb ist noch leer.');
  const lines = summary.lines.map(p => `${p.quantity} × ${p.id} — ${p.type}\nEinzelpreis: ${money(p.priceCents)}; Position: ${money(p.lineCents)}\n${p.sourceUrl}`);
  return ['Guten Tag,', '', 'bitte senden Sie mir ein unverbindliches Angebot für folgende Artikel:', '', ...lines.flatMap(line => [line, '']), `Orientierungswert: ${money(summary.totalCents)} inkl. 19 % MwSt., zzgl. Versand.`, 'Preisstand BLR24: 29.09.2026. Bitte bestätigen Sie Preise, Versandkosten, Verfügbarkeit und Lieferzeit.', '', 'Firma / Name:', 'Lieferanschrift:', 'Telefon (optional):', 'Weitere Angaben:', '', 'Vielen Dank.'].join('\n');
}
