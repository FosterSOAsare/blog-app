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
			console.log(data);
			this.storeImg(data.image, `sponsorships/${name}`, async (res) => {
				if (res.error) return;
				data = { ...data, promo_image: res, status: "pending", settled: false };
				// 	// Store data

				await runTransaction(this.db, async (transaction) => {
					const sponsor = await transaction.get(doc(this.db, "users", data?.sponsor_id));
					let notif = {
						desc: `Sponsorship request received from @${sponsor?.data()?.username}.`,
						link: "/sponsorships/requests",
						type: "sponsorship",
						receiver_id: data?.author_id,
					};
					delete data.image;
					addDoc(collection(this.db, "sponsorships"), data);
					this.insertNotification(notif);
				});

				callback("success");
				return;
			});
		} catch (e) {
			console.log(e);
			callback({ error: true });
		}
	}
	fetchSponsors(userId, callback) {
		try {
			// Create a query against the collection.
			let q = query(collection(this.db, "sponsorships"), where("author_id", "==", userId), where("status", "==", "approved"), where("settled", "==", true));

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

				let notif = {
					desc: `Payment received : Your sponsorship request by @${sponsorDoc.data().username} has been finalized`,
					link: `/@${authorDoc.data().username}`,
					type: "sponsorship",
					receiver_id: author_id,
				};
				transaction.update(doc(this.db, "sponsorships", sponsorship_id), { settled: true });
				transaction.update(doc(this.db, "users", sponsor_id), { balance: parseFloat(newSponsorBalance.toFixed(2)) });
				transaction.update(doc(this.db, "users", author_id), { balance: parseFloat(newAuthorBalance.toFixed(2)) });

				this.insertNotification(notif);
			});
			callback("success");
		} catch (e) {
			console.log(e);
			callback("Transaction failed: ", e);
		}
	}

	async deleteSponsorship(sponsorship_id, author_id, sponsor_id, callback) {
		try {
			await runTransaction(this.db, async (transaction) => {
				let sponsor = await transaction.get(doc(this.db, "users", sponsor_id));
				let author = await transaction.get(doc(this.db, "users", author_id));
				let notif = {
					desc: `@${sponsor.data().username} has terminated his/her sponsorship`,
					link: `/@${author.data().username}`,
					type: "sponsorship",
					receiver_id: author_id,
				};
				deleteDoc(doc(this.db, "sponsorships", sponsorship_id));
				this.insertNotification(notif);
			});
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
	async moderateRequest(status, receiver_id, author_id, request_id, callback) {
		try {
			await runTransaction(this.db, async (transaction) => {
				const author = await transaction.get(doc(this.db, "users", author_id));

				let notif = {
					desc: `@${author.data().username} ${status} your sponsorship.${status === "approved" ? " Check to complete payment" : ""}`,
					link: "/sponsorships",
					type: "sponsorship",
					receiver_id,
				};
				updateDoc(doc(this.db, "sponsorships", request_id), { status });
				this.insertNotification(notif);
			});
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

	async storeBlog(data, callback) {
		try {
			// Store lead Image first
			let path = "blogs/" + data.name;
			data = { ...data, timestamp: serverTimestamp(), likes: data.author_id, dislikes: "", views: 0, savedCount: 0, upvotes: JSON.stringify([]) };
			this.storeImg(data?.file, path, async (res) => {
				if (res.error) {
					callback(res);
					return;
				}
				delete data.file;
				delete data.name;
				delete data.author_id;
				data.lead_image_src = res;
				await runTransaction(this.db, async (transaction) => {
					let q = query(collection(this.db, "subscriptions"), where("username", "==", data.author));
					let subscriptions = await getDocs(q);
					subscriptions = subscriptions.docs[0].data();
					let subscribers = subscriptions.followers.split(" ");

					addDoc(collection(this.db, "blogs"), data).then((res) => {
						let notif = {
							desc: `@${data.author} has posted a new article, "${removeHTML(data.heading)}"`,
							link: createLink(data.author, removeHTML(data.heading), res.id),
							receivers: subscribers.map((e) => {
								return { receiver_id: e, status: "unread" };
							}),
							type: "post",
						};
						this.insertNotification(notif);
					});
				});
				// Insert Blog
				callback(data);
			});
		} catch (e) {
			callback({ error: true });
		}
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
				notif = {
					...notif,
					type: "upvotes",
				};
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
	async storeCommentOrReply(type, data, callback) {
		try {
			await runTransaction(this.db, async (transaction) => {
				let notif = {};
				let author = await transaction.get(doc(this.db, "users", data?.author_id));
				let document = await transaction.get(doc(this.db, "blogs", data?.blog_id));
				if (type === "comments") {
					notif = {
						desc: `@${author.data().username} commented on your post, "${removeHTML(document.data().heading)}"`,
						link: createLink(author.data().username, removeHTML(document.data()?.heading), data?.blog_id) + "#comments",
						message: data?.comment,
						type: "comment",
						receiver_id: data.receiver_id,
					};
				}
				if (type === "replies") {
					let reply_to = {};
					if (data?.reply_to) {
						reply_to = await transaction.get(doc(this.db, "replies", data?.reply_to));
						notif = {
							desc: `@${author.data().username} replied to your reply, "${truncateText(reply_to?.data().message)}"`,
							receiver_id: reply_to.data().author_id,
						};
					} else {
						reply_to = await transaction.get(doc(this.db, "comments", data?.base_comment_id));
						notif = {
							desc: `@${author.data().username} replied to your comment, "${truncateText(reply_to?.data().comment)}"`,
							receiver_id: reply_to.data().author_id,
						};
					}
					notif = {
						...notif,
						link: createLink(author.data().username, removeHTML(document.data()?.heading), data?.blog_id) + "#comments",
						message: data?.message,
						type: "reply",
					};
				}

				data = { ...data, timestamp: serverTimestamp(), likes: "", dislikes: "", upvotes: JSON.stringify([]) };
				addDoc(collection(this.db, type), data);
				this.insertNotification(notif);
				callback("success");
			});
		} catch (e) {
			console.log(e);
			callback({ error: true });
		}
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
		data = { ...data, timestamp: serverTimestamp() };
		if (!data.receivers) {
			data.status = "unread";
		}
		addDoc(collection(this.db, "notifications"), data);
	}
	fetchUserNotifications(user_id, callback) {
		// Create a query against the collection.
		try {
			let q1 = query(collection(this.db, "notifications"), where("receiver_id", "==", user_id));

			// Needs different queries since the or operator is not available
			onSnapshot(q1, async (res1) => {
				await this.fetchComplexNotifications(user_id, (res) => {
					let result = [
						...res1.docs.map((e) => {
							let data = { ...e.data(), notification_id: e.id };
							return data;
						}),
						...res,
					];
					callback(result);
				});
			});
		} catch (e) {
			console.log(e);
			callback({ error: "An error occurred" });
		}
	}

	async fetchComplexNotifications(user_id, callback) {
		let q1 = query(collection(this.db, "notifications"), where("receivers", "array-contains", { receiver_id: user_id, status: "read" }));
		let q2 = query(collection(this.db, "notifications"), where("receivers", "array-contains", { receiver_id: user_id, status: "unread" }));
		onSnapshot(q1, async (res1) => {
			onSnapshot(q2, async (res2) => {
				// Returns the 3 arrays.
				let result = [
					...res1.docs.map((e) => {
						let data = { ...e.data(), notification_id: e.id };
						// Strip out the receivers and add a status for the current user
						delete data.receivers;
						data.status = "read";
						return data;
					}),
					...res2.docs.map((e) => {
						let data = { ...e.data(), notification_id: e.id };
						// Strip out the receivers and add a status for the current user
						delete data.receivers;
						data.status = "unread";
						return data;
					}),
				];
				callback(result);
			});
		});
	}
	fetchUnreadNotifications(user_id, callback) {
		try {
			let q = query(collection(this.db, "notifications"), where("receiver_id", "==", user_id), where("status", "==", "unread"));
			let q2 = query(collection(this.db, "notifications"), where("receivers", "array-contains", { receiver_id: user_id, status: "unread" }));
			onSnapshot(q, async (res1) => {
				onSnapshot(q2, async (res2) => {
					let totalUnread = res1.docs.length + res2.docs.length;
					callback(totalUnread);
				});
				return;
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}
	async setReadNotification(notification_id, receiver_id, callback) {
		try {
			await runTransaction(this.db, async (transaction) => {
				// Fetch notification\
				let notificationDoc = await transaction.get(doc(this.db, "notifications", notification_id));
				notificationDoc = notificationDoc.data();
				if (notificationDoc.receivers) {
					let receivers = notificationDoc.receivers.map((e) => {
						return e.receiver_id === receiver_id && e.status === "unread" ? { ...e, status: "read" } : e;
					});
					transaction.update(doc(this.db, "notifications", notification_id), { receivers });
				} else {
					if (notificationDoc.status === "unread") transaction.update(doc(this.db, "notifications", notification_id), { status: "read" }, { merge: true });
				}
				callback("success");
			});
		} catch (e) {
			callback({ error: true });
		}
	}

	fetchFilteredNotifications(type, receiver_id, callback) {
		let q = "";
		if (type === "post") {
			this.fetchComplexNotifications(receiver_id, (res) => {
				callback(res);
			});
			return;
		}
		if (type === "all") {
			this.fetchUserNotifications(receiver_id, (res) => {
				callback(res);
			});
			return;
		}
		if (type === "posts") {
			q = query(collection(this.db, "notifications"));
		} else {
			q = query(collection(this.db, "notifications"), where("type", "==", type));
		}
		onSnapshot(q, (res) => {
			callback(
				res.docs.map((e) => {
					return { ...e.data(), notification_id: e.id };
				})
			);
		});
	}

	// Using server side filtering since the workarounds are paid methods
	getQuery(queryString, callback) {
		let q1 = collection(this.db, "blogs");
		onSnapshot(q1, (querySnapshot) => {
			// Getting data
			let blogs = querySnapshot.docs.map((doc) => {
				return { ...doc.data(), blog_id: doc.id };
			});

			// Filtering
			blogs = blogs.filter((e) => {
				return e.heading.toLowerCase().includes(queryString.toLowerCase()) || e.message.toLowerCase().includes(queryString.toLowerCase());
			});
			if (blogs.length === 0) {
				callback({ empty: true });
				return;
			}
			callback(blogs);
		});
	}

	searchBlogsWithATag(tag, callback) {
		let q1 = query(collection(this.db, "blogs"), where("topics", "array-contains", tag), orderBy("timestamp"));
		onSnapshot(q1, (querySnapshot) => {
			if (querySnapshot.empty) {
				callback({ empty: true });
				return;
			}
			// Getting data
			let blogs = querySnapshot.docs.map((doc) => {
				return { ...doc.data(), blog_id: doc.id };
			});
			console.log(blogs);
			callback(blogs);
		});
	}
}
