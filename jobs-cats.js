// ==========================================
// 📂 JOB CATEGORIES FILTER
// ==========================================

window.filterByCategory = function(category) {
    // إزالة التفعيل من كل الأزرار
    document.querySelectorAll('.right-box a').forEach(a => {
        a.style.background = '';
        a.style.color = '';
        a.style.fontWeight = '';
    });
    
    // تفعيل الزر المضغوط
    if (window.event && window.event.target) {
        const clickedBtn = window.event.target.closest('a');
        if (clickedBtn) {
            clickedBtn.style.background = '#e7f3ff';
            clickedBtn.style.color = '#1877f2';
            clickedBtn.style.fontWeight = 'bold';
        }
    }

    // الفلترة
    if (category === 'all') {
        renderJobs(allJobs);
    } else {
        const filtered = allJobs.filter(job => 
            (job.category && job.category.toLowerCase() === category.toLowerCase()) || 
            (job.title && job.title.toLowerCase().includes(category.toLowerCase()))
        );
        renderJobs(filtered);
    }
};