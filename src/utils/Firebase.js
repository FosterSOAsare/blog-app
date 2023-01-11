import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";

export class Firebase {
	constructor() {
		this.firebaseConfig = {
			apiKey: process.env.REACT_APP_FIREBASE_KEY,
			authDomain: "blog-site-d48bd.firebaseapp.com",
			projectId: "blog-site-d48bd",
			storageBucket: "blog-site-d48bd.appspot.com",
			messagingSenderId: "239091205345",
			appId: "1:239091205345:web:cd27b5ae2be9c6567b63a0",
			measurementId: "G-8616P037QY",
		};

		// Initialize Firebase
		this.app = initializeApp(this.firebaseConfig);
		this.auth = getAuth();
		this.db = getFirestore(this.app);
	}

	createAnAuth(email, password, callback) {
		createUserWithEmailAndPassword(this.auth, email, password)
			.then(async (userCredential) => {
				await setDoc(doc(this.db, "users", userCredential.user.uid), {
					email,
					timeStamp: serverTimestamp(),
				});
				// Store Data in db collection
				sendEmailVerification(userCredential.user);
				// send back response
				callback(userCredential.user);
			})
			.catch((error) => {
				if (error.code === "auth/email-already-in-use") {
					callback({ error: "Email is already in use" });
					return;
				}
				callback({ error: "An error occurred" });
			});
	}

	getUserData(email, password, callback) {
		signInWithEmailAndPassword(this.auth, email, password)
			.then((userCredential) => {
				callback(userCredential.user);
			})
			.catch(() => {
				callback({ error: "An error occurred. Please check your login credentials" });
			});
	}
	fetchUserWithUid(uid, callback) {
		try {
			onSnapshot(doc(this.db, "users", uid), (doc) => {
				callback(doc.data());
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}
}
