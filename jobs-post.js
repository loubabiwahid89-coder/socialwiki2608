// ==========================================
// 📝 POST A JOB MODAL
// ==========================================

window.openPostJobModal = function() {
    // إنشاء النافذة المنبثقة (Modal) برمجياً
    const modal = document.createElement('div');
    modal.id = 'postJobModal';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:99999; display:flex; align-items:center; justify-content:center; padding:20px;';
    
    modal.innerHTML = `
        <div style="background:white; border-radius:12px; padding:25px; width:100%; max-width:500px; box-shadow:0 10px 30px rgba(0,0,0,0.3); max-height:90vh; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; font-size:20px; color:#1877f2;">💼 Post a New Job</h3>
                <button onclick="document.getElementById('postJobModal').remove()" style="background:none; border:none; font-size:24px; cursor:pointer; color:#65676b;">✕</button>
            </div>

            <form id="postJobForm" onsubmit="submitJob(event)">
                <div style="margin-bottom:15px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Job Title</label>
                    <input type="text" id="jobTitle" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                </div>
                <div style="margin-bottom:15px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Company Name</label>
                    <input type="text" id="jobCompany" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                </div>
                <div style="margin-bottom:15px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Location</label>
                    <input type="text" id="jobLocation" placeholder="e.g. Casablanca, Remote" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                </div>
                <div style="margin-bottom:15px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Salary (Optional)</label>
                    <input type="text" id="jobSalary" placeholder="e.g. 5000 MAD, Negotiable" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                </div>
                <div style="margin-bottom:15px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Description</label>
                    <textarea id="jobDescription" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; min-height:100px;"></textarea>
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Contact Email</label>
                    <input type="email" id="jobEmail" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
                </div>
                <button type="submit" style="width:100%; padding:12px; background:#1877f2; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:16px;">🚀 Publish Job</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
};

window.submitJob = async function(event) {
    event.preventDefault();
    
    const title = document.getElementById('jobTitle').value;
    const company = document.getElementById('jobCompany').value;
    const location = document.getElementById('jobLocation').value;
    const salary = document.getElementById('jobSalary').value;
    const description = document.getElementById('jobDescription').value;
    const email = document.getElementById('jobEmail').value;

    try {
        // جلب المستخدم الحالي
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            alert('Please login first!');
            return;
        }

        // إدخال الوظيفة في قاعدة البيانات
        const { error } = await window.supabaseClient
            .from('jobs')
            .insert({
                title: title,
                company: company,
                location: location,
                salary: salary,
                description: description,
                contact_email: email,
                user_id: user.id // لربط الوظيفة بصاحبها
            });

        if (error) throw error;

        alert('✅ Job posted successfully!');
        document.getElementById('postJobModal').remove();
        loadJobs(); // إعادة تحميل القائمة

    } catch (error) {
        console.error('Error posting job:', error);
        alert('❌ Error: ' + error.message);
    }
};