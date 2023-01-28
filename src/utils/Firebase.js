import { initializeApp } from "firebase/app";
import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updatePassword,
	EmailAuthProvider,
	reauthenticateWithCredential,
	deleteUser,
	onAuthStateChanged,
	sendPasswordResetEmail,
	confirmPasswordReset,
} from "firebase/auth";
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

	/**

	Create an authenticated user with email, password, and 
	Store the data in the users database collection
	@function
	@async
	@param {string} email - The email of the user.
	@param {string} password - The password of the user.
	@param {string} username - The username of the user.
	*/
	createAnAuth(email, password, username, callback) {
		createUserWithEmailAndPassword(this.auth, email, password)
			.then(async (userCredential) => {
				// Store Data in db collection
				await setDoc(doc(this.db, "users", userCredential.user.uid), {
					email,
					timestamp: serverTimestamp(),
					balance: Math.random() * 8000,
					username,
				});
				sendEmailVerification(userCredential.user, {
					url: "http://localhost:3000/login",
					handleCodeInApp: true,
				});
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

	/**

	Retrieves user data by signing in with email and password
	@function
	@param {string} email - The email of the user.
	@param {string} password - The password of the user.
	@param {function} callback - Callback function that returns the user or error message.
	*/
	getUserData(email, password, callback) {
		signInWithEmailAndPassword(this.auth, email, password)
			.then((userCredential) => {
				callback(userCredential.user);
			})
			.catch(() => {
				callback({ error: "An error occurred. Please check your login credentials" });
			});
	}
	/**

	Retrieves user data by uid
	@function
	@param {string} uid - The uid of the user.
	@param {function} callback - Callback function that returns the user data or error message.
	*/
	fetchUserWithUid(uid, callback) {
		try {
			onSnapshot(doc(this.db, "users", uid), (doc) => {
				callback(doc.data());
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}
	/**

	Check if a user exists in the database.
	@function
	@async
	@param {string} username - The username to search for.
	@param {function} callback - The callback function to execute after the query is complete.
	@returns {Array} result - An array of user objects that match the provided username.
	@throws {Error} An error occurred
	*/
	checkUserExists(username, callback) {
		try {
			const usersRef = collection(this.db, "users");
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
	/**

	Sign out a user from the authenticated state.
	@function
	@async
	@param {function} callback - The callback function to execute after the sign out is complete.
	@returns {boolean} true - If the sign out is successful.
	@throws {Error} An error occurred
	*/
	signOutUser(callback) {
		signOut(this.auth)
			.then(() => {
				callback(true);
			})
			.catch((error) => {
				callback({ error: "An error occurred" });
			});
	}
	/**
	@function storeBio
	@param {string} bio - The bio to be stored
	@param {string} userId - The id of the user whose bio is being stored
	@param {function} callback - The callback function to handle the response of the function
	@throws {object} callback - An error object with a message 'An error occurred' if an error is caught
	@returns {string} callback - 'success' if the bio is stored successfully
	*/
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

	/**
	 *
	 * @function
	 * @param {string} username - The username of the user to fetch
	 * @param {function} callback - The callback function that is called when the operation is complete
	 *
	 * The function attempts to fetch a user with the given username from the database.
	 * If a user is found, the callback function will be called with an object containing the user's data as well as their userId.
	 * If no user is found, the callback function will be called with an object containing an error message.
	 * In case of an error, the callback function will be called with an object containing an error message.
	 */
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
	/**

	Fetches the user document with the provided user ID from the "users" collection in the database.
	@function
	@async
	@param {string} user_id - The ID of the user to fetch.
	@param {function} callback - A callback function that will be called with the fetched user data.
	@returns {Object} An object containing the user's data and their unique ID.
*/
	fetchUserWithId(user_id, callback) {
		onSnapshot(doc(this.db, "users", user_id), (res) => {
			callback({ ...res.data(), user_id: res.id });
		});
	}
	/**

	Function to update a user's profile image in the database
	@function
	@async
	@param {File} image - The image file to be stored
	@param {string} userId - The user's ID
	@param {function} callback - The callback function to handle the result of the update
	*/
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
	/**
	@function storeImg
	@param {File} image - The image file to be uploaded
	@param {string} path - The path where the image will be stored in the storage bucket
	@param {function} callback - A callback function that is called with the result of the function
	This function is used to upload an image file to a Firebase storage bucket. It takes in an image file, a path where the image will be stored, and a callback function. It uses the Firebase storage API's uploadBytesResumable method to upload the image and the getDownloadURL method to get the download URL of the image. The callback function is called with the download URL of the image or an error message if an error occurs during the upload.
	*/
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
	/**
	Store a sponsorship request
	@function
	@async
	@param {Object} data - The sponsorship data.
	@param {File} data.image - The image associated with the sponsorship.
	@param {string} data.promo_text - The promotional text for the sponsorship.
	@param {string} data.promo_link - The link associated with the sponsorship.
	@param {string} data.sponsor_id - The id of the sponsor.
	@param {string} data.author_id - The id of the author.
	@param {function} callback - The callback function which returns the error or success.
	@returns {string} success - If the sponsorship is stored successfully.
`*/
	storeSponsorship(data, callback) {
		let ext = data.image.name.split(".");
		let name = ext[0] + new Date().getTime();
		ext = ext[ext.length - 1];
		name = name + "." + ext;

		try {
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
			callback({ error: true });
		}
	}
	/** 
	@function
	@async
	@param {string} userId - The id of the user whose sponsors are being fetched.
	@param {function} callback - A callback function that is called with the sponsors as an argument.
	@returns {void}
	@throws {Error} - If there is an error while fetching the sponsors.
	This function fetches the sponsors of the user with the specified ID and returns them through the callback function.
	*/
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
	/**
	 * *	
	@function
	@async
	@param {string} userId - The ID of the user for whom to fetch sponsored authors.
	@param {Function} callback - The callback function to handle the response.
	@description
	This function is used to fetch all the authors that are sponsored by a particular user.
	It performs a query on the 'sponsorships' collection, where the 'sponsor_id' field matches the provided userId.
	For each document returned by the query, it also fetches the user details of the corresponding author using the author_id field.
	Finally, it calls the provided callback function with the array of sponsorships along with the author details.
	@throws {Error} If an error occurs while fetching the sponsored authors.
*/
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
	/**
*
	@function payForSponsorship
	@async
	@param {string} sponsorship_id - The id of the sponsorship to be settled
	@param {string} sponsor_id - The id of the sponsor
	@param {string} author_id - The id of the author being sponsored
	@param {function} callback - Callback function to handle the response
	@description This function is used to make a payment for a sponsorship and update the balance of both sponsor and author. It also updates the status of the sponsorship to settled and sends a notification to the author.
*/
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
			callback("Transaction failed: ", e);
		}
	}

	/**
	@function
	@async
	@param {string} sponsorship_id - The ID of the sponsorship to be deleted.
	@param {string} author_id - The ID of the author associated with the sponsorship.
	@param {string} sponsor_id - The ID of the sponsor associated with the sponsorship.
	@param {function} callback - The callback function to handle the response.
	The function takes in the necessary parameters for identifying the sponsorship to be deleted, including the IDs of the author and sponsor associated with the sponsorship. It also takes in a callback function to handle the response. The function uses a Firestore transaction to delete the sponsorship document and insert a notification to the author that the sponsorship has been terminated.
	*/
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
	/**

	Fetches all pending sponsorship requests for a specific author.
	@async
	@function
	@param {string} author_id - The ID of the author whose pending sponsorship requests are being fetched.
	@param {function} callback - The callback function to be executed once the requests have been fetched.
	@returns {Object[]|{empty: boolean}|{error: boolean}} - An array of objects representing the pending sponsorship requests or an object indicating that no requests were found or an object indicating that an error occurred.
*/
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
	/**
	@function
	@async
	@param {string} request_id - The id of the sponsorship request to be fetched.
	@param {function} callback - The callback function to handle the response.
	@returns {Object} request - An object containing the details of the sponsorship request, including the request id. If request does not exist, returns an object with key "empty" and value true. If an error occurs, returns an object with key "error" and value true.
	*/
	fetchRequest(request_id, callback) {
		try {
			let q = doc(this.db, "sponsorships", request_id);
			onSnapshot(q, (querySnapshot) => {
				if (!querySnapshot.exists()) {
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
	/**

	@function moderateRequest
	@async
	@param {string} status - The status of the sponsorship request.
	@param {string} receiver_id - The user id of the person who receive the notification.
	@param {string} author_id - The user id of the author who created the sponsorship request.
	@param {string} request_id - The id of the sponsorship request.
	@param {function} callback - The callback function that will be called after the execution of the function.
	This function is used to moderate a sponsorship request. It runs a transaction that updates the status of the request and creates a notification for the receiver.
	*/
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
	/**

	Retrieves all the blogs from the "blogs" collection in the database. 
	If a username is provided, it filters the blogs by the author's username.
	@function
	@async
	@param {string} [username] - The username of the author whose blogs you want to retrieve.
	@param {function} callback - The callback function that is called with the retrieved blogs or an error object.

	When the blogs are received, the blogs are iterated and in each iteration , comments of the particular blog are fetched but
	being fetched means pushing the Promise that is yet to be resolved into a promises array.
	This is later resolved and the result passed to the callback function
*/
	fetchBlogs(username, callback) {
		try {
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
				if (result.length === 0) {
					callback({ empty: true });
					return;
				}
				callback(result);
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}

	/**
	 * Fethc subscriberrs of a particular user from the subscriptions collection where username feild === username (param)
	 *
	 * @param   {string}  username  The username of the author whose subscribers we are fecthing
	 * @param   {function}  callback  Receives the response after operration is successful or not
	 *
	 * @return  {void}
	 */
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

	/**
	 * Update the subscription document of an author when a user subscribes or unsubscribes
	 *
	 * @param   {An array containing new subscription data (followers)}
	 * @param   {string}  docId     The Id of the subscription document to be updated
	 * @param   {function}  callback  Receives the response from the operrtaion
	 *
	 */
	updateSubscription(data, docId, callback) {
		try {
			updateDoc(doc(this.db, "subscriptions", docId), { followers: data });
			callback("success");
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}

	/**
	 * Adds a new subscription document for first time users. When a user registers a new document fpor subscriptions is not created but done only when the user gets a first subscriber
	 * During this period , a new subscription is created
	 *
	 * @param   {array}  data       Followers array
	 * @param   {string}  username  Username of the author
	 * @param   {function}  callback  Receives response from the operation
	 *
	 * @return  {[type]}            [return description]
	 */
	addSubscription(data, username, callback) {
		try {
			addDoc(collection(this.db, "subscriptions"), { followers: data, username }).then((res) => {
				callback(res);
			});
		} catch (e) {
			callback({ error: "An error occurred" });
		}
	}

	/**
	 * Stores a new blog , stores a drafted article or for publishing a drafted article
	 *
	 * For new blogs , File is compulsory
	 * For drafts , Lead image is not compuslory but can be available
	 * For publishing a draft , lead image is not compulsory but can be available
	 *
	 * @param   {Object containing blog data}  data
	 * @param   {function}  callback Receives response from operation
	 *
	 * @description
	 * This is in two folds ,
	 *	Checks to see if data contains a file ,(drafts and publishing drafts)
	 * if yes, It stores the file , receives the res and stores the blog in the blogs document
	 * 			It stores the notifications (new blog , publishing a draft)
	 *
	 *  If no, it stores the data in the blogs document . And inserts a notification (publishing a draft)
	 *
	 */
	async storeBlog(data, callback) {
		try {
			// Store lead Image first
			let path = "blogs/" + data.name;
			// Valuable properties are been added to the data passed
			data = { ...data, timestamp: serverTimestamp(), likes: data.author_id, dislikes: "", viewers: [], savedCount: 0, upvotes: [] };

			if (data.file) {
				this.storeImg(data?.file, path, async (res) => {
					if (res.error) {
						return;
					}
					// Deleteion of some properties
					delete data.file;
					delete data.name;
					delete data.author_id;
					data.lead_image_src = res;
					if (!data.topics) delete data.topics;

					let draft_id = data.draft_id;
					let blog = "";

					// Checks if the article is a draft that is been published or a newly created article
					if (data.draft_id) {
						delete data.draft_id;
						blog = await updateDoc(doc(this.db, "blogs", draft_id), data);
					} else {
						blog = await addDoc(collection(this.db, "blogs"), data);
					}
					let blog_id = blog ? blog.id : draft_id;

					if (data.draft_id || data.type === "publish") {
						this.insertBlogNotification(data.author, data.heading, blog_id);
					}
					callback("success");
				});
			} else if (data.draft_id) {
				// No file set means the article is a drafted article
				let draft_id = data.draft_id;
				delete data.draft_id;
				await updateDoc(doc(this.db, "blogs", draft_id), data);
				this.insertBlogNotification(data.author, data.heading, draft_id);
				callback("success");
			} else {
				// Means we are saving a draft
				addDoc(collection(this.db, "blogs"), data);
				callback("success");
			}
		} catch (e) {
			callback({ error: true });
		}
	}

	/**
	 * This is used to store blog notifcatiosn > an extract from the above function
	 *
	 * @param   {string}  author   The name of the author of the published blog
	 * @param   {string}  heading  Heading of the new blog
	 * @param   {blog_id}  blog_id  Blog_id of the blog
	 *
	 * @description
	 * The function receives all the params and creates a notif object which fetches all the subscribers of the author and as well creates a link to the blog-page
	 * It adds an unread status to each subscriber to be updated when a user reads the blog
	 */
	async insertBlogNotification(author, heading, blog_id) {
		await runTransaction(this.db, async (transaction) => {
			let q = query(collection(this.db, "subscriptions"), where("username", "==", author));
			let subscriptions = await getDocs(q);

			let subscribers = [];
			if (!subscriptions.empty) {
				subscribers = subscriptions.docs[0].data().followers;
			}
			let notif = {
				desc: `@${author} has posted a new article, "${removeHTML(heading)}"`,
				link: createLink(author, removeHTML(heading), blog_id),
				receivers:
					subscribers.length > 0
						? subscribers.map((e) => {
								return { receiver_id: e, status: "unread" };
						  })
						: [],
				type: "post",
			};
			this.insertNotification(notif);
		});
	}
	/**
	 * Edit or update a blog
	 *
	 * @param   {Object}  data - Data contains all the updated parts of the post , heading , message , lead Image
	 * @param   {[type]}  callback  [receives the response after the opertaion has or hasn't completed successfully]
	 *
	 * @desc
	 * Update checks to see if an image is present in the file .
	 * If yes, Image is stored, the URL of the imgae is received , added to the data object and the blog updated with it
	 * Else , the blog is updated based on blog_id
	 */
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

			let blog_id = data.blog_id;
			delete data.blog_id;
			updateDoc(doc(this.db, "blogs", blog_id), data).then(() => {});
			callback("success");
		} catch (error) {
			callback({ error: "An error occurred " });
		}
	}

	/**
	 * Delete an article. (Action by author)
	 *
	 * @param   {string}  blog_id - the blog_id of the article that is been deleted
	 * @param   {function }  callback - receives the response from the deletedDoc()
	 *
	 */
	deleteArticle(blog_id, callback) {
		try {
			deleteDoc(doc(this.db, "blogs", blog_id));
			callback("success");
		} catch (e) {
			callback({ error: true });
		}
	}
	/**
	 * Updates the ratings on either a blog, comment or reply
	 * @param {string} type - The type (comments, blogs , replies ) matches the collection thatbholds the document
	 * @param {string} likes - The likes on the particular document
	 * @param {string} dislikes - The dislikes on the particular document
	 * @param {string} id - The id of the document
	 */
	updateRatings(type, likes, dislikes, id) {
		try {
			updateDoc(doc(this.db, type, id), { likes, dislikes }).then((res) => {});
		} catch (e) {}
	}

	/**
	 * Updates the bookmarkers of  a blog .
	 * Whanever a user bookmarks or unbookmarks the blog, this is called to update the bookmarks
	 * @param {string} blog_id - The ID of the blog to fetch.
	 * @param {function} callback - The callback function to call with the results. The callback will be passed an object containing either the blog data, an "empty" property, or an "error" property.
	 */
	updateBookmarks(blog_id, bookmarks, callback) {
		try {
			updateDoc(doc(this.db, "blogs", blog_id), { bookmarks }).then((res) => {});
		} catch (e) {
			callback(e);
		}
	}

	/**
	 * Fetches a blog from the database with the given ID.
	 * @param {string} blog_id - The ID of the blog to fetch.
	 * @param {function} callback - The callback function to call with the results.
	 * The callback will be passed an object containing either the blog data, an "empty" property, or an "error" property.
	 */
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
	/**
	 * Stores an upvote on either a blog, comment or reply
	 *
	 * @param   {string}  type         Either comments , replies , blogs
	 * @param   {string}  id           The id of the related document
	 * @param   {array}  upvotes      An array of objects containing upvotes information like user , amount and author image
	 * @param   {string}  receiver_id  the id of the author of the related document
	 * @param   {string}  sender_id    The id of the upvote sender
	 * @param   {number}  value        The amount of tip being sent
	 * @param   {string}  blog_id      The id of the related blog , (used in comments and replies)
	 * @param   {function}  callback     Receives details from operation
	 *
	 * @description
	 * A transaction is used for this
	 * The receiver Doc, senderDoc and post(blog) are fetched with the params provided
	 * If any of the documents are empty , An error is thrown
	 * the new balance of both the sender and receiver are calculated
	 *
	 * A notif object is created with the link to the blog-post and the reciver as well as other relevant ones
	 *
	 * A notification is inserted after the new user balances (receiver , sender) are updated
	 */
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
	/**
	 * Store comments or replies
	 *
	 * @param   {string}  type      Type should be either comments or replies
	 * @param   {Object to be stored as comment or reply}  data      This contauns the data to be stored as a comment or reply
	 * @param   {function }  callback  Function that receives the response from gtthe opertaion
	 *
	 *  @description
	 * The type matches the collection name and using that a new document is created in the collection with the data provided
	 * It also stores a notification within which the author of the blog, comment or reply is used as the receiver id and a link generated
	 */
	async storeCommentOrReply(type, data, callback) {
		try {
			await runTransaction(this.db, async (transaction) => {
				let notif = {};
				let author = await transaction.get(doc(this.db, "users", data?.author_id));
				let document = await transaction.get(doc(this.db, "blogs", data?.blog_id));
				if (type === "comments") {
					notif = {
						desc: `@${author.data().username} commented on your post, "${removeHTML(document.data().heading)}"`,
						link: createLink(document.data().author, removeHTML(document.data()?.heading), data?.blog_id) + "#comments",
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
						link: createLink(document.data().author, removeHTML(document.data()?.heading), data?.blog_id) + "#comments",
						message: data?.message,
						type: "reply",
					};
				}

				data = { ...data, timestamp: serverTimestamp(), likes: "", dislikes: "", upvotes: [] };
				addDoc(collection(this.db, type), data);
				this.insertNotification(notif);
				callback("success");
			});
		} catch (e) {
			callback({ error: true });
		}
	}

	/**
	*

	@param {string} type - The type of comments or replies to fetch. Should be either "comments" or "replies"
	@param {string} base_id - The ID of the blog or comment that the comments or replies belong to
	@param {string} sort - The sorting order of the comments or replies. Should be either "asc" or "desc"
	@param {function} callback - A callback function that takes an object as an argument. 
	The object will contain either an array of comments or replies, or an error object.
	*/
	async fetchCommentsOrReplies(type, base_id, sort, callback) {
		let field = type === "comments" ? "blog_id" : "base_comment_id";
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

	/**
*

	@function
	@async
	@param {function} callback - callback function that takes in a user object as an argument
	@returns {Object} - An object containing the user's information.
	This function retrieves the current user's information from the Firebase authentication service. If the user is not logged in, it returns an error object.
	*/
	getUserObject(callback) {
		onAuthStateChanged(this.auth, (res) => {
			if (res.auth?.currentUser) {
				callback(res.auth.currentUser);
			} else {
				callback({ error: true });
			}
		});
	}

	/**

	sendVerification is a function that sends a verification email to the user's email address
	@function
	@async
	@param {Object} user - the user object
	@param {function} callback - a callback function that will be called with the result of the operation
	@returns {void}
	*/
	sendVerification(user, callback) {
		callback(
			sendEmailVerification(user, {
				url: "http://localhost:3000/account",
				handleCodeInApp: true,
			})
		);
	}

	/**

	@function validatePassword
	@param {Object} user - The user object
	@param {string} password - The current password
	@param {Function} callback - The callback function that is called after the validation
	The function validates the provided password against the user's email in the authentication system.
	*/
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

	/**

	@function updateUsersPassword
	@param {Object} user - The user object
	@param {string} newPassword - The new password
	@param {Function} callback - The callback function that is called after the update
	The function updates the user's password in the authentication system
	*/
	updateUsersPassword(user, newPassword, callback) {
		updatePassword(user, newPassword)
			.then(() => {
				callback("success");
			})
			.catch((error) => {
				callback({ error: true });
			});
	}

	/**

	@function
	@async
	@param {string} user_id - The user_id of the user whose bookmarks are to be fetched.
	@param {function} callback - The callback function to handle the response from the function.
	@description This function fetches all the bookmarked blogs of a user from the "blogs" collection in the database and their comments from the "comments" collection. It is ordered by timestamp in descending order. It accepts a user_id and a callback function as its parameters.
	The callback function takes in an object as its parameter. 
	If the object contains a property 'empty' with a value of true, it means that no bookmarked blogs were found. 
	If it contains a property 'error' with a value of 'An error occurred', it means that an error occurred while trying to fetch bookmarked blogs. 
	Otherwise, it contains an array of bookmarked blogs with their comments.
	*/

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
	/**
	Inserts a new notification into the Firestore database.
	@param {Object} data - The data for the new notification. Should contain properties such as 'title', 'body', and 'receiver_id'.
	If 'receivers' is not provided, the status of the notification will be set as 'unread' for the 'receiver_id'
	The data is automatically timestamped with the server timestamp
	*/
	insertNotification(data) {
		data = { ...data, timestamp: serverTimestamp() };
		if (!data.receivers) {
			data.status = "unread";
		}
		addDoc(collection(this.db, "notifications"), data);
	}
	/**

	Fetches all the notifications for a user from the database.
	@function
	@async
	@param {string} user_id - The id of the user to fetch notifications for.
	@param {function} callback - The callback function to be called with the result of the query.
	@returns {Array} - An array of objects, each object representing a notification. Each object has a notification_id property and properties from the Firestore document.
	*/
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
			callback({ error: "An error occurred" });
		}
	}
	/**

	Fetch complex notifications for a specific user.(Notifications that has receivers instead of a receiver)
	@function
	@async
	@param {string} user_id - The user's id for which to fetch notifications.
	@param {function} callback - The callback function to execute after the query is complete.
	@returns {Array} result - An array of notifications with the status of each notification for the specified user.
	@throws {Error} An error 
	
	@desc 
	This fetches notifications that has receivers instead of a receiver . Since the receivers field is  an array of objects and the limitatiuons on firebase
	Twio different queries are made to fetch both read and unread notifcations . 
	These are then merged into each other at the end and passed to the callback function
	*/

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
	/**

	Fetch unread notifications for a specific user.
	@function
	@async
	@param {string} user_id - The user's id for which to fetch unread notifications.
	@param {function} callback - The callback function to execute after the query is complete.
	@returns {number} totalUnread - The total number of unread notifications for the specified user.
	@throws {Error} An error occurred

	@description
	This makes two queries , one for complex notifcations and the other for normal notifications
	Results are merged and passed to the callback
	*/
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
	/**

	@function setReadNotification
	@param {string} notification_id - The id of the notification to be updated
	@param {string} receiver_id - The id of the receiver whose status is to be updated
	@param {function} callback - A callback function to handle the result
	This function updates the status of the notification to 'read' for a specific receiver
*/
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
	/**

	@function fetchFilteredNotifications
	@param {string} type - The type of notification to filter by. Can be "post", "all", "posts", or any other specific type of notification.
	@param {string} receiver_id - The ID of the user who will receive the notifications.
	@param {function} callback - The callback function to be executed once the notifications have been retrieved.
	@description This function is used to fetch filtered notifications from the database, based on the specified type and receiver ID. The callback function passed in will be executed with the retrieved notifications as a parameter.
	*/
	fetchFilteredNotifications(type, receiver_id, callback) {
		let q = "";
		// Fetching all post notifcations (new Articles)
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

		q = query(collection(this.db, "notifications"), where("type", "==", type));
		onSnapshot(q, (res) => {
			callback(
				res.docs.map((e) => {
					return { ...e.data(), notification_id: e.id };
				})
			);
		});
	}
	/**
	*
	@function
	@param {object} userObject - The object containing information about the user to be deleted.
	@param {function} callback - The function that is called after the deletion is complete. It is passed one argument, the response from the deletion function.
	*/
	deleteAUser(userObject, callback) {
		deleteUser(userObject).then((res) => {
			callback(res);
		});
	}

	// Using server side filtering since the workarounds are paid methods
	/**
*
	@function
	@param {string} queryString - The string to search for in the blog collection
	@param {function} callback - Callback function to handle the response from the query
	This function queries the "blogs" collection in the Firebase Firestore and filters the results based on the provided queryString.
	The filtered results are passed to the callback function. If no results are found, the callback will be called with an object containing an "empty" property set to true.
	*/
	getQuery(queryString, callback) {
		let q1 = collection(this.db, "blogs");
		onSnapshot(q1, (querySnapshot) => {
			// Getting data
			let blogs = querySnapshot.docs.map((doc) => {
				return { ...doc.data(), blog_id: doc.id };
			});

			// Filtering
			blogs = blogs.filter((e) => {
				return (
					e.heading.toLowerCase().includes(queryString.toLowerCase()) ||
					e.message.toLowerCase().includes(queryString.toLowerCase()) ||
					e.author.toLowerCase().includes(queryString.toLowerCase()) ||
					e?.topics?.includes(queryString.toLowerCase())
				);
			});
			if (blogs.length === 0) {
				callback({ empty: true });
				return;
			}
			callback(blogs);
		});
	}

	/**

	@function
	@async
	@param {string} tag - The tag to be searched for in the blogs.
	@param {function} callback - A callback function to handle the response.
	@returns {(Object[]|{empty: boolean}|{error: boolean})} - Returns an array of objects containing blog data and the id of the blog if successful, or an object with a key of "empty" if no blogs were found with the specified tag, or an object with a key of "error" if an error occurs.
	*/
	searchBlogsWithATag(tag, callback) {
		let q1 = query(collection(this.db, "blogs"), where("topics", "array-contains", tag.toLowerCase()), orderBy("timestamp"));
		onSnapshot(q1, (querySnapshot) => {
			if (querySnapshot.empty) {
				callback({ empty: true });
				return;
			}
			// Getting data
			let blogs = querySnapshot.docs.map((doc) => {
				return { ...doc.data(), blog_id: doc.id };
			});

			callback(blogs);
		});
	}

	/**

	@function updateViewers
	@param {string} blog_id - ID of the blog to update the number of viewers.
	@param {an array of ips} newData - update the viewers on the blog
	@param {function} callback - Function to be called after the update is completed.
	*/
	updateViewers(blog_id, newData, callback) {
		try {
			updateDoc(doc(this.db, "blogs", blog_id), {
				viewers: newData,
			});
			callback("Success");
		} catch (e) {
			callback({ error: true });
		}
	}
	/**
	 *
	 * Send password reset email
	 * @function
	 * @param {string} email - The email of the user
	 * @param {function} callback - The function that will be called after the email is sent
	 */
	sendPasswordResetMail(email, callback) {
		try {
			sendPasswordResetEmail(this.auth, email, {
				url: "http://localhost:3000/login",
				handleCodeInApp: true,
			}).then((res) => {
				callback(res);
			});
		} catch (e) {
			callback({ error: true });
		}
	}

	/**
*
	@function
	@param {string} oob - The out-of-band email action code.
	@param {string} newPassword - The new password for the user.
	@param {function} callback - A callback function that will be called when the request is complete.
	*/
	updatePassword(oob, newPassword, callback) {
		confirmPasswordReset(this.auth, oob, newPassword)
			.then((res) => {
				callback("success");
			})
			.catch((error) => {
				if (error.code === "auth/invalid-action-code") {
					callback({ error: true, payload: "Invalid password reset link." });
				}
				callback({ error: true });
			});
	}
	/**
	 * Store blocked users list for a specific user in the "blocks" collection of the database, and also handle the unsubscription of the user from the blocked user's followers list.
	 * @async
	 * @function
	 * @param {object} data - An object containing the data for the operation
	 * @param {string} data.type - The type of operation, either "block" or "unblock"
	 * @param {string} data.username - The username of the user to be blocked/unblocked
	 * @param {string} data.user_id - The ID of the user performing the block/unblock operation
	 * @param {array} data.newData - The updated array of blocked users for the user
	 * @param {string} data.docId - The ID of the document of the blocked users list in the "blocks" collection, if it exists
	 * @param {function} callback - The callback function to be called with the result of the operation
	 */
	async storeBlockedUsers(data, callback) {
		try {
			if (data.type === "block") {
				let q = query(collection(this.db, "subscriptions"), where("username", "==", data.username));
				getDocs(q).then((res) => {
					let subscriptionsData = { ...res.docs[0].data(), id: res.docs[0].id };
					let followersArray = subscriptionsData.followers;
					// Check if user is subscribed or not
					if (followersArray.includes(data.user_id)) {
						let newData = followersArray.filter((e) => e !== data.user_id);
						updateDoc(doc(this.db, "subscriptions", subscriptionsData.id), {
							followers: newData,
						});
					}
				});

				// 		// Unsubscribe from the user
				// 		// Store blocked
			}
			if (!data.docId) {
				addDoc(collection(this.db, "blocks"), {
					user_id: data.user_id,
					blocks: data.newData,
				});
			} else {
				updateDoc(doc(this.db, "blocks", data.docId), { blocks: data.newData });
			}
			callback("success");
		} catch (e) {
			callback({ error: true });
		}
	}
	/**
	 * Fetch the blocked users list for a specific user from the "blocks" collection of the database
	 * @function
	 * @param {string} user_id - The ID of the user to fetch the blocked users list for
	 * @param {function} callback - The callback function to be called with the result of the fetch operation
	 */
	fetchBlockedUsers(user_id, callback) {
		try {
			let q = query(collection(this.db, "blocks"), where("user_id", "==", user_id));
			onSnapshot(q, (res) => {
				if (res.empty) {
					callback({ empty: true });
					return;
				}

				callback({ ...res.docs[0].data(), doc_id: res.docs[0].id });
			});
		} catch (e) {
			callback({ error: true });
		}
	}
	/**
	 * Store a report in the "reports" collection of the database
	 * @function
	 * @param {string} user_id - The ID of the user who submitted the report
	 * @param {string} report - The content of the report
	 * @param {function} callback - The callback function to be called with the result of the storage operation
	 */
	storeReport(user_id, report, callback) {
		try {
			addDoc(collection(this.db, "reports"), {
				user_id: user_id || "guest",
				report,
			});
			callback("success");
		} catch (e) {
			callback({ error: true });
		}
	}
}
