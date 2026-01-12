// نظام إدارة الأصوات
const SoundManager = {
    // الأصوات المتاحة
    sounds: {
        success: null,
        error: null,
        click: null,
        notification: null,
        addToCart: null,
        removeFromCart: null,
        checkout: null
    },
    
    // حالة الصوت
    enabled: true,
    volume: 0.5,
    
    // تهيئة الأصوات
    init() {
        // تحميل إعدادات الصوت من LocalStorage
        const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
        this.enabled = settings.soundEnabled !== false;
        this.volume = settings.soundVolume || 0.5;
        
        // إنشاء عناصر الصوت
        this.sounds.success = this.createAudio();
        this.sounds.error = this.createAudio();
        this.sounds.click = this.createAudio();
        this.sounds.notification = this.createAudio();
        this.sounds.addToCart = this.createAudio();
        this.sounds.removeFromCart = this.createAudio();
        this.sounds.checkout = this.createAudio();
        
        // تعيين مستوى الصوت
        this.updateVolume(this.volume);
    },
    
    // إنشاء عنصر صوتي
    createAudio() {
        const audio = new Audio();
        audio.preload = 'auto';
        return audio;
    },
    
    // تشغيل صوت النجاح
    playSuccess() {
        if (!this.enabled) return;
        
        // محاكاة صوت النجاح بترددات مختلفة
        this.playTone(880, 0.2, 'sine');
        setTimeout(() => this.playTone(1047, 0.15, 'sine'), 100);
    },
    
    // تشغيل صوت الخطأ
    playError() {
        if (!this.enabled) return;
        
        // محاكاة صوت الخطأ بتردد منخفض
        this.playTone(220, 0.3, 'sawtooth');
        setTimeout(() => this.playTone(196, 0.2, 'sawtooth'), 150);
    },
    
    // تشغيل صوت النقر
    playClick() {
        if (!this.enabled) return;
        
        // صوت نقرة خفيفة
        this.playTone(800, 0.05, 'square');
    },
    
    // تشغيل صوت الإشعار
    playNotification() {
        if (!this.enabled) return;
        
        // صوت إشعار ثلاثي
        this.playTone(1000, 0.1, 'sine');
        setTimeout(() => this.playTone(1200, 0.1, 'sine'), 100);
        setTimeout(() => this.playTone(1400, 0.15, 'sine'), 200);
    },
    
    // تشغيل صوت الإضافة للسلة
    playAddToCart() {
        if (!this.enabled) return;
        
        // صوت رنان إيجابي
        this.playTone(523, 0.1, 'sine');
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 70);
        setTimeout(() => this.playTone(784, 0.15, 'sine'), 140);
    },
    
    // تشغيل صوت الحذف من السلة
    playRemoveFromCart() {
        if (!this.enabled) return;
        
        // صوت هابط
        this.playTone(784, 0.1, 'sine');
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 70);
        setTimeout(() => this.playTone(523, 0.1, 'sine'), 140);
    },
    
    // تشغيل صوت إتمام البيع
    playCheckout() {
        if (!this.enabled) return;
        
        // صوت احتفالي
        this.playTone(523, 0.1, 'sine');
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 80);
        setTimeout(() => this.playTone(784, 0.1, 'sine'), 160);
        setTimeout(() => this.playTone(1047, 0.2, 'sine'), 240);
    },
    
    // تشغيل نغمة بتردد محدد
    playTone(frequency, duration, type = 'sine') {
        try {
            // إنشاء سياق صوتي
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // إنشاء مذبذب
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // تكوين المذبذب
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            // تكوين مستوى الصوت
            gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            // توصيل العقد
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // تشغيل وإيقاف
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
            
            // إغلاق السياق بعد الانتهاء
            setTimeout(() => {
                audioContext.close();
            }, (duration * 1000) + 100);
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    },
    
    // تحديث مستوى الصوت
    updateVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // حفظ الإعدادات
        const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
        settings.soundVolume = this.volume;
        LocalDB.save(LocalDB.KEYS.SETTINGS, settings);
    },
    
    // تبديل حالة الصوت
    toggle() {
        this.enabled = !this.enabled;
        
        // حفظ الإعدادات
        const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
        settings.soundEnabled = this.enabled;
        LocalDB.save(LocalDB.KEYS.SETTINGS, settings);
        
        // إظهار إشعار
        showNotification(
            this.enabled ? 'تم تفعيل الأصوات' : 'تم كتم الأصوات',
            'info'
        );
        
        // تشغيل صوت تأكيد إذا تم التفعيل
        if (this.enabled) {
            this.playClick();
        }
    },
    
    // كتم الصوت
    mute() {
        this.enabled = false;
        
        const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
        settings.soundEnabled = false;
        LocalDB.save(LocalDB.KEYS.SETTINGS, settings);
    },
    
    // إلغاء الكتم
    unmute() {
        this.enabled = true;
        
        const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
        settings.soundEnabled = true;
        LocalDB.save(LocalDB.KEYS.SETTINGS, settings);
    }
};

// تهيئة نظام الأصوات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    SoundManager.init();
});

// تصدير للاستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}
