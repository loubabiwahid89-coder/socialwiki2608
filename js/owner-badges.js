/* Owner dashboard: give / remove badges without SQL. */
window.loadGiveBadgeTab = function () {
  var box = document.getElementById('dashboardContent');
  if (box === null) return;
  var sb = window.supabaseClient, picked = null;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var PRESETS = {
    factory: { key: 'verified_factory', label: 'Verified Factory', icon: '🏭', color: 'factory', name: '🏭 Verified Factory (red & gold)' },
    seller: { key: 'seller_verified', label: 'Seller Verified', icon: '🛒', color: 'seller', name: '🛒 Seller Verified (gold)' },
    verified: { key: 'verified', label: 'Verified Account', icon: '✅', color: 'blue', name: '✅ Verified Account (blue)' }
  };
  var F = 'padding:9px 12px;border:1px solid #ccd0d5;border-radius:8px;font-size:14px;';
  var B = 'padding:9px 16px;border:0;border-radius:8px;background:#1877f2;color:#fff;font-weight:bold;cursor:pointer;';
  box.innerHTML = '<div style="padding:20px;max-width:640px">' +
    '<h2 style="margin:0 0 6px">🏅 Give badge</h2><p style="margin:0 0 16px;color:#65676b">Search a user, choose a badge and a country, then press Give.</p>' +
    '<div style="display:flex;gap:8px;margin-bottom:12px"><input id="gbQ" placeholder="username (e.g. zhenghaochen317)" style="' + F + 'flex:1"><button id="gbSearch" style="' + B + '">Search</button></div>' +
    '<div id="gbRes"></div><div id="gbPick"></div></div>';

  function msg(t, ok) { var m = document.getElementById('gbMsg'); if (m) { m.style.color = ok ? '#28a745' : '#dc3545'; m.textContent = t; } }

  async function search() {
    var q = document.getElementById('gbQ').value.trim(), res = document.getElementById('gbRes');
    if (q === '') { res.textContent = ''; return; }
    res.textContent = 'Searching...';
    var r = await sb.from('profiles').select('id, username, full_name, country').ilike('username', '%' + q + '%').limit(8);
    if (r.error) { res.textContent = 'Error: ' + r.error.message; return; }
    if (r.data.length === 0) { res.textContent = 'No user found.'; return; }
    res.innerHTML = r.data.map(function (u, i) { return '<button data-i="' + i + '" style="display:block;width:100%;text-align:left;margin-bottom:6px;' + F + 'background:#f0f2f5;cursor:pointer">' + esc(u.username) + ' <span style="color:#65676b">' + esc(u.full_name || '') + ' ' + esc(u.country || '') + '</span></button>'; }).join('');
    res.querySelectorAll('button').forEach(function (b) { b.onclick = function () { pick(r.data[+b.getAttribute('data-i')]); }; });
  }

  async function pick(u) {
    picked = u;
    document.getElementById('gbRes').textContent = '';
    var p = document.getElementById('gbPick');
    p.innerHTML = '<div style="background:#f8f9fa;border-radius:12px;padding:16px;margin-top:8px"><b>' + esc(u.username) + '</b> <a href="profile.html?id=' + u.id + '" target="_blank">open profile</a>' +
      '<div id="gbCur" style="margin:12px 0"></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><select id="gbType" style="' + F + '">' + Object.keys(PRESETS).map(function (k) { return '<option value="' + k + '">' + esc(PRESETS[k].name) + '</option>'; }).join('') + '</select>' +
      '<input id="gbCountry" maxlength="2" placeholder="CN" value="' + esc((u.country || '').toUpperCase()) + '" style="' + F + 'width:70px;text-transform:uppercase;text-align:center"><button id="gbGive" style="' + B + '">Give badge</button></div>' +
      '<div id="gbMsg" style="margin-top:10px;min-height:18px"></div></div>';
    document.getElementById('gbGive').onclick = give;
    showCurrent();
  }

  async function showCurrent() {
    var el = document.getElementById('gbCur');
    var r = await sb.from('user_badges').select('badge_key, badge_label, badge_icon, country_code').eq('user_id', picked.id);
    if (r.error) { el.textContent = 'Error: ' + r.error.message; return; }
    if (r.data.length === 0) { el.textContent = 'No badges yet.'; return; }
    el.innerHTML = r.data.map(function (b) { return '<span style="display:inline-flex;gap:6px;align-items:center;background:#e7f3ff;border-radius:999px;padding:4px 10px;margin:0 6px 6px 0;font-size:13px">' + esc(b.badge_icon) + ' ' + esc(b.badge_label) + ' ' + esc(b.country_code || '') + ' <button data-k="' + esc(b.badge_key) + '" style="border:0;background:none;cursor:pointer;color:#dc3545" title="Remove">✕</button></span>'; }).join('');
    el.querySelectorAll('button').forEach(function (b) { b.onclick = function () { remove(b.getAttribute('data-k')); }; });
  }

  async function give() {
    var t = PRESETS[document.getElementById('gbType').value];
    var cc = document.getElementById('gbCountry').value.trim().toUpperCase();
    if (cc !== '' && /^[A-Z]{2}$/.test(cc) === false) { msg('Country must be 2 letters (e.g. CN)', false); return; }
    var r = await sb.rpc('owner_give_badge', { p_user: picked.id, p_key: t.key, p_label: t.label, p_icon: t.icon, p_color: t.color, p_country: cc === '' ? null : cc });
    if (r.error) { msg('Error: ' + r.error.message, false); return; }
    msg('Done ✔ badge given to ' + picked.username, true);
    showCurrent();
  }

  async function remove(key) {
    var r = await sb.rpc('owner_remove_badge', { p_user: picked.id, p_key: key });
    if (r.error) { msg('Error: ' + r.error.message, false); return; }
    msg('Badge removed', true);
    showCurrent();
  }

  document.getElementById('gbSearch').onclick = search;
  document.getElementById('gbQ').onkeydown = function (e) { if (e.key === 'Enter') search(); };
};