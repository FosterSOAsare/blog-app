import React, { useState, useReducer, useEffect } from "react";
import UserInfo from "./UserInfo/UserInfo";
import FormPopup from "../../components/Popups/FormPopup";
import ConfirmPopup from "../../components/Popups/ConfirmPopup";
import Sponsors from "../../components/Sponsors/Sponsors";
import BlogPreview from "../../components/BlogPreview/BlogPreview";
import { useGlobalContext } from "../../context/AppContext";
import { useAuthContext } from "../../context/AuthContext";
import { Navigate, useParams } from "react-router";
import Loading from "../../components/Loading/Loading";
const Profile = () => {
	const [profileData, setProfileData] = useReducer(reducerFunc, { user: null, blogs: null });
	const { error, errorFunc } = useAuthContext();
	const { verifications } = useAuthContext();
	let { firebase, credentialsDispatchFunc } = useGlobalContext();

	let username = useParams().username;
	username = username.split("@")[1];

	function reducerFunc(data, action) {
		switch (action.type) {
			case "storeUser":
				return { ...data, user: action.payload };
			case "storeBlogs":
				return { ...data, blogs: action.payload };
			default:
				return data;
		}
	}

	const [showEditForm, setShowEditForm] = useState(false);
	const [blockUserActive, setBlockUserActive] = useState(false);
	const [deleteUserActive, setDeleteUserActive] = useState(false);

	// Fetch data about user
	useEffect(() => {
		firebase.fetchUserWithUsername(username, (res) => {
			if (res?.error) {
				return;
			}
			setProfileData({ type: "storeUser", payload: res });
		});
		firebase.fetchBlogs(username, (blogs) => {
			if (blogs.error) {
				//
				return;
			}
			setProfileData({ type: "storeBlogs", payload: blogs });
		});
	}, [firebase, username]);

	function blockUser(e) {
		console.log(e);
	}

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
			console.log(value);
			firebase.validatePassword(userObject, value, (res) => {
				if (res.error) {
					errorFunc({ type: "displayError", payload: "Please enter your valid password" });
					return;
				}
				// PAssword valid
				firebase.deleteAUser(userObject, (res) => {
					console.log(res);
					localStorage.setItem("userId", null);
					credentialsDispatchFunc({ type: "logout" });
				});
			});
		});
	}
	return (
		<>
			<main className="profile">
				<UserInfo setShowEditForm={setShowEditForm} setBlockUserActive={setBlockUserActive} data={profileData.user} setDeleteUserActive={setDeleteUserActive} />
				{showEditForm && (
					<FormPopup desc="Edit your bio" placeholder="Enter your new bio here" type="textarea" setShow={setShowEditForm} proceed={saveBio} {...{ error, errorFunc }} opt1="Save Bio" />
				)}
				{blockUserActive && (
					<ConfirmPopup desc={`Are you sure you want to block @${profileData?.user?.username}`} opt1="Block" opt2="Cancel" setShow={setBlockUserActive} proceed={blockUser} {...{ error }} />
				)}
				{deleteUserActive && (
					<FormPopup
						desc="Are you sure you want to delete your account?"
						placeholder="Enter account password "
						type="input"
						setShow={setDeleteUserActive}
						proceed={deleteUser}
						inputType="password"
						opt1="Delete Account"
						{...{ error, errorFunc }}
					/>
				)}
				<Sponsors data={profileData.user} />
			</main>

			{!profileData?.blogs && <Loading className="profileLoading" errorStatus={false} />}
			{profileData?.blogs && profileData?.blogs.length > 0 && (
				<section id="articles">
					{profileData.blogs.length > 0 &&
						profileData.blogs.map((e) => {
							return e ? <BlogPreview {...e} key={e.blog_id} /> : "";
						})}
				</section>
			)}
			{profileData?.blogs && profileData?.blogs.length === 0 && <p className="noblogs">Nothing here...</p>}
		</>
	);
};

export default Profile;
