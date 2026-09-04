const fs = require('fs');
const h = fs.readFileSync('index.html', 'utf8');
const blocks = [...h.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
let d = 0, paren = 0;
for (const b of blocks) {
  const code = b[1].replace(/^import[^;]+;/gm, '');
  for (const c of code) {
    if (c === '{') d++;
    if (c === '}') d--;
    if (c === '(') paren++;
    if (c === ')') paren--;
  }
}
console.log('module brace balance:', d, '| paren balance:', paren);
console.log('exitStrategy:', (h.match(/exitStrategy/g) || []).length,
  '| shipMainnet:', (h.match(/shipMainnet/g) || []).length,
  '| __exitPos:', (h.match(/__exitPos/g) || []).length,
  '| deskBtn:', (h.match(/deskBtn/g) || []).length,
  '| mobBtn:', (h.match(/mobBtn/g) || []).length);
