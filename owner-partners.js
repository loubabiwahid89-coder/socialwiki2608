// =========================================================
// 🤝 OWNER PARTNERS TAB (MODERN CARD DESIGN)
// =========================================================

async function loadPartnersTab() {
    const container = document.getElementById('dashboardContent');
    if (!container) return;

    // عرض حالة التحميل
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner">⏳</div>
            <p>Loading partners...</p>
        </div>
    `;

    try {
        // جلب الشركاء من جدول profiles حيث is_partner = true
        const { data: partners, error } = await supabaseClient
            .from('profiles')
            .select('id, username, full_name, avatar_url, referrals_count, partner_percentage')
            .eq('is_partner', true);

        if (error) {
            console.error('Error loading partners:', error);
            container.innerHTML = `
                <div class="data-table" style="padding:20px;text-align:center;color:#dc3545;">
                    <p>❌ Error: ${error.message}</p>
                </div>
            `;
            return;
        }

        // إذا لم يوجد شركاء
        if (!partners || partners.length === 0) {
            container.innerHTML = `
                <div style="padding:60px 20px;text-align:center;">
                    <div style="font-size:70px;margin-bottom:15px;opacity:0.3;">🤝</div>
                    <h3 style="margin:0 0 8px 0;color:#050505;">No Partners Yet</h3>
                    <p style="color:#65676b;margin:0;">When a user invites 4 friends, they will appear here automatically.</p>
                </div>
            `;
            return;
        }

        // حساب الإحصائيات
        const totalPartners = partners.length;
        const totalReferrals = partners.reduce((sum, p) => sum + (p.referrals_count || 0), 0);

        // بناء التصميم الجديد
        container.innerHTML = `
            <div style="padding: 20px; animation: fadeIn 0.4s ease-in-out;">
                
                <!-- الإحصائيات -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, #1877f2, #0a58ca); color: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(24,119,242,0.3);">
                        <div style="font-size: 30px; margin-bottom: 5px;">👑</div>
                        <div style="font-size: 28px; font-weight: 800;">${totalPartners}</div>
                        <div style="font-size: 13px; opacity: 0.9;">Active Partners</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #28a745, #1e7e34); color: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(40,167,69,0.3);">
                        <div style="font-size: 30px; margin-bottom: 5px;">👥</div>
                        <div style="font-size: 28px; font-weight: 800;">${totalReferrals}</div>
                        <div style="font-size: 13px; opacity: 0.9;">Total Referrals</div>
                    </div>
                </div>

                <!-- شبكة الشركاء -->
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                    ${partners.map(partner => {
                        const name = partner.full_name || partner.username || 'User';
                        const avatar = partner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1877f2&color=fff`;
                        const referrals = partner.referrals_count || 0;
                        const percentage = partner.partner_percentage || 10;

                        return `
                            <div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e4e6eb; transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden;" 
                                 onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.12)'" 
                                 onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'">
                                
                                <!-- شارة النسبة -->
                                <div style="position: absolute; top: 15px; right: 15px; background: #fff3cd; color: #856404; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;">
                                    ⭐ ${percentage}% Share
                                </div>

                                <!-- الصورة والاسم -->
                                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; margin-top: 10px;">
                                    <img src="${avatar}" style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid #1877f2; object-fit: cover;">
                                    <div>
                                        <div style="font-weight: 700; font-size: 16px; color: #050505;">${escapeHtml(name)}</div>
                                        <div style="font-size: 13px; color: #65676b;">@${escapeHtml(partner.username || 'user')}</div>
                                    </div>
                                </div>

                                <!-- صندوق الإحصائيات -->
                                <div style="background: #f0f2f5; border-radius: 12px; padding: 15px; display: flex; justify-content: space-between; margin-bottom: 15px;">
                                    <div style="text-align: center; flex: 1;">
                                        <div style="font-size: 20px; font-weight: 800; color: #1877f2;">${referrals}</div>
                                        <div style="font-size: 11px; color: #65676b; font-weight: 600;">Referrals</div>
                                    </div>
                                    <div style="width: 1px; background: #ddd; margin: 0 10px;"></div>
                                    <div style="text-align: center; flex: 1;">
                                        <div style="font-size: 20px; font-weight: 800; color: #28a745;">Active</div>
                                        <div style="font-size: 11px; color: #65676b; font-weight: 600;">Status</div>
                                    </div>
                                </div>

                                <!-- أزرار التحكم -->
                                <div style="display: flex; gap: 10px;">
                                    <button onclick="window.location.href='profile.html?id=${partner.id}'" 
                                            style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: #e7f3ff; color: #1877f2; font-weight: 700; cursor: pointer; transition: 0.2s;" 
                                            onmouseover="this.style.background='#1877f2'; this.style.color='white'" 
                                            onmouseout="this.style.background='#e7f3ff'; this.style.color='#1877f2'">
                                        👤 Profile
                                    </button>
                                    <button onclick="removePartner('${partner.id}')" 
                                            style="flex: 1; padding: 10px; border: none; border-radius: 8px; background: #ffebe9; color: #dc3545; font-weight: 700; cursor: pointer; transition: 0.2s;" 
                                            onmouseover="this.style.background='#dc3545'; this.style.color='white'" 
                                            onmouseout="this.style.background='#ffebe9'; this.style.color='#dc3545'">
                                        🗑️ Remove
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;

    } catch (err) {
        console.error('Crash:', err);
        container.innerHTML = `
            <div class="data-table" style="padding:20px;text-align:center;color:#dc3545;">
                <p>❌ Error: ${err.message}</p>
            </div>
        `;
    }
}

// دالة إزالة الشريك
async function removePartner(userId) {
    if (!confirm('Are you sure you want to remove this partner?')) return;

    try {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ is_partner: false, partner_percentage: 0 })
            .eq('id', userId);

        if (error) throw error;

        alert('✅ Partner removed successfully!');
        loadPartnersTab(); // تحديث العرض

    } catch (err) {
        alert('❌ Error: ' + err.message);
    }
}

// تصدير الدوال لتكون متاحة عالمياً
window.loadPartnersTab = loadPartnersTab;
window.removePartner = removePartner;