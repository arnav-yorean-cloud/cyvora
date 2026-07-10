// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAGY_7Ox_aHcf3Hwj9LAM3D922BscAQZLY",
  authDomain: "cyvora-a3a94.firebaseapp.com",
  projectId: "cyvora-a3a94",
  storageBucket: "cyvora-a3a94.firebasestorage.app",
  messagingSenderId: "986622079974",
  appId: "1:986622079974:web:7469bc6c6f72b91fb97c27",
  measurementId: "G-178358SGLV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();//zero=0,O(as in ocean)