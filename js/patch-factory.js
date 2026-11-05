const fs = require('fs');
let L = fs.readFileSync('owner-dashboard.html', 'utf8').split('\n');
if (L.join('\n').includes('givebadge')) { console.log('ALREADY_PATCHED'); process.exit(0); }
let a = -1, b = -1;
for (let i = 0; i < L.length; i++) {
  if (a < 0 && L[i].includes("showTab('partners', this)")) a = i;
  if (b < 0 && L[i].includes("tab === 'partners'") && L[i].includes('loadPartnersTab')) b = i;
}
console.log('tab line:', a + 1, ' case line:', b + 1);
if (a < 0 || b < 0) { console.log('NOT_FOUND'); process.exit(1); }
const indA = L[a].match(/^\s*/)[0], indB = L[b].match(/^\s*/)[0];
L.splice(b + 1, 0, indB + "else if (tab === 'givebadge') loadGiveBadgeTab();");
L.splice(a + 1, 0, indA + '<div class="dashboard-tab" onclick="showTab(\'givebadge\', this)">🏅 Give badge</div>');
let out = L.join('\n');
if (out.includes('</body>') === false) { console.log('NO_BODY'); process.exit(1); }
out = out.replace('</body>', '<script src="js/owner-badges.js"></script>\n</body>');
fs.writeFileSync('owner-dashboard.html', out);
console.log('PATCHED');