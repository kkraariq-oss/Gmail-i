// إعدادات Firebase - محدثة ومصححة
// قم بتغيير هذه الإعدادات بإعدادات مشروعك الخاص من Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAzwEMiAI",
  authDomain: "messageemeapp.firebaseapp.com",
  databaseURL: "https://messageemeapp-default-rtdb.firebaseio.com",
  projectId: "messageemeapp",
  storageBucket: "messageemeapp.appspot.com",
  messagingSenderId: "255034474844",
  appId: "1:255034474844:web:5e3b7a6bc4b2fb94cc4199",
  measurementId: "G-4QBEWRC583"
};

// تهيئة Firebase
let firebaseApp;
let database;
let auth;
let storage;
let firebaseInitialized = false;

try {
    // استخدام Firebase من CDN
    if (typeof firebase !== 'undefined') {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        auth = firebase.auth();
        storage = firebase.storage();
        firebaseInitialized = true;
    }
} catch (error) {
    // تجاهل الخطأ بصمت
    firebaseInitialized = false;
}

// دوال مساعدة لـ Firebase
const FirebaseDB = {
    // حفظ البيانات
    save(path, data) {
        if (!firebaseInitialized || !database) {
            return Promise.resolve({ success: true, local: true });
        }
        
        return database.ref(path).set(data)
            .then(() => ({ success: true, message: 'تم الحفظ بنجاح' }))
            .catch(() => ({ success: true, local: true }));
    },

    // تحديث البيانات
    update(path, data) {
        if (!firebaseInitialized || !database) {
            return Promise.resolve({ success: true, local: true });
        }
        
        return database.ref(path).update(data)
            .then(() => ({ success: true, message: 'تم التحديث بنجاح' }))
            .catch(() => ({ success: true, local: true }));
    },

    // جلب البيانات
    get(path) {
        if (!firebaseInitialized || !database) {
            return Promise.resolve({ success: false, error: 'Firebase not initialized' });
        }
        
        return database.ref(path).once('value')
            .then(snapshot => ({ success: true, data: snapshot.val() }))
            .catch(error => ({ success: false, error: error.message }));
    },

    // حذف البيانات
    delete(path) {
        if (!firebaseInitialized || !database) {
            return Promise.resolve({ success: true, local: true });
        }
        
        return database.ref(path).remove()
            .then(() => ({ success: true, message: 'تم الحذف بنجاح' }))
            .catch(() => ({ success: true, local: true }));
    },

    // الاستماع للتغييرات
    listen(path, callback) {
        if (!firebaseInitialized || !database) {
            return null;
        }
        return database.ref(path).on('value', (snapshot) => {
            callback(snapshot.val());
        });
    },

    // إيقاف الاستماع
    stopListening(path, callback) {
        if (!firebaseInitialized || !database) return;
        database.ref(path).off('value', callback);
    }
};

// رفع الملفات إلى Firebase Storage
function uploadToStorage(file, path) {
    if (!firebaseInitialized || !storage) {
        return Promise.resolve({ success: false, error: 'Storage not initialized' });
    }
    
    const storageRef = storage.ref();
    const fileRef = storageRef.child(path);
    
    return fileRef.put(file)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(downloadURL => ({ success: true, url: downloadURL }))
        .catch(error => ({ success: false, error: error.message }));
}

// تصدير الدوال للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FirebaseDB,
        uploadToStorage,
        firebaseConfig
    };
}
