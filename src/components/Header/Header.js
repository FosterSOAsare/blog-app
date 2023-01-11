import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";
import Button2 from "../buttons/Button2";
import DesktopMenu from "./DesktopMenu";

const Header = () => {
	const { credentials } = useGlobalContext();
	const [menuDisplay, setMenuDisplay] = useState(false);
	const user = useRef(null);

	useEffect(() => {
		let parent = user.current;
		let current = undefined;
		credentials.user &&
			document.addEventListener("mousemove", (e) => {
				current = e.target;
				if (parent.contains(e.target)) {
					setMenuDisplay(true);
				} else {
					setTimeout(() => {
						!parent.contains(current) && setMenuDisplay(false);
					}, 200);
				}
			});
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
					<Link className="search" to="/search">
						<i className="fa-solid fa-magnifying-glass"></i>
					</Link>
					{!credentials.userId && (
						<div className="ctas">
							<Button2 text="register" link="/register" />
							<Button2 text="login" link="/login" />
						</div>
					)}
					{credentials.userId && (
						<div className="profile">
							<p className="balance">$0.00</p>
							<div className="profileImg" ref={user}>
								{!credentials?.user?.imgSrc ? <i className="fa-solid fa-user"></i> : <img src={credentials.user.imgSrc} alt="User Profile"></img>}

								{menuDisplay && <DesktopMenu profileLink={credentials?.user?.username} />}
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
