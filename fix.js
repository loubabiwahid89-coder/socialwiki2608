const fs = require('fs');
const path = './js/translations.js';

let content = fs.readFileSync(path, 'utf8');
let fixes = 0;

// Fix 1: es - فاصلة مفقودة
const b1 = content;
content = content.replace(
  /"parchisi_success": "Éxito"\s*\r?\n(\s*)"leaderboard"/g,
  '"parchisi_success": "Éxito",\n$1"leaderboard"'
);
if (content !== b1) { fixes++; console.log('✅ Fix 1: es'); }

// Fix 2: tl - حذف التعليق
const b2 = content;
content = content.replace(
  /"rewards_shop_title": "🎁 Tindahan ng Gantimpala",\s*\/\/[^\r\n]*/g,
  '"rewards_shop_title": "🎁 Tindahan ng Gantimpala",'
);
if (content !== b2) { fixes++; console.log('✅ Fix 2: tl'); }

// Fix 3: am - نص عربي
const b3 = content;
content = content.replace(
  /"suggestions": " اقتراحات",/g,
  '"suggestions": "ምክሮች",'
);
if (content !== b3) { fixes++; console.log('✅ Fix 3: am'); }

// Fix 4: ja - كلمة روسية
const b4 = content;
content = content.replace(
  /"please_login": " сначалаログインしてください！",/g,
  '"please_login": "まずログインしてください！",'
);
if (content !== b4) { fixes++; console.log('✅ Fix 4: ja'); }

fs.writeFileSync(path, content, 'utf8');
console.log('');
console.log('🎉 Done! ' + fixes + '/4 fixes applied.');
