import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDocs, serverTimestamp, onSnapshot, updateDoc, addDoc, orderBy } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";
import { collection, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

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
		this.storage = getStorage(this.app);
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
	storeBio(bio, userId, callback) {
		try {
			updateDoc(doc(this.db, "users", userId), {
				bio: bio,
			});
			callback("success");
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}

	fetchUserWithUsername(username, callback) {
		try {
			// Create a query against the collection.
			let q = query(collection(this.db, "users"), where("username", "==", username));
			onSnapshot(q, (querySnapshot) => {
				callback({ ...querySnapshot.docs[0].data(), userId: querySnapshot.docs[0].id });
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}
	updateProfileImage(image, userId, callback) {
		// Get ext
		this.storeImg(image, userId, (res) => {
			if (res.error) {
				callback(res);
				return;
			}
			// Update image link
			try {
				updateDoc(doc(this.db, "users", userId), {
					imgSrc: res,
				});
				callback("success");
			} catch (e) {
				callback({ error: "An error occurred" });
			}
		});
	}
	storeImg(image, userId, callback) {
		let ext = image.name.split(".");
		ext = ext[ext.length - 1];
		let path = `images/${userId}.${ext}`;
		let storageRef = ref(this.storage, path);
		try {
			let uploadTask = uploadBytesResumable(storageRef, image);
			uploadTask.on(
				(error) => {
					callback({ error: "An error occurred during upload" });
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
						callback(downloadURL);
					});
				}
			);
		} catch (e) {
			console.log(e);
			callback({ error: "An error occurred" });
		}
	}
	fetchSponsors(username, callback) {
		try {
			// Create a query against the collection.
			let q = query(collection(this.db, "sponsorships"), where("username", "==", username));

			onSnapshot(q, (querySnapshot) => {
				let sponsors = [];
				querySnapshot.docs.forEach((doc) => {
					sponsors.push({ ...doc.data(), sponsorship_id: doc?.id });
				});
				callback(sponsors);
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}

	fetchBlogs(username, callback) {
		try {
			// Create a query against the collection.
			// let q = query(collection(this.db, "blogs"), where("author", "==", username), orderBy("timestamp", "desc"));

			let q = query(collection(this.db, "blogs"), where("author", "==", username));

			onSnapshot(q, (querySnapshot) => {
				let blogs = [];
				querySnapshot.docs.forEach((doc) => {
					blogs.push({ ...doc.data(), blog_id: doc?.id });
				});
				callback(blogs);
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}

	fetchSubscribers(username, callback) {
		try {
			// Create a query against the collection.
			let q = query(collection(this.db, "subscriptions"), where("username", "==", username));

			onSnapshot(q, (querySnapshot) => {
				if (querySnapshot.docs?.length) {
					let doc = querySnapshot.docs[0];
					let res = { ...doc?.data(), id: doc?.id };
					callback(res);
				} else {
					callback({ empty: true });
				}
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}

	updateSubscription(data, docId, callback) {
		try {
			updateDoc(doc(this.db, "subscriptions", docId), { followers: data }).then((res) => {
				callback(res);
			});
		} catch (e) {
			callback(e);
			callback({ error: "An error occurred" });
		}
	}

	addSubscription(data, username, callback) {
		try {
			addDoc(collection(this.db, "subscriptions"), { followers: data, username }).then((res) => {
				callback(res);
			});
		} catch (e) {
			callback(e);
			callback({ error: "An error occurred" });
		}
	}

	storeBlog(data, callback) {
		data = { ...data, timestamp: serverTimestamp(), likes: 1, comments: 0, upvotes: 0.0 };
		addDoc(collection(this.db, "blogs"), data)
			.then((res) => {
				callback(res);
			})
			.catch((e) => {
				callback({ error: e });
			});
		// callback(data);
	}
}
