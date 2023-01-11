import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";
import Button2 from "../buttons/Button2";

const Header = () => {
	const { credentials } = useGlobalContext();
	// console.log(credentials);
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
							<div className="profileImg">{!credentials?.user?.imgSrc ? <i className="fa-solid fa-user"></i> : <img src={credentials.user.imgSrc}></img>}</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
