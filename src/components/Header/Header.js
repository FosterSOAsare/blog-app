import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";
import Button2 from "../buttons/Button2";
import DesktopMenu from "./DesktopMenu";
import { useDarkContext } from "../../context/DarkContext";
import topics from "../../assets/scss/Topics";

const Header = () => {
	const { credentials, firebase, notFound } = useGlobalContext();
	const [menuDisplay, setMenuDisplay] = useState(false);
	const [topicsDisplay, setTopicsDisplay] = useState(false);

	const menuBtn = useRef(null);
	const topicsBtn = useRef(null);
	const { theme, toggleTheme } = useDarkContext();
	const [unreadNotifications, setUnreadNotifications] = useState(null);
	let balance = credentials?.user?.balance ? credentials?.user?.balance.toFixed(2) : 0.0;

	const formatter = new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	balance = formatter.format(balance);

	useEffect(() => {
		let parent = menuBtn.current;
		let parent2 = topicsBtn.current;
		let current = undefined;

		credentials.user &&
			!notFound &&
			document.addEventListener("mousemove", (e) => {
				current = e.target;
				if (parent.contains(e.target)) {
					setMenuDisplay(true);
				} else if (parent2.contains(e.target)) {
					setTopicsDisplay(true);
				} else {
					setTimeout(() => {
						!parent.contains(current) && setMenuDisplay(false);
						!parent2.contains(current) && setTopicsDisplay(false);
					}, 200);
				}
			});
	}, [credentials.user, notFound]);

	useEffect(() => {
		firebase.fetchUnreadNotifications(credentials?.userId, (res) => {
			if (res.error) return;
			setUnreadNotifications(res);
		});
	}, [firebase, credentials?.userId]);
	return (
		<>
			{!notFound && (
				<header>
					<div className="header__container">
						<h3 className="logo">
							<Link className="link" to="/">
								Blog
							</Link>
						</h3>

						<div className="left__side">
							<div className="content">
								{!credentials.userId && (
									<div className="ctas">
										<Button2 text="register" link="/register" />
										<Button2 text="login" link="/login" />
									</div>
								)}

								{credentials.userId && (
									<div className="profile__menu">
										<div ref={topicsBtn}>
											<p>Topics</p>
											{topicsDisplay && (
												<aside className="topics">
													{topics.map((e, index) => {
														return (
															<NavLink key={index} to={`/search/${e.toLowerCase()}`} className="link">
																{e}
															</NavLink>
														);
													})}
												</aside>
											)}
										</div>

										<Link to="/write" className="link">
											Write
										</Link>
									</div>
								)}
								<article className="controls">
									<Link className="search" to="/search">
										<i className="fa-solid fa-magnifying-glass"></i>
									</Link>
									<div className="theme">
										<i className={`fa-${theme === "light" ? "solid" : "regular"} fa-moon`} onClick={toggleTheme}></i>
									</div>
								</article>

								{credentials.userId && (
									<article className="user__notices">
										<Link className="notification" to="/notifications">
											<i className={`fa-solid fa-bell${unreadNotifications > 0 ? " unread" : ""}`}></i>
										</Link>
										<article ref={menuBtn}>
											<p className="balance">{balance}</p>
											{menuDisplay && <DesktopMenu {...credentials?.user} />}
										</article>
									</article>
								)}
							</div>
							<p className="username">{credentials?.user?.username}</p>
						</div>
					</div>
				</header>
			)}
		</>
	);
};

export default Header;
