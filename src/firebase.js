import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2Dcc6m63_9gwXf5Meh4YTX5Y5uCX4Oew",
  authDomain: "investpro-com.firebaseapp.com",
  projectId: "investpro-com",
  storageBucket: "investpro-com.firebasestorage.app",
  messagingSenderId: "938013946843",
  appId: "1:938013946843:web:dcad7db7ebd8a66598edfe"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);