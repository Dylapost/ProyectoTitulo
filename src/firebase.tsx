import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Agrega Firestore
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD7zk2pzjaAvog9U4tXMhOGKRkpQvSk9AM",
  authDomain: "proyecto-de-titulo-9c071.firebaseapp.com",
  projectId: "proyecto-de-titulo-9c071",
  storageBucket: "proyecto-de-titulo-9c071.appspot.com",
  messagingSenderId: "80230342746",
  appId: "1:80230342746:web:3f2514a117acd71e10b863"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 
const storage = getStorage(app);

export { auth, db, storage }; // Exporta Firestore
