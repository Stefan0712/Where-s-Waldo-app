import { initializeApp } from 'firebase/app';
import "firebase/database"

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9V397RVX68kbRcADDIMkZ0n-76dnGOWg",
  authDomain: "where-s-waldo-12715.firebaseapp.com",
  databaseURL: "https://where-s-waldo-12715-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "where-s-waldo-12715",
  storageBucket: "where-s-waldo-12715.appspot.com",
  messagingSenderId: "79382425062",
  appId: "1:79382425062:web:75071d8d1a39297c63ba27",
  measurementId: "G-TF92LYPD8D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const databaseRef = firebase.database().ref()

export const notesRef = databaseRef.child("notes")
