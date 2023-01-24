import React, { useEffect } from "react";
import { Navigate, useParams } from "react-router";
import { useGlobalContext } from "../../context/AppContext";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useReducer } from "react";

const Block = () => {
	const { userId } = useParams();
	const { firebase, credentials } = useGlobalContext();
	const [profileUser, setProfileUser] = useState({});
	const [navigate, setNavigate] = useState(false);
	const [blockedUsers, blockedUsersDispatchFunc] = useReducer(blockedUsersFunc, { blockedUsers: [], blockedDocument: null });

	function blockedUsersFunc(blockedUsers, action) {
		switch (action.type) {
			case "setBlockedDocument":
				return { ...blockedUsers, blockedDocument: action.payload };
			case "setBlockedUsers":
				return { ...blockedUsers, blockedUsers: action.payload };
			default:
				return blockedUsers;
		}
	}
	// Check to see if logged in user has blocked the author or not
	function checkBlockedByLoggedInUser() {
		if (blockedUsers?.blockedUsers.empty) {
			return false;
		}
		return blockedUsers?.blockedUsers?.includes(profileUser?.user_id);
	}
	// Fetch loggedInsers's blocks
	function toggleBlockUser(e) {
		// If blocked , filter and remove userId .
		//  IF not blocked , check to see the document exists . If no , just send the profile Users Id as blocked else push it to the existing
		let newData = [];
		if (blockedUsers?.blockedUsers.includes(profileUser?.user_id)) {
			newData = blockedUsers.blockedUsers.filter((e) => e !== profileUser?.user_id);
		} else {
			newData = [...blockedUsers.blockedUsers, profileUser?.user_id];
		}
		let type = checkBlockedByLoggedInUser() ? "unblock" : "block";

		firebase.storeBlockedUsers({ type, docId: blockedUsers?.blockedDocument, newData, user_id: credentials?.userId, username: profileUser?.username }, (res) => {
			if (res.error) return;
			// Naviagate to user's profile
			setNavigate(true);
		});
	}

	useEffect(() => {
		firebase.fetchUserWithId(userId, (res) => {
			setProfileUser(res);
		});
		// / Fetch the users who have been blocked by the loggedIn User
		firebase.fetchBlockedUsers(credentials?.userId, (res) => {
			blockedUsersDispatchFunc({ type: "setBlockedUsers", payload: res.blocks ? res.blocks : [] });
			blockedUsersDispatchFunc({ type: "setBlockedDocument", payload: res.doc_id ? res.doc_id : null });
		});
	}, [firebase, credentials?.userId, userId]);
	return (
		<>
			<section className="block confirmPopUp popup">
				<p>
					Are you sure you want to {checkBlockedByLoggedInUser() ? "unblock" : "block"} @{profileUser?.username}
				</p>
				<div className="actions">
					<button className={"block"} onClick={toggleBlockUser}>
						{checkBlockedByLoggedInUser() ? "Unblock" : "Block"}
					</button>
					<NavLink to={`/@${profileUser?.username}`} className="link cancel">
						Cancel
					</NavLink>
				</div>
			</section>
			{navigate && <Navigate to={`/@${profileUser?.username}`} />}
		</>
	);
};

export default Block;
