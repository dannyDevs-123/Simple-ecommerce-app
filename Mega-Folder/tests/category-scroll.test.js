const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '../frontend/index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '../frontend/js/app.js'), 'utf8');

const assertions = [
  { name: 'product section has id="products"', ok: /<section[^>]*id="products"[^>]*class="products-section"/.test(indexHtml) || /<section[^>]*class="products-section"[^>]*id="products"/.test(indexHtml), actual: 'Missing id="products" on the product section' },
  { name: 'category nav links point to #products', ok: /href="#products"/.test(indexHtml) || /href="#products"/.test(appJs), actual: 'Missing #products href on category links' },
  { name: 'smooth scroll is triggered on category filters', ok: /scrollIntoView\(\{\s*behavior:\s*'smooth'\s*\}\)/.test(appJs) || /scrollIntoView\(\{\s*behavior:\s*"smooth"\s*\}\)/.test(appJs), actual: 'Missing smooth scroll call' },
  { name: 'customer service links use info modal triggers', ok: /data-info-modal="(contact|shipping|returns|faq)"/.test(indexHtml), actual: 'Footer service links are not wired to modal data attributes' },
  { name: 'info modal markup exists', ok: /id="infoModalBackdrop"/.test(indexHtml) && /id="infoModalBody"/.test(indexHtml), actual: 'Modal DOM scaffold is missing' },
  { name: 'modal backdrop blur styling exists', ok: /backdrop-filter:\s*blur\(5px\)/.test(fs.readFileSync(path.join(__dirname, '../frontend/css/style.css'), 'utf8')), actual: 'Backdrop blur style is missing' },
  { name: 'escape key close logic exists', ok: /key === 'Escape'|key === "Escape"/.test(appJs), actual: 'Escape handling is missing' }
];

let failed = 0;
for (const assertion of assertions) {
  if (!assertion.ok) {
    failed += 1;
    console.error(`FAIL: ${assertion.name} - ${assertion.actual}`);
  }
}

if (failed > 0) {
  process.exit(1);
}

console.log('PASS: category-scroll regression checks');
