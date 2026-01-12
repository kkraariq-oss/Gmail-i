// نظام إدارة الأصوات
class SoundManager {
    constructor() {
        this.sounds = {
            addToCart: this.createBeep(800, 100, 0.3),
            removeFromCart: this.createBeep(400, 100, 0.2),
            completeSale: this.createSuccessSound(),
            error: this.createBeep(200, 200, 0.4)
        };
    }

    // إنشاء صوت beep بسيط
    createBeep(frequency, duration, volume) {
        return () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        };
    }

    // صوت النجاح (نغمتين)
    createSuccessSound() {
        return () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // النغمة الأولى
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            osc1.connect(gain1);
            gain1.connect(audioContext.destination);
            osc1.frequency.value = 523.25; // C5
            osc1.type = 'sine';
            gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            osc1.start(audioContext.currentTime);
            osc1.stop(audioContext.currentTime + 0.2);

            // النغمة الثانية
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.frequency.value = 659.25; // E5
            osc2.type = 'sine';
            gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            osc2.start(audioContext.currentTime + 0.15);
            osc2.stop(audioContext.currentTime + 0.4);
        };
    }

    // تشغيل صوت
    play(soundName) {
        try {
            const settings = LocalDB.get(LocalDB.KEYS.SETTINGS) || {};
            if (settings.soundEnabled !== false) { // افتراضياً مفعل
                if (this.sounds[soundName]) {
                    this.sounds[soundName]();
                }
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }
}

// إنشاء نسخة عامة
const soundManager = new SoundManager();
