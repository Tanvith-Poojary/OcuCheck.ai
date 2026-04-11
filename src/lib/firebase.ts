import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "studio-9993151920-80cdd",
  "appId": "1:192936509891:web:beb9f9b5d34392d97e3d76",
  "apiKey": "AIzaSyB7jp4c_X7p6guhNyRz23P3G76mIUL5K5Q",
  "authDomain": "studio-9993151920-80cdd.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "192936509891"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
