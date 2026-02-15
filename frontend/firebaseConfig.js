 // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Authentication
const auth = getAuth(app);

// ✅ Export app & auth for use in other files
export { app, auth };