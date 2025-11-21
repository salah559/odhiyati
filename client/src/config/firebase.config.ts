
import { initializeApp } from 'firebase/app';

// تكوين Firebase للواجهة الأمامية
export const firebaseConfig = {
  apiKey: "AIzaSyANVd7qWQcg5IBonIdQgbBZDAvXT049RkQ",
  authDomain: "oudhiyaty.firebaseapp.com",
  projectId: "oudhiyaty",
  storageBucket: "oudhiyaty.firebasestorage.app",
  messagingSenderId: "204852763681",
  appId: "1:204852763681:web:ae3cfef9d44edf949ad760",
  measurementId: "G-S56KC80F5Q"
};

// تهيئة Firebase
export const app = initializeApp(firebaseConfig);
