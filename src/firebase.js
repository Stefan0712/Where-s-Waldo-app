import { initializeApp } from 'firebase/app';
import {getFirestore} from '@firebase/firestore'

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


export const db = getFirestore()


