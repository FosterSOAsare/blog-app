import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, runTransaction, doc, setDoc, getDocs, getDoc, serverTimestamp, onSnapshot, updateDoc, addDoc, orderBy } from "firebase/firestore";
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
					timestamp: serverTimestamp(),
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
				if (querySnapshot.docs[0]) {
					callback({ ...querySnapshot.docs[0].data(), userId: querySnapshot.docs[0].id });
					return;
				}
				callback({ error: "User does not exist" });
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}
	updateProfileImage(image, userId, callback) {
		// Get ext
		let ext = image.name.split(".");
		ext = ext[ext.length - 1];
		let path = `profiles/${userId}.${ext}`;
		this.storeImg(image, path, (res) => {
			if (res.error) {
				callback(res);
				return;
			}
			// Update image link
			try {
				updateDoc(doc(this.db, "users", userId), {
					img_src: res,
				});
				callback("success");
			} catch (e) {
				callback({ error: "An error occurred" });
			}
		});
	}
	storeImg(image, path, callback) {
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
		// 	Logic with sub-collections
		// 	create a sub-collection in a document under a collection . Then use the line below to grab it
		// 	getDocs(collection(this.db, `${blog.ref.path}/comments`)));

		try {
			// Create a query against the collection.
			let q = query(collection(this.db, "blogs"), where("author", "==", username), orderBy("timestamp", "desc"));
			onSnapshot(q, async (res) => {
				const promises = [];
				let result = [];
				res.docs.forEach((blog) => {
					result.push({ ...blog.data(), blog_id: blog.id });
					// Comment.  This is the logic I was missing. Push the functions into an array and resolve below else the loop wouldn't wait
					promises.push(getDocs(query(collection(this.db, "comments"), where("reply_to", "==", blog.id))));
				});
				// Resolving comments.
				let comments = await Promise.all(promises);
				result = result.map((e, index) => {
					return { ...e, comments: comments[index].docs.map((e) => e.data()) };
				});
				callback(result);
			});
		} catch (e) {
			// console.log(e);
			callback({ error: "An error occurred" });
		}
		// Using a different collection with relations
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
			console.log(e);
			callback({ error: "An error occurred" });
		}
	}

	storeBlog(data, callback) {
		// Store lead Image first
		let path = "blogs/" + data.name;
		data = { ...data, timestamp: serverTimestamp(), likes: data.author, dislikes: "", views: 0, upvotes: JSON.stringify([]) };

		this.storeImg(data?.file, path, (res) => {
			if (res.error) {
				callback(res);
				return;
			}
			delete data.file;
			delete data.name;
			data.lead_image_src = res;
			// Insert Blog
			addDoc(collection(this.db, "blogs"), data)
				.then((response) => {
					callback(response);
				})
				.catch((e) => {
					callback({ error: e });
				});
			callback(data);
		});
	}

	updateLikes(likes, dislikes, blog_id) {
		try {
			updateDoc(doc(this.db, "blogs", blog_id), { likes, dislikes }).then((res) => {});
		} catch (e) {
			console.log(e);
		}
	}

	fetchBlog(blog_id, callback) {
		try {
			// Create a query against the collection.
			let q = doc(this.db, "blogs", blog_id);

			onSnapshot(q, (res) => {
				if (res.exists()) {
					callback({ ...res.data(), blog_id: res.id });
				} else {
					callback({ empty: true });
				}
			});
		} catch (e) {
			console.log(e);
			callback({ error: "An error occurred" });
		}
	}
	async storeUpvote(blog_id, upvotes, receiver_id, sender_id, value, callback) {
		// Transaction
		// Store new upvotes data
		// Subtract amount from sender
		// Add amount to receiver
		try {
			await runTransaction(this.db, async (transaction) => {
				const receiverDoc = await transaction.get(doc(this.db, "users", receiver_id));
				const senderDoc = await transaction.get(doc(this.db, "users", sender_id));

				if (!receiverDoc.exists() || !senderDoc.exists()) {
					console.log("A document does not exist");
				}
				const newReceiverBalance = parseFloat(receiverDoc.data().balance) + parseFloat(value);
				const newSenderBalance = parseFloat(senderDoc.data().balance) - parseFloat(value);
				transaction.update(doc(this.db, "blogs", blog_id), { upvotes });
				transaction.update(doc(this.db, "users", receiver_id), { balance: newReceiverBalance });
				transaction.update(doc(this.db, "users", sender_id), { balance: newSenderBalance });
			});
			callback("success");
		} catch (e) {
			console.log("Transaction failed: ", e);
		}
	}
	storeComment(data, callback) {
		data = { ...data, timestamp: serverTimestamp(), likes: "", dislikes: "", upvotes: JSON.stringify([]) };
		addDoc(collection(this.db, "comments"), data)
			.then((response) => {
				callback(response);
			})
			.catch((e) => {
				callback({ error: e });
			});
		callback(data);
	}
	fetchComments(blog_id, callback) {
		// Fetch comment
		// Fetch comment author
		//  Fetch length of comment replies
		try {
			// Create a query against the collection.
			let q = query(collection(this.db, "comments"), where("blog_id", "==", blog_id));
			onSnapshot(q, async (querySnapshot) => {
				if (querySnapshot.docs?.length) {
					let comment_authors = [];
					let totalReplies = [];
					let comments = querySnapshot.docs.map((e) => {
						comment_authors.push(getDoc(doc(this.db, "users", e.data().author_id)));
						totalReplies.push(getDocs(query(collection(this.db, "replies"), where("base_comment", "==", e.id))));
						return { ...e.data(), id: e.id };
					});
					comment_authors = await Promise.all(comment_authors);
					totalReplies = await Promise.all(totalReplies);
					comments = comments.map((e, index) => {
						return {
							...e,
							commentOrReplyAuthor: comment_authors[index].data(),
							totalReplies: totalReplies[index]?.docs.length,
						};
					});

					callback(comments);
					return;
				}
				callback({ empty: true });
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}
	// Comments
}
