import React from "react";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";

const DesktopMenu = ({ profileLink }) => {
	const { firebase, credentialsDispatchFunc } = useGlobalContext();
	function logOut(e) {
		e.preventDefault();
		firebase.signOutUser((res) => {
			if (res.error) {
				//
				return;
			}
			credentialsDispatchFunc({ type: "logout" });
		});
	}
	return (
		<aside className="menu">
			<NavLink to="/" className="menuItem link">
				Home
			</NavLink>
			<NavLink to={`/@${profileLink}`} className="menuItem link">
				Profile
			</NavLink>
			<NavLink to="/write" className="menuItem link">
				Write
			</NavLink>
			<NavLink to={`/communities`} className="menuItem link">
				Communities
			</NavLink>

			<NavLink to={`/settings`} className="menuItem link">
				Settings
			</NavLink>
			<NavLink to={`/about`} className="menuItem link">
				About
			</NavLink>

			<NavLink to={`/logout`} className="menuItem link logout" onClick={logOut}>
				Logout
			</NavLink>
		</aside>
	);
};

export default DesktopMenu;
