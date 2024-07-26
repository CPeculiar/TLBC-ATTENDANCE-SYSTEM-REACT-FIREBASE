import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDEQQ8AitjXP1F4WX4P5L0PJh6LTATl-A0",
  authDomain: "tlbc-attendance-and-data-systm.firebaseapp.com",
  projectId: "tlbc-attendance-and-data-systm",
  storageBucket: "tlbc-attendance-and-data-systm.appspot.com",
  messagingSenderId: "158717173582",
  appId: "1:158717173582:web:51cc6cf62e104d86ebc81f",
  measurementId: "G-V96JGQVC87",
};

console.log("Firebase Config:", firebaseConfig);

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;



// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
// };