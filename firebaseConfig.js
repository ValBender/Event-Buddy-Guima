import firebase from "firebase";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAR1CT5GCVztDwUXFNj-g8gBmTseWISRRU",
  authDomain: "event-buddy-guimaraes.firebaseapp.com",
  projectId: "event-buddy-guimaraes",
  storageBucket: "event-buddy-guimaraes.firebasestorage.app",
  messagingSenderId: "397694959110",
  appId: "1:397694959110:web:30856cb82e1b5e8a9b8d87",
  measurementId: "G-WD1FJ3EKBM"
};

if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

export const database = firebase.firestore()
export const auth = firebase.auth()