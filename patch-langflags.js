const fs = require('fs');
const re = /(<button[^>]*changeLanguage\('[^']*'\)[^>]*>)\s*([\u{1F1E6}-\u{1F1FF}]{2})/gu;
let total = 0;
function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.name === 'node_modules' || f.name === '.git' || f.name.startsWith('.')) continue;
    const p = dir + '/' + f.name;
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.html')) {
      const src = fs.readFileSync(p, 'utf8');
      let n = 0;
      const out = src.replace(re, (m, open, flag) => {
        const cc = [...flag].map(c => String.fromCharCode(c.codePointAt(0) - 0x1F1E6 + 97)).join('');
        n++;
        return open + '<img src="https://flagcdn.com/w20/' + cc + '.png" alt="" style="width:20px;height:14px;margin-inline-end:8px;vertical-align:middle;border-radius:2px;"> ';
      });
      if (n) { fs.writeFileSync(p, out); console.log(p, n); total += n; }
    }
  }
}
walk('.');
console.log('TOTAL', total);
