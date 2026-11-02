(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var me = null;
  window.supabaseClient.auth.getUser().then(function (r) {
    me = r.data && r.data.user ? r.data.user.id : null;
    if (window.loadJobs) window.loadJobs();
  });
  window.renderJobs = function (jobs) {
    var box = document.getElementById('jobsList');
    if (jobs.length === 0) { box.innerHTML = '<div style="text-align:center;padding:40px;color:#65676b;" data-i18n="no_jobs_found">🔍 No jobs found.</div>'; return; }
    box.innerHTML = jobs.map(function (j) {
      var del = (me && j.user_id === me) ? '<button onclick="deleteJob(\'' + j.id + '\')" style="float:right;background:#f0f2f5;border:0;border-radius:8px;padding:6px 10px;cursor:pointer;">🗑️</button>' : '';
      return '<div style="background:#f8f9fa;border-radius:12px;padding:20px;margin-bottom:15px;border-left:5px solid #1877f2;box-shadow:0 2px 4px rgba(0,0,0,.05);">' + del +
        '<div style="font-size:20px;font-weight:bold;color:#050505;margin-bottom:5px;">' + esc(j.title) + '</div>' +
        '<div style="color:#1877f2;font-weight:600;margin-bottom:10px;">🏢 ' + esc(j.company) + '</div>' +
        '<div style="display:flex;gap:15px;color:#65676b;font-size:14px;margin-bottom:10px;"><span>📍 ' + esc(j.location || 'Remote') + '</span><span>💰 ' + esc(j.salary || 'Negotiable') + '</span></div>' +
        '<div style="color:#65676b;font-size:14px;line-height:1.5;">' + esc(j.description) + '</div>' +
        '<a href="mailto:' + esc(j.contact_email) + '" style="display:inline-block;margin-top:15px;padding:8px 20px;background:#28a745;color:white;text-decoration:none;border-radius:8px;font-weight:bold;" data-i18n="apply_now">Apply Now</a></div>';
    }).join('');
  };
  window.deleteJob = async function (id) {
    if (confirm('Delete this job?') === false) return;
    var r = await window.supabaseClient.from('jobs').delete().eq('id', id);
    if (r.error) alert(r.error.message); else window.loadJobs();
  };
  var FIELDS = [['jTitle', 'Job title *'], ['jCompany', 'Company *'], ['jLocation', 'Location (e.g. Casablanca / Remote)'], ['jSalary', 'Salary (optional)'], ['jEmail', 'Contact email *']];
  function inp(id, ph) { return '<input id="' + id + '" placeholder="' + ph + '" style="width:100%;padding:10px 12px;border:1px solid #ccd0d5;border-radius:8px;margin-bottom:10px;font-size:15px;box-sizing:border-box;">'; }
  var modal = document.createElement('div');
  modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;align-items:center;justify-content:center;padding:16px;';
  modal.innerHTML = '<div style="background:#fff;border-radius:14px;padding:22px;width:100%;max-width:460px;max-height:90vh;overflow:auto;">' +
    '<h3 style="margin:0 0 14px;">➕ Post a job</h3>' + FIELDS.map(function (f) { return inp(f[0], f[1]); }).join('') +
    '<textarea id="jDesc" rows="4" placeholder="Description" style="width:100%;padding:10px 12px;border:1px solid #ccd0d5;border-radius:8px;margin-bottom:10px;font-size:15px;box-sizing:border-box;"></textarea>' +
    '<div id="jMsg" style="color:#dc3545;font-size:14px;min-height:18px;"></div>' +
    '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;"><button id="jCancel" style="padding:10px 18px;border:0;border-radius:8px;background:#e4e6eb;cursor:pointer;">Cancel</button>' +
    '<button id="jSave" style="padding:10px 18px;border:0;border-radius:8px;background:#1877f2;color:#fff;font-weight:bold;cursor:pointer;">Post</button></div></div>';
  document.body.appendChild(modal);
  var list = document.getElementById('jobsList');
  var btn = document.createElement('button');
  btn.textContent = '➕ Post a job';
  btn.style.cssText = 'margin:0 0 16px;padding:11px 22px;border:0;border-radius:10px;background:#1877f2;color:#fff;font-weight:bold;font-size:15px;cursor:pointer;';
  list.parentNode.insertBefore(btn, list);
  function val(id) { return document.getElementById(id).value.trim(); }
  btn.onclick = function () {
    if (me === null) { alert('Please log in first'); return; }
    document.getElementById('jMsg').textContent = '';
    modal.style.display = 'flex';
  };

  document.getElementById('jCancel').onclick = function () { modal.style.display = 'none'; };
  document.getElementById('jSave').onclick = async function () {
    var row = { title: val('jTitle'), company: val('jCompany'), location: val('jLocation'), salary: val('jSalary'), contact_email: val('jEmail'), description: val('jDesc') };
    if (row.title === '' || row.company === '' || row.contact_email === '') { document.getElementById('jMsg').textContent = 'Please fill the fields with *'; return; }
    var r = await window.supabaseClient.from('jobs').insert(row);
    if (r.error) { document.getElementById('jMsg').textContent = r.error.message; return; }
    modal.style.display = 'none';
    ['jTitle', 'jCompany', 'jLocation', 'jSalary', 'jEmail', 'jDesc'].forEach(function (i) { document.getElementById(i).value = ''; });
    window.loadJobs();
  };
})();
