import fs from 'node:fs';
import { products } from '../dist/shop/products.mjs';
import { productCard } from '../dist/shop/shop-views.mjs';
const path = 'dist/shop/index.html';
const html = fs.readFileSync(path, 'utf8');
fs.writeFileSync(path, html.replace(/<!--PRODUCTS_START-->[\s\S]*?<!--PRODUCTS_END-->/, '<!--PRODUCTS_START-->\n' + products.map(productCard).join('\n') + '\n<!--PRODUCTS_END-->'));
console.log(`Rendered ${products.length} product cards.`);
