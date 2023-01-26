import React, { useState, useReducer, useEffect } from "react";
import UserInfo from "./UserInfo/UserInfo";
import FormPopup from "../../components/Popups/FormPopup";
import Sponsors from "../../components/Sponsors/Sponsors";
import BlogPreview from "../../components/BlogPreview/BlogPreview";
import { useGlobalContext } from "../../context/AppContext";
import { useAuthContext } from "../../context/AuthContext";
import { useParams } from "react-router";
import NotFound from "../NotFound/NotFound";
import Loading from "../../components/Loading/Loading";
import { useBlockedContext } from "../../context/BlockedContext";
const Profile = () => {
	const [profileData, setProfileData] = useReducer(reducerFunc, { user: null, blogs: null });
	const { error, errorFunc } = useAuthContext();
	const { verifications } = useAuthContext();
	let { firebase, credentials, credentialsDispatchFunc, notFound, setNotFound, blocked } = useGlobalContext();
	let { loggedInUserBlocked, checkBlockedByAuthor } = useBlockedContext();
	const [showEditForm, setShowEditForm] = useState(false);
	const [deleteUserActive, setDeleteUserActive] = useState(false);

	let username = useParams().username;
	username = username.split("@")[1];

	function reducerFunc(data, action) {
		switch (action.type) {
			case "storeUser":
				return { ...data, user: action.payload };
			case "storeBlogs":
				return { ...data, blogs: action.payload };
			case "setBlockedUsers":
				return { ...data, blockedUsers: action.payload };
			default:
				return data;
		}
	}

	// Check to see if the user of the current profile page has blocked the loggediIn user or not
	useEffect(() => {
		checkBlockedByAuthor(profileData?.user?.userId);
	}, [profileData?.user, checkBlockedByAuthor]);

	// Check to see if logged in user has blocked the author or not
	function checkBlockedByLoggedInUser() {
		if (blocked?.blockedUsers.empty) {
			return false;
		}
		return blocked?.blockedUsers?.includes(profileData?.user?.userId);
	}
	// Fetch data about user
	useEffect(() => {
		firebase.fetchUserWithUsername(username, (res) => {
			if (res?.error) {
				setNotFound(true);
				return;
			}
			setProfileData({ type: "storeUser", payload: res });
			setNotFound(false);
		});
		firebase.fetchBlogs(username, (blogs) => {
			if (blogs.error) {
				//
				return;
			}
			// sorts drafts and published articles
			blogs = [...blogs.filter((e) => e.type === "draft"), ...blogs.filter((e) => e.type === "publish")];
			console.log(blogs);
			setProfileData({ type: "storeBlogs", payload: blogs });
		});
	}, [firebase, username, notFound, setNotFound, credentials?.userId]);

	function saveBio(e, value) {
		e.preventDefault();

		if (verifications.checkLength(value, 10)) {
			// Display error
			errorFunc({ type: "displayError", payload: "Bio should not be less than 10 characters" });
			return;
		}
		if (!verifications.checkLength(value, 255)) {
			// Display error
			errorFunc({ type: "displayError", payload: "Bio should not be more than 255 characters" });
			return;
		}
		// Save bio
		firebase?.storeBio(value, profileData.user.userId, (res) => {
			if (res === "success") {
				setShowEditForm(false);
			}
		});
	}

	function deleteUser(e, value) {
		e.preventDefault();
		if (!verifications.validatePassword(value)) {
			errorFunc({ type: "displayError", payload: "Password must contain at least eight characters, at least one number , both lower and uppercase letters and a special character" });
			return;
		}

		// check password validity
		firebase.getUserObject((userObject) => {
			firebase.validatePassword(userObject, value, (res) => {
				if (res.error) {
					errorFunc({ type: "displayError", payload: "Please enter your valid password" });
					return;
				}
				// PAssword valid
				firebase.deleteAUser(userObject, (res) => {
					localStorage.setItem("userId", null);
					credentialsDispatchFunc({ type: "logout" });
				});
			});
		});
	}
	return (
		<>
			{!notFound && (
				<>
					<main className="profile">
						<UserInfo setShowEditForm={setShowEditForm} data={profileData.user} setDeleteUserActive={setDeleteUserActive} checkBlockedByLoggedInUser={checkBlockedByLoggedInUser} />
						{showEditForm && (
							<FormPopup
								desc="Edit your bio"
								placeholder="Enter your new bio here"
								type="textarea"
								setShow={setShowEditForm}
								proceed={saveBio}
								{...{ error, errorFunc }}
								opt1="Save Bio"
							/>
						)}
						{deleteUserActive && (
							<FormPopup
								desc="Are you sure you want to delete your account? Note : This will not delete your articles but will prevent you from logging in totally "
								placeholder="Enter account password "
								type="input"
								setShow={setDeleteUserActive}
								proceed={deleteUser}
								inputType="password"
								opt1="Delete Account"
								{...{ error, errorFunc }}
							/>
						)}
						{!loggedInUserBlocked && <Sponsors data={profileData.user} />}
						{loggedInUserBlocked && <p className="blocked"> You have been blocked by @{profileData?.user?.username}</p>}
					</main>

					{/* Articles section on profile page */}
					{!profileData?.blogs && <Loading className="profileLoading" errorStatus={false} />}
					{profileData?.blogs && profileData?.blogs.length > 0 && !loggedInUserBlocked && (
						<section id="articles">
							{profileData.blogs.length > 0 && (
								<>
									{/* drafts */}
									{credentials?.user?.username === profileData.user.username &&
										profileData.blogs
											.filter((e) => e.type === "draft")
											.map((e) => {
												return e ? <BlogPreview {...e} key={e.blog_id} /> : "";
											})}
									{/* Published articles */}
									{profileData.blogs
										.filter((e) => e.type === "publish")
										.map((e) => {
											return e ? <BlogPreview {...e} key={e.blog_id} /> : "";
										})}
								</>
							)}
						</section>
					)}
					{profileData?.blogs && profileData?.blogs.length === 0 && loggedInUserBlocked && <p className="noblogs">Nothing here...</p>}
				</>
			)}
			{notFound && <NotFound />}
		</>
	);
};

export default Profile;
