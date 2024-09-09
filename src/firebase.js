// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqvpUrdHBtlpywoTMzp2Qy1HlADoAlN6M",
  authDomain: "dynamicdndbuilder.firebaseapp.com",
  projectId: "dynamicdndbuilder",
  storageBucket: "dynamicdndbuilder.appspot.com",
  messagingSenderId: "957183177013",
  appId: "1:957183177013:web:794a66995b0f79267e1c7c",
  measurementId: "G-X6LHRYB4B0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);