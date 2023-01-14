import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";
import Button2 from "../buttons/Button2";
import DesktopMenu from "./DesktopMenu";

const Header = () => {
	const { credentials } = useGlobalContext();
	const [menuDisplay, setMenuDisplay] = useState(false);
	const user = useRef(null);
	// console.log(credentials);

	useEffect(() => {
		let parent = user.current;
		let current = undefined;
		// credentials.user &&
		// 	document.addEventListener("mousemove", (e) => {
		// 		current = e.target;
		// 		if (parent.contains(e.target)) {
		// 			setMenuDisplay(true);
		// 		} else {
		// 			setTimeout(() => {
		// 				!parent.contains(current) && setMenuDisplay(false);
		// 			}, 200);
		// 		}
		// 	});
	}, [credentials.user]);
	return (
		<header>
			<div className="header__container">
				<h3 className="logo">
					<Link className="link" to="/">
						Blog
					</Link>
				</h3>

				<div className="left__side">
					{!credentials.userId && (
						<div className="ctas">
							<Button2 text="register" link="/register" />
							<Button2 text="login" link="/login" />
						</div>
					)}

					{credentials.userId && (
						<div className="profile__menu">
							<p>Topics</p>
							<Link to="/communities" className="link">
								Communities
							</Link>
							<Link to="/write" className="link">
								Write
							</Link>
						</div>
					)}
					<article className="controls">
						<Link className="search" to="/search">
							<i className="fa-solid fa-magnifying-glass"></i>
						</Link>
					</article>

					{credentials.userId && (
						<article className="user__notices">
							<button className="notification">
								<i className="fa-solid fa-bell"></i>
							</button>
							<p className="balance">{credentials?.user?.balance ? "$" + credentials?.user?.balance.toFixed(2) : "$0.00"}</p>
						</article>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
