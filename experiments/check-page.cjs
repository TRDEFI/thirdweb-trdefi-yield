const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const h = fs.readFileSync('index.html', 'utf8');
const blocks = [...h.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)];
const tmp = path.join(os.tmpdir(), 'pagemod.mjs');
fs.writeFileSync(tmp, blocks.map(b => b[1]).join('\n'));
try {
  execSync('node --check ' + tmp, { stdio: 'pipe' });
  console.log('module syntax: OK');
} catch (e) {
  console.log('module syntax: FAIL');
  console.log((e.stdout || '').toString().split('\n').slice(0, 10).join('\n'));
  process.exit(1);
}
console.log('exitStrategy:', (h.match(/exitStrategy/g) || []).length,
  '| shipMainnet:', (h.match(/shipMainnet/g) || []).length,
  '| __exitPos:', (h.match(/__exitPos/g) || []).length,
  '| __exitTrial:', (h.match(/__exitTrial/g) || []).length,
  '| deskBtn:', (h.match(/deskBtn/g) || []).length,
  '| mobBtn:', (h.match(/mobBtn/g) || []).length);
