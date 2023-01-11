import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDocs, serverTimestamp, onSnapshot } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";
import { collection, query, where } from "firebase/firestore";

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

	createAnAuth(email, password, username, callback) {
		createUserWithEmailAndPassword(this.auth, email, password)
			.then(async (userCredential) => {
				await setDoc(doc(this.db, "users", userCredential.user.uid), {
					email,
					timeStamp: serverTimestamp(),
					balance: 0.0,
					username,
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

	checkUserExists(username, callback) {
		try {
			// Create a reference to the cities collection
			const usersRef = collection(this.db, "users");

			// Create a query against the collection.
			getDocs(query(usersRef, where("username", "==", username))).then((data) => {
				let result = [];
				data.forEach((e) => {
					result.push(e?.data());
				});
				callback(result);
			});

			// console.log(q);
			// callback(q);
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}
	signOutUser(callback) {
		signOut(this.auth)
			.then(() => {
				callback(true);
			})
			.catch((error) => {
				callback({ error: "An error occurred" });
			});
	}
}
