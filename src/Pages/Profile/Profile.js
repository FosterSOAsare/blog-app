import React, { useState, useReducer, useEffect } from "react";
import UserInfo from "../../components/UserInfo/UserInfo";
import FormPopup from "../../components/Popups/FormPopup";
import ConfirmPopup from "../../components/Popups/ConfirmPopup";
import Sponsors from "../../components/Sponsors/Sponsors";
import BlogPreview from "../../components/BlogPreview/BlogPreview";
import { useGlobalContext } from "../../context/AppContext";
import { useAuthContext } from "../../context/AuthContext";
import { useParams } from "react-router";
const Profile = () => {
	const [profileData, setProfileData] = useReducer(reducerFunc, { user: null, blogs: [] });
	const { verifications } = useAuthContext();
	let { firebase } = useGlobalContext();

	let username = useParams().username;
	username = username.split("@")[1];

	function reducerFunc(data, action) {
		switch (action.type) {
			case "storeUser":
				return { ...data, user: action.payload };
			case "storeBlogs":
				return { ...data, blogs: action.payload };
			case "setComment":
				return {
					...data,
					blogs: data.blogs.map((e) => {
						return e.blog_id === action.id ? { ...data, comments: action.payload } : e;
					}),
				};
			default:
				return data;
		}
	}

	// firebase.storeBio("This is a test");
	const [showEditForm, setShowEditForm] = useState(false);
	const [blockUserActive, setBlockUserActive] = useState(false);

	// Fetch data about user
	useEffect(() => {
		firebase.fetchUserWithUsername(username, (res) => {
			if (res?.error) {
				return;
			}
			setProfileData({ type: "storeUser", payload: res });
		});
		firebase.fetchBlogs(username, (blogs) => {
			setProfileData({ type: "storeBlogs", payload: blogs });
		});
	}, [firebase, username]);

	function blockUser(e) {
		console.log(e);
	}

	function saveBio(e, value) {
		e.preventDefault();
		if (!verifications.checkLength(value, 255)) {
			// Display error
			console.log("Dead");
			return;
		}
		// Save bio
		firebase?.storeBio(value, profileData.user.userId, (res) => {
			if (res === "success") {
				setShowEditForm(false);
			}
		});
	}
	return (
		<>
			<main className="profile">
				<UserInfo setShowEditForm={setShowEditForm} setBlockUserActive={setBlockUserActive} data={profileData.user} />
				{showEditForm && <FormPopup desc="Edit your bio" placeholder="Enter your new bio here" type="textarea" setShowEditForm={setShowEditForm} proceed={saveBio} />}
				{blockUserActive && (
					<ConfirmPopup desc={`Are you sure you want to block @${profileData?.user?.username}`} opt1="Block" opt2="Cancel" setShow={setBlockUserActive} proceed={blockUser} />
				)}
				<Sponsors data={profileData.user} />
			</main>
			<section id="blogs">
				{/* Fetcgin blogs */}
				{profileData.blogs.length > 0 &&
					profileData.blogs.map((e) => {
						return e ? <BlogPreview {...e} key={e.blog_id} /> : "";
					})}

				{!profileData?.blogs?.length && <p className="noblogs">Nothing here...</p>}
			</section>
		</>
	);
};

export default Profile;
