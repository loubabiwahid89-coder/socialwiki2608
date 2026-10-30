window.loadPartnersTab = async function () {
  const box = document.getElementById('dashboardContent');
  if (!box) return;
  box.innerHTML = '<div style="padding:20px"><h2 style="margin:0 0 16px">🤝 Partners</h2><div id="ptList">Loading...</div></div>';
  const r = await window.supabaseClient.rpc('partner_stats');
  const el = document.getElementById('ptList');
  if (r.error) { el.textContent = 'Error: ' + r.error.message; return; }
  if (!r.data || !r.data.length) { el.textContent = 'No partners yet.'; return; }
  const esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  let h = '<table style="width:100%;border-collapse:collapse"><tr style="text-align:left"><th>Partner</th><th>Referrals</th><th>Percent %</th><th></th></tr>';
  r.data.forEach(function (x) {
    const com = Math.round(Number(x.pts) * Number(x.pct) / 100);
    h += '<tr style="border-top:1px solid #ddd"><td style="padding:10px 0"><a href="profile.html?id=' + x.user_id + '">' + esc(x.username) + '</a></td><td>' + x.ref_count + '</td>'
      + '<td><select id="pct_' + x.user_id + '" style="padding:4px">' + [5,10,15,30,40,50,70,90].map(function (n) { return '<option value="' + n + '"' + (Number(x.pct) === n ? ' selected' : '') + '>' + n + '%</option>'; }).join('') + '</select></td>'
      + '<td><button onclick="savePartnerPct(\'' + x.user_id + '\')" style="padding:4px 10px;cursor:pointer">Save</button></td></tr>';
  });
  el.innerHTML = h + '</table>';
};
window.savePartnerPct = async function (uid) {
  const v = parseFloat(document.getElementById('pct_' + uid).value);
  if (isNaN(v) || v < 0 || v > 100) { alert('Percent must be between 0 and 100'); return; }
  const r = await window.supabaseClient.from('partners').update({ commission_percent: v }).eq('user_id', uid).select();
  if (r.error) { alert('Error: ' + r.error.message); return; }
  if (!r.data || !r.data.length) { alert('Not allowed'); return; }
  window.loadPartnersTab();
};
