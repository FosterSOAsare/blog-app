import React from "react";
import { useParams } from "react-router";

const Profile = () => {
	const params = useParams();
	console.log(params);
	// Fetch data about user
	// Fetch blogs
	// Fetch user data
	// Fetch sponsors
	return <main className="profile">Profile</main>;
};

export default Profile;
