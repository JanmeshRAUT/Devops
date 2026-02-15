import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBbzZPvDZhBL6mJzQ8mW8ycyPPX4DS-agA",
  authDomain: "medtrust-92571.firebaseapp.com",
  projectId: "medtrust-92571",
  storageBucket: "medtrust-92571.firebasestorage.app",
  messagingSenderId: "518925606636",
  appId: "1:518925606636:web:98b84597318bc337894fc9",
  measurementId: "G-S44QTSVSCJ"
};

const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
