// =========================================================
// TASKS HELPER - نظام التحقق من المهام الحقيقي
// SocialWiki
// =========================================================

/**
 * إكمال مهمة بعد التحقق الحقيقي من الحدث
 * @param {string} taskKey - مفتاح المهمة (مثل 'like_3_posts')
 * @returns {Promise<void>}
 */
window.verifyAndCompleteTask = async function(taskKey) {
    if (!window.supabaseClient) {
        console.warn('⚠️ Supabase not loaded');
        return;
    }

    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (!user) {
            console.warn('⚠️ User not logged in');
            return;
        }

        const { data, error } = await window.supabaseClient.rpc('complete_task', {
            p_user_id: user.id,
            p_task_key: taskKey
        });

        if (error) {
            console.error('❌ Task error:', error);
            return;
        }

        if (data && data.success) {
            if (data.completed) {
                console.log('✅ Task completed:', taskKey, '+', data.points, 'points');
                
                // إظهار إشعار النقاط
                if (typeof window.showPointsNotification === 'function') {
                    window.showPointsNotification(data.points);
                } else {
                    // إشعار افتراضي
                    const toast = document.createElement('div');
                    toast.style.cssText = `
                        position: fixed; top: 80px; right: 20px;
                        background: linear-gradient(135deg, #ffd700, #f7b928);
                        color: #333; padding: 15px 25px; border-radius: 12px;
                        font-weight: 700; z-index: 99999;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    `;
                    toast.textContent = `🎉 +${data.points} نقاط! (${taskKey})`;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3500);
                }

                // تحديث شارة النقاط في النافبار
                if (typeof window.updatePointsBadge === 'function') {
                    window.updatePointsBadge();
                }
            } else {
                console.log('📊 Progress:', taskKey, data.progress, '/', data.goal);
            }
        }
    } catch (error) {
        console.error('❌ Task verification error:', error);
    }
};

/**
 * إكمال عدة مهام دفعة واحدة
 * @param {string[]} taskKeys - مصفوفة من مفاتيح المهام
 */
window.verifyAndCompleteTasks = async function(taskKeys) {
    for (const key of taskKeys) {
        await window.verifyAndCompleteTask(key);
    }
};

console.log('✅ tasks-helper.js loaded');