import React from "react";
import { useParams } from "react-router";
import UserInfo from "../../components/UserInfo/UserInfo";

const Profile = () => {
	const params = useParams();
	console.log(params);
	// Fetch data about user
	// Fetch blogs
	// Fetch user data
	// Fetch sponsors
	return (
		<main className="profile">
			<UserInfo />
		</main>
	);
};

export default Profile;
