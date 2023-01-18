import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";

const DesktopMenu = ({ username, img_src, balance }) => {
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
			<p className="menuItem link">
				${balance ? balance.toFixed(2) : 0.0} <span>Credit</span>
			</p>
			<Link className="profile link" to={`/@${username}`}>
				<div className="image">{img_src ? <img src={img_src} alt="Profile" /> : <i className="fa-solid fa-user"></i>}</div>
				<p className="text">{username}</p>
			</Link>
			<NavLink to="/account" className="menuItem link">
				My account
			</NavLink>
			<NavLink to={`/@${username}#articles`} className="menuItem link">
				My articles
			</NavLink>
			<NavLink to="/saved" className="menuItem link">
				Saved articles
			</NavLink>
			<NavLink to={`/communities`} className="menuItem link">
				Communities
			</NavLink>

			<NavLink to={`/moderations`} className="menuItem link">
				Moderation queue
			</NavLink>
			<NavLink to={`/sponsorships`} className="menuItem link">
				Sponsorships
			</NavLink>

			<NavLink to={`/logout`} className="menuItem link logout" onClick={logOut}>
				Logout
			</NavLink>
		</aside>
	);
};

export default DesktopMenu;
