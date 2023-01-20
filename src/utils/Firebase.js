import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore, runTransaction, doc, setDoc, getDocs, getDoc, serverTimestamp, onSnapshot, updateDoc, addDoc, orderBy, deleteDoc } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";
import { collection, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { removeHTML, createLink, truncateText } from "../utils/Text";

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
	fetchUserWithId(user_id, callback) {
		onSnapshot(doc(this.db, "users", user_id), (res) => {
			callback({ ...res.data(), user_id: res.id });
		});
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
		path = path.replace(/\s-/gi, "");
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
	storeSponsorship(data, callback) {
		let ext = data.image.name.split(".");
		let name = ext[0] + new Date().getTime();
		ext = ext[ext.length - 1];
		name = name + "." + ext;

		try {
			this.storeImg(data.image, `sponsorships/${name}`, (res) => {
				if (res.error) return;
				delete data.image;
				data = { ...data, promo_image: res, status: "pending", settled: false };
				// Store data
				addDoc(collection(this.db, "sponsorships"), data);
				addDoc(collection(this.db, "notifications"), { type: "newSponsorshipRequest", sponsor_id: data?.sponsor_id, receiver_id: data?.author_id, timestamp: serverTimestamp() });

				callback("success");
				return;
			});
		} catch (e) {
			callback({ error: true });
		}
	}
	fetchSponsors(userId, callback) {
		try {
			// Create a query against the collection.
			let q = query(collection(this.db, "sponsorships"), where("author_id", "==", userId), where("status", "==", "approved"));

			onSnapshot(q, (querySnapshot) => {
				if (querySnapshot.empty) {
					callback({ empty: true });
					return;
				}
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
	fetchSponsoredAuthors(userId, callback) {
		try {
			// Create a query against the collection.
			let q = query(collection(this.db, "sponsorships"), where("sponsor_id", "==", userId));

			onSnapshot(q, async (querySnapshot) => {
				if (querySnapshot.empty) {
					callback({ empty: true });
					return;
				}
				let sponsors = [];
				let authors = [];
				querySnapshot.docs.forEach((res) => {
					authors.push(getDoc(doc(this.db, "users", res.data().author_id)));
					sponsors.push({ ...res.data(), sponsorship_id: res?.id });
				});
				authors = await Promise.all(authors);

				callback(
					sponsors.map((e, index) => {
						return { ...e, author: { ...authors[index].data() } };
					})
				);
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}
	async payForSponsporship(sponsorship_id, sponsor_id, author_id, callback) {
		try {
			await runTransaction(this.db, async (transaction) => {
				const authorDoc = await transaction.get(doc(this.db, "users", author_id));
				const sponsorDoc = await transaction.get(doc(this.db, "users", sponsor_id));
				if (!authorDoc.exists() || !sponsorDoc.exists()) {
					callback("A document does not exist");
					return;
				}
				const newAuthorBalance = parseFloat(authorDoc.data().balance) + parseFloat(25);
				const newSponsorBalance = parseFloat(sponsorDoc.data().balance) - 25;

				transaction.update(doc(this.db, "sponsorships", sponsorship_id), { settled: true });
				transaction.update(doc(this.db, "users", sponsor_id), { balance: parseFloat(newSponsorBalance.toFixed(2)) });
				transaction.update(doc(this.db, "users", author_id), { balance: parseFloat(newAuthorBalance.toFixed(2)) });

				addDoc(collection(this.db, "notifications"), {
					type: "sponsorshipSettled",
					sponsor_id,
					receiver_id: author_id,
					timestamp: serverTimestamp(),
				});
			});
			callback("success");
		} catch (e) {
			console.log(e);
			callback("Transaction failed: ", e);
		}
	}

	deleteSponsorship(sponsorship_id, author_id, sponsor_username, callback) {
		try {
			deleteDoc(doc(this.db, "sponsorships", sponsorship_id));
			addDoc(collection(this.db, "notifications"), { timestamp: serverTimestamp(), receiver_id: author_id, type: "sponsorshipDeleted", sponsor_username });
		} catch (e) {
			callback({ error: true });
		}
	}
	fetchAllRequests(author_id, callback) {
		try {
			let q = query(collection(this.db, "sponsorships"), where("author_id", "==", author_id), where("status", "==", "pending"));
			onSnapshot(q, (querySnapshot) => {
				if (querySnapshot.empty) {
					callback({ empty: true });
					return;
				}
				let requests = querySnapshot.docs.map((doc) => {
					return { ...doc.data(), request_id: doc?.id };
				});
				callback(requests);
			});
		} catch (e) {
			callback({ error: true });
		}
	}
	fetchRequest(request_id, callback) {
		try {
			let q = doc(this.db, "sponsorships", request_id);
			onSnapshot(q, (querySnapshot) => {
				if (querySnapshot.empty) {
					callback({ empty: true });
					return;
				}
				let request = { ...querySnapshot.data(), request_id: querySnapshot.id };
				callback(request);
			});
		} catch (e) {
			callback({ error: true });
		}
	}
	moderateRequest(status, receiver_id, author_id, request_id, callback) {
		try {
			updateDoc(doc(this.db, "sponsorships", request_id), { status });
			addDoc(addDoc(collection(this.db, "notifications"), { type: "requestModerated", author_id, request_id, receiver_id, timestamp: serverTimestamp() }));
			callback("success");
		} catch (e) {
			callback({ error: true });
		}
	}
	fetchBlogs(username, callback) {
		// 	Logic with sub-collections
		// 	create a sub-collection in a document under a collection . Then use the line below to grab it
		// 	getDocs(collection(this.db, `${blog.ref.path}/comments`)));

		try {
			// Create a query against the collection.
			// If username is set, query with username else fetch all
			let q = username ? query(collection(this.db, "blogs"), where("author", "==", username), orderBy("timestamp", "desc")) : query(collection(this.db, "blogs"), orderBy("timestamp", "desc"));
			onSnapshot(q, async (res) => {
				const promises = [];
				let result = [];
				res.docs.forEach((blog) => {
					result.push({ ...blog.data(), blog_id: blog.id });
					// Comment.  This is the logic I was missing. Push the functions into an array and resolve below else the loop wouldn't wait
					promises.push(getDocs(query(collection(this.db, "comments"), where("blog_id", "==", blog.id))));
				});
				// Resolving comments.
				let comments = await Promise.all(promises);
				result = result.map((e, index) => {
					return { ...e, comments: comments[index].docs.map((e) => e.data()) };
				});
				callback(result);
			});
		} catch (e) {
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
			callback({ error: "An error occurred" });
		}
	}

	storeBlog(data, callback) {
		// Store lead Image first
		let path = "blogs/" + data.name;
		data = { ...data, timestamp: serverTimestamp(), likes: data.author_id, dislikes: "", views: 0, savedCount: 0, upvotes: JSON.stringify([]) };

		this.storeImg(data?.file, path, (res) => {
			if (res.error) {
				callback(res);
				return;
			}
			delete data.file;
			delete data.name;
			delete data.author_id;
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

	updateBlog(data, callback) {
		try {
			data.editTime = serverTimestamp();
			if (data.file) {
				let path = "blogs/" + data.name;
				// Store file in case the lead image changes
				this.storeImg(data?.file, path, (res) => {
					if (res.error) {
						callback(res);
						return;
					}
					delete data.file;
					delete data.name;
					data.lead_image_src = res;
					// Insert Blog
					updateDoc(doc(this.db, "blogs", data?.blog_id), data);
					callback(data);
				});
				callback("success");
				return;
			}

			updateDoc(doc(this.db, "blogs", data.blog_id), data).then(() => {});
			callback("success");
		} catch (error) {
			console.log(error);
			callback({ error: "An error occurred " });
		}
	}

	updateRatings(type, likes, dislikes, id) {
		try {
			updateDoc(doc(this.db, type, id), { likes, dislikes }).then((res) => {});
		} catch (e) {}
	}

	updateBookmarks(blog_id, bookmarks, callback) {
		try {
			updateDoc(doc(this.db, "blogs", blog_id), { bookmarks }).then((res) => {});
		} catch (e) {
			callback(e);
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
			callback({ error: "An error occurred" });
		}
	}
	async storeUpvote({ type, id, upvotes, receiver_id, sender_id, value, blog_id }, callback) {
		// Transaction
		// Store new upvotes data
		// Subtract amount from sender
		// Add amount to receiver
		try {
			await runTransaction(this.db, async (transaction) => {
				const receiverDoc = await transaction.get(doc(this.db, "users", receiver_id));
				const senderDoc = await transaction.get(doc(this.db, "users", sender_id));
				const post = await transaction.get(doc(this.db, type, id));
				if (!receiverDoc.exists() || !senderDoc.exists()) {
					callback("A document does not exist");
					return;
				}
				const newReceiverBalance = parseFloat(receiverDoc.data().balance) + parseFloat(value);
				const newSenderBalance = parseFloat(senderDoc.data().balance) - parseFloat(value);

				// Insert notification
				let notif = {};
				if (type === "blogs") {
					notif = {
						desc: `@${senderDoc.data().username} upvoted your post "${removeHTML(post.data().heading)}" with $${value}`,
						link: createLink(receiverDoc.data().username, removeHTML(post.data().heading), post.id) + "#upvotes",
						receiver_id,
					};
				}
				if (type === "comments" || type === "replies") {
					let blog = await transaction.get(doc(this.db, "blogs", blog_id));
					// Create link with blog
					if (type === "comments") {
						notif = {
							desc: `@${senderDoc.data().username} upvoted your comment "${truncateText(post.data()?.comment, 75)}" with $${value}`,
							link: createLink(receiverDoc.data().username, removeHTML(blog.data().heading), blog.id),
							receiver_id,
						};
					}
					if (type === "replies") {
						notif = {
							desc: `@${senderDoc.data().username} upvoted your reply "${truncateText(post.data()?.message, 75)}" with $${value}`,
							link: createLink(receiverDoc.data().username, removeHTML(blog.data().heading), blog.id),
							receiver_id,
						};
					}
				}
				transaction.update(doc(this.db, type, id), { upvotes });
				transaction.update(doc(this.db, "users", receiver_id), { balance: parseFloat(newReceiverBalance.toFixed(2)) });
				transaction.update(doc(this.db, "users", sender_id), { balance: parseFloat(newSenderBalance.toFixed(2)) });
				this.insertNotification(notif);
			});
			callback("success");
		} catch (e) {
			callback("Transaction failed: ", e);
		}
	}
	storeCommentOrReply(type, data, callback) {
		data = { ...data, timestamp: serverTimestamp(), likes: "", dislikes: "", upvotes: JSON.stringify([]) };
		console.log(type, data);
		addDoc(collection(this.db, type), data)
			.then((response) => {
				callback(response);
			})
			.catch((e) => {
				callback({ error: e });
			});
		callback(data);
	}

	async fetchCommentsOrReplies(type, base_id, sort, callback) {
		let field = type === "comments" ? "blog_id" : "base_comment_id";
		// // Fetch comment
		// // Fetch comment author
		// //  Fetch length of comment replies
		// // Using getDocs
		try {
			// Create a query against the collection.
			let q = query(collection(this.db, type), where(field, "==", base_id), orderBy("timestamp", sort));
			onSnapshot(q, async (querySnapshot) => {
				if (querySnapshot.docs?.length) {
					let commentsOrReplies = querySnapshot.docs.map((e) => {
						return { ...e.data(), id: e.id };
					});
					callback(commentsOrReplies);
					return;
				}
				callback({ empty: true });
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}

	getUserObject(callback) {
		if (this.auth) {
			callback(this.auth?.currentUser);
			return;
		}
		callback({ error: true });
	}

	sendVerification(user, callback) {
		callback(sendEmailVerification(user));
	}

	validatePassword(user, password, callback) {
		const credential = EmailAuthProvider.credential(user?.email, password);
		reauthenticateWithCredential(user, credential)
			.then(() => {
				callback("success");
			})
			.catch((error) => {
				callback({ error: true });
			});
	}
	updateUsersPassword(user, newPassword, callback) {
		updatePassword(user, newPassword)
			.then(() => {
				callback("success");
			})
			.catch((error) => {
				callback({ error: true });
			});
	}

	fetchBookMarks(user_id, callback) {
		// Create a query against the collection.
		try {
			let q = query(collection(this.db, "blogs"), where("bookmarks", "array-contains", user_id), orderBy("timestamp", "desc"));
			onSnapshot(q, async (querySnapshot) => {
				const promises = [];
				let bookmarks = [];
				if (querySnapshot.docs?.length) {
					bookmarks = querySnapshot.docs.map((blog) => {
						promises.push(getDocs(query(collection(this.db, "comments"), where("blog_id", "==", blog.id))));
						return { ...blog.data(), blog_id: blog.id };
					});
					let comments = await Promise.all(promises);
					bookmarks = bookmarks.map((e, index) => {
						return { ...e, comments: comments[index].docs.map((e) => e.data()) };
					});
					callback(bookmarks);
					return;
				}
				callback({ empty: true });
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}
	insertNotification(data) {
		data = { ...data, timestamp: serverTimestamp(), status: "unread" };
		addDoc(collection(this.db, "notifications"), data);
	}
	fetchUserNotifications(user_id, callback) {
		// Create a query against the collection.
		try {
			let q = query(collection(this.db, "notifications"), where("receiver_id", "==", user_id), orderBy("timestamp", "desc"));
			onSnapshot(q, async (querySnapshot) => {
				if (querySnapshot.docs?.length) {
					let notifications = querySnapshot.docs.map((notification) => {
						return { ...notification.data(), notification_id: notification.id };
					});

					callback(notifications);
					return;
				}
				callback({ empty: true });
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}
	setReadNotification(notification_id, status, callback) {
		try {
			if (!status) updateDoc(doc(this.db, "notifications", notification_id), { status: "read" }, { merge: true });
			callback("success");
		} catch (e) {
			callback({ error: true });
		}
	}
}
