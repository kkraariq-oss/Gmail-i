// إعدادات Firebase
// قم بتغيير هذه الإعدادات بإعدادات مشروعك الخاص من Firebase Console

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// تهيئة Firebase
let firebaseApp;
let database;
let auth;
let storage;

try {
    // استخدام Firebase من CDN
    if (typeof firebase !== 'undefined') {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        auth = firebase.auth();
        storage = firebase.storage();
        console.log('Firebase initialized successfully');
    }
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

// دوال مساعدة لـ Firebase
const FirebaseDB = {
    // حفظ البيانات
    async save(path, data) {
        try {
            if (!database) {
                console.warn('Firebase not initialized, saving locally only');
                return { success: true, local: true };
            }
            await database.ref(path).set(data);
            return { success: true, message: 'تم الحفظ بنجاح' };
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            return { success: false, error: error.message };
        }
    },

    // تحديث البيانات
    async update(path, data) {
        try {
            if (!database) {
                console.warn('Firebase not initialized, updating locally only');
                return { success: true, local: true };
            }
            await database.ref(path).update(data);
            return { success: true, message: 'تم التحديث بنجاح' };
        } catch (error) {
            console.error('Error updating Firebase:', error);
            return { success: false, error: error.message };
        }
    },

    // جلب البيانات
    async get(path) {
        try {
            if (!database) {
                console.warn('Firebase not initialized');
                return { success: false, error: 'Firebase not initialized' };
            }
            const snapshot = await database.ref(path).once('value');
            return { success: true, data: snapshot.val() };
        } catch (error) {
            console.error('Error getting from Firebase:', error);
            return { success: false, error: error.message };
        }
    },

    // حذف البيانات
    async delete(path) {
        try {
            if (!database) {
                console.warn('Firebase not initialized');
                return { success: true, local: true };
            }
            await database.ref(path).remove();
            return { success: true, message: 'تم الحذف بنجاح' };
        } catch (error) {
            console.error('Error deleting from Firebase:', error);
            return { success: false, error: error.message };
        }
    },

    // الاستماع للتغييرات
    listen(path, callback) {
        if (!database) {
            console.warn('Firebase not initialized');
            return null;
        }
        return database.ref(path).on('value', (snapshot) => {
            callback(snapshot.val());
        });
    },

    // إيقاف الاستماع
    stopListening(path, callback) {
        if (!database) return;
        database.ref(path).off('value', callback);
    }
};

// رفع الملفات إلى Firebase Storage
async function uploadToStorage(file, path) {
    try {
        if (!storage) {
            console.warn('Firebase Storage not initialized');
            return { success: false, error: 'Storage not initialized' };
        }
        
        const storageRef = storage.ref();
        const fileRef = storageRef.child(path);
        const snapshot = await fileRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return { success: true, url: downloadURL };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: error.message };
    }
}

// تصدير الدوال للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FirebaseDB,
        uploadToStorage,
        firebaseConfig
    };
}
