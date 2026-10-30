window.loadPartnersTab = async function () {
  const box = document.getElementById('dashboardContent');
  if (!box) return;
  box.innerHTML = '<div style="padding:20px"><h2 style="margin:0 0 16px">🤝 Partners</h2><div id="ptList">Loading...</div></div>';
  const r = await window.supabaseClient.rpc('partner_stats');
  const el = document.getElementById('ptList');
  if (r.error) { el.textContent = 'Error: ' + r.error.message; return; }
  if (!r.data || !r.data.length) { el.textContent = 'No partners yet.'; return; }
  const esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  let h = '<table style="width:100%;border-collapse:collapse"><tr style="text-align:left"><th>Partner</th><th>Referrals</th><th>Points</th></tr>';
  r.data.forEach(function (x) {
    h += '<tr style="border-top:1px solid #ddd"><td style="padding:10px 0"><a href="profile.html?id=' + x.user_id + '">' + esc(x.username) + '</a></td><td>' + x.ref_count + '</td><td>' + x.pts + '</td></tr>';
  });
  el.innerHTML = h + '</table>';
};
