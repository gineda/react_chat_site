import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCOEdcYzQI4fwLfQOGadX0pvkLReBaD2xU",
    authDomain: "react-firebase-chat-app-2ae03.firebaseapp.com",
    projectId: "react-firebase-chat-app-2ae03",
    storageBucket: "react-firebase-chat-app-2ae03.appspot.com",
    messagingSenderId: "848913691319",
    appId: "1:848913691319:web:0c84dbf1a953ce3d1c5332"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase;