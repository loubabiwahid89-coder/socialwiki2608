// =========================================================
// STARS SYSTEM - SHARED HELPER
// =========================================================

// متغيرات عامة
window.currentStarsPostId = null;
window.currentStarsReceiverId = null;

// 1. فتح نافذة إرسال النجوم
window.openStarModal = async function(postId, receiverId) {
    window.currentStarsPostId = postId;
    window.currentStarsReceiverId = receiverId;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('Please login first'); return; }

    // جلب رصيد النجوم
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('stars_balance')
        .eq('id', user.id)
        .single();

    const balance = profile?.stars_balance || 0;
    
    // إنشاء النافذة إذا لم تكن موجودة
    let modal = document.getElementById('starsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'starsModal';
        modal.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:99999; align-items:center; justify-content:center; padding:20px;';
        modal.innerHTML = `
            <div style="background:white; border-radius:16px; padding:25px; width:100%; max-width:350px; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,0.3);">
                <h3 style="margin:0 0 10px 0;">⭐ Send Stars</h3>
                <p style="color:#65676b; font-size:14px; margin:0 0 15px 0;">Your Balance: <strong id="starBalanceDisplay">0</strong> ⭐</p>
                <input type="number" id="starAmountInput" min="1" value="1" style="width:100%; padding:12px; border:2px solid #ddd; border-radius:8px; font-size:16px; text-align:center; margin-bottom:15px; box-sizing:border-box;">
                <div style="display:flex; gap:10px;">
                    <button onclick="document.getElementById('starsModal').style.display='none'" style="flex:1; padding:12px; background:#e4e6eb; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Cancel</button>
                    <button onclick="window.sendStars()" style="flex:1; padding:12px; background:#1877f2; color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer;">Send ⭐</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('starBalanceDisplay').textContent = balance;
    modal.style.display = 'flex';
};

// 2. إرسال النجوم
window.sendStars = async function() {
    const amount = parseInt(document.getElementById('starAmountInput').value);
    if (!amount || amount <= 0) { alert('❌ Enter a valid amount'); return; }

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        // جلب رصيد المرسل
        const { data: sender } = await supabaseClient.from('profiles').select('stars_balance').eq('id', user.id).single();
        if ((sender?.stars_balance || 0) < amount) {
            alert('❌ Insufficient stars balance! Please buy more stars.');
            return;
        }

        // خصم من المرسل
        await supabaseClient.from('profiles').update({ stars_balance: sender.stars_balance - amount }).eq('id', user.id);

        // إضافة للمستلم (70%)
        const receiverShare = Math.floor(amount * 0.70);
        const { data: receiver } = await supabaseClient.from('profiles').select('stars_balance').eq('id', window.currentStarsReceiverId).single();
        await supabaseClient.from('profiles').update({ stars_balance: (receiver?.stars_balance || 0) + receiverShare }).eq('id', window.currentStarsReceiverId);

        // تسجيل العملية
        await supabaseClient.from('post_stars').insert({
            sender_id: user.id,
            receiver_id: window.currentStarsReceiverId,
            post_id: window.currentStarsPostId,
            stars_amount: amount
        });

        // إرسال إشعار
        await supabaseClient.from('notifications').insert({
            receiver_id: window.currentStarsReceiverId,
            sender_id: user.id,
            type: 'stars_received',
            message: `⭐ You received ${receiverShare} stars on your content! Keep up the great work!`,
            is_read: false
        });

        alert(`✅ Sent ${amount} stars! The creator received ${receiverShare} stars (70%).`);
        document.getElementById('starsModal').style.display = 'none';
        
        // إعادة تحميل الصفحة لتحديث الرصيد
        window.location.reload();
        
    } catch (err) {
        console.error('Star send error:', err);
        alert('❌ Error: ' + err.message);
    }
};