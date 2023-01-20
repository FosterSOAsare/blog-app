import React, { useState, useReducer, useEffect } from "react";
import UserInfo from "./UserInfo/UserInfo";
import FormPopup from "../../components/Popups/FormPopup";
import ConfirmPopup from "../../components/Popups/ConfirmPopup";
import Sponsors from "../../components/Sponsors/Sponsors";
import BlogPreview from "../../components/BlogPreview/BlogPreview";
import { useGlobalContext } from "../../context/AppContext";
import { useAuthContext } from "../../context/AuthContext";
import { useParams } from "react-router";
import Loading from "../../components/Loading/Loading";
const Profile = () => {
	const [profileData, setProfileData] = useReducer(reducerFunc, { user: null, blogs: null });
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
		if (!verifications.checkLength(value, 255)) {
			// Display error
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
