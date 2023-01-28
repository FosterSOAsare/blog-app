import React from "react";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";
import { useDarkContext } from "../../context/DarkContext";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
const PhoneMenu = ({ logOut, setPhoneMenuDisplay }) => {
	const { credentials } = useGlobalContext();
	const { toggleTheme } = useDarkContext();
	const location = useLocation();
	const [prevLocation, setPrevLocation] = useState(location);

	useEffect(() => {
		if (location.pathname !== prevLocation.pathname) {
			setPhoneMenuDisplay(false);
			setPrevLocation(location);
		}
	}, [location, prevLocation, setPhoneMenuDisplay]);
	return (
		<aside className="phoneMenu">
			<div className="top">
				<button className="menuClose" onClick={() => setPhoneMenuDisplay(false)}>
					X
				</button>
			</div>
			<div className="content">
				<NavLink className="link" to="/">
					Homepage
				</NavLink>
				{credentials?.user && (
					<NavLink className="link" to="/notifications">
						Notifications
					</NavLink>
				)}
				{credentials?.user && (
					<NavLink className="link" to="/write">
						Write
					</NavLink>
				)}
				<button
					onClick={() => {
						setPhoneMenuDisplay(false);
						toggleTheme();
					}}>
					Dark/Light Theme
				</button>
				<NavLink className="link" to="/search">
					Search
				</NavLink>
				{credentials?.user && (
					<NavLink className="link" to="/sponsorships">
						Sponsorships
					</NavLink>
				)}
				{credentials?.user && (
					<button
						onClick={() => {
							setPhoneMenuDisplay(false);
							logOut();
						}}>
						Logout
					</button>
				)}
				{!credentials?.user && (
					<>
						<NavLink to="/login" className="link">
							Login
						</NavLink>
						<NavLink to="/regsiter" className="link">
							Sign up
						</NavLink>
					</>
				)}
			</div>
		</aside>
	);
};

export default PhoneMenu;
