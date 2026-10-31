const fs = require('fs');
let L = fs.readFileSync('index.html', 'utf8').split('\n');
let a = -1, b = -1;
for (let i = 1900; i < 1960; i++) {
  if (a < 0 && L[i].includes("const { data: profiles }") && L[i].includes("avatar_url')")) a = i;
}
for (let i = 1980; i < 2020; i++) {
  if (b < 0 && L[i].includes('class="feed-name"')) b = i;
}
console.log('select line:', a + 1, ' name line:', b + 1);
if (a < 0 || b < 0) { console.log('NOT FOUND'); process.exit(1); }
L[a] = L[a].replace("avatar_url')", "avatar_url, country')");
const flag = '${profile.country ? `<img src="https://flagcdn.com/w20/${profile.country.toLowerCase()}.png" alt="" style="width:18px;height:13px;margin-left:6px;vertical-align:middle;border-radius:2px;">` : ""}';
L[b] = L[b].replace('${escapeHtml(username)}', '${escapeHtml(username)}' + flag);
fs.writeFileSync('index.html', L.join('\n'));
console.log('done');
