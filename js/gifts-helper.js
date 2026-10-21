// =========================================================
// FREE GIFTS SYSTEM
// =========================================================

const FREE_GIFTS = [
    { id: 'rose',   emoji: '🌹', name: 'Rose',   cost: 1 },
    { id: 'heart',  emoji: '❤️', name: 'Heart',  cost: 1 },
    { id: 'coffee', emoji: '☕', name: 'Coffee', cost: 2 },
    { id: 'cake',   emoji: '🎂', name: 'Cake',   cost: 5 },
    { id: 'teddy',  emoji: '🧸', name: 'Teddy',  cost: 5 },
];

window.currentGiftPostId = null;
window.currentGiftReceiverId = null;

window.openGiftModal = async function(postId, receiverId) {
    window.currentGiftPostId = postId;
    window.currentGiftReceiverId = receiverId;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { alert('Please login first'); return; }

    // جلب رصيد نقاط الهدايا
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('gift_points')
        .eq('id', user.id)
        .single();

    const balance = profile?.gift_points || 0;

    // بناء شبكة الهدايا
    const giftsHTML = FREE_GIFTS.map(g => `
        <button onclick="sendFreeGift('${g.id}', ${g.cost})" 
                style="background:#f0f2f5; border:2px solid transparent; border-radius:12px; padding:15px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:5px; transition:0.2s;"
                onmouseover="this.style.borderColor='#1877f2'"
                onmouseout="this.style.borderColor='transparent'">
            <span style="font-size:32px;">${g.emoji}</span>
            <span style="font-weight:700; font-size:13px; color:#333;">${g.name}</span>
            <span style="font-size:11px; color:#65676b;">${g.cost} pts</span>
        </button>
    `).join('');

    let modal = document.getElementById('giftModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'giftModal';
        modal.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:99999; align-items:center; justify-content:center; padding:20px;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:white; border-radius:16px; padding:25px; width:100%; max-width:400px; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,0.3);">
            <h3 style="margin:0 0 10px 0;">🎁 Send a Gift</h3>
            <p style="color:#65676b; font-size:14px; margin:0 0 20px 0;">Your Gift Points: <strong style="color:#f7b928;">${balance}</strong></p>
            
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(90px, 1fr)); gap:10px; margin-bottom:20px;">
                ${giftsHTML}
            </div>

            <button onclick="document.getElementById('giftModal').style.display='none'" 
                    style="width:100%; padding:12px; background:#e4e6eb; border:none; border-radius:8px; font-weight:600; cursor:pointer;">
                Cancel
            </button>
        </div>
    `;

    modal.style.display = 'flex';
};

window.sendFreeGift = async function(giftId, cost) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data: sender } = await supabaseClient.from('profiles').select('gift_points').eq('id', user.id).single();
        if ((sender?.gift_points || 0) < cost) {
            alert('❌ Not enough gift points! Complete tasks to earn more.');
            return;
        }

        // خصم من المرسل
        await supabaseClient.from('profiles').update({ gift_points: sender.gift_points - cost }).eq('id', user.id);

        // تسجيل الهدية
        await supabaseClient.from('sent_gifts').insert({
            sender_id: user.id,
            receiver_id: window.currentGiftReceiverId,
            post_id: window.currentGiftPostId,
            gift_type: giftId,
            points_cost: cost
        });

        // إرسال إشعار
        await supabaseClient.from('notifications').insert({
            receiver_id: window.currentGiftReceiverId,
            sender_id: user.id,
            type: 'gift',
            message: `🎁 You received a gift on your content! Keep up the great work!`,
            is_read: false
        });

        alert('✅ Gift sent successfully!');
        document.getElementById('giftModal').style.display = 'none';

    } catch (err) {
        console.error('Gift error:', err);
        alert('❌ Error: ' + err.message);
    }
};