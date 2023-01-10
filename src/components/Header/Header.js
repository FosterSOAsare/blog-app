import React from "react";
import { Link, NavLink } from "react-router-dom";
import Button2 from "../buttons/Button2";

const Header = () => {
	return (
		<header>
			<div className="header__container">
				<h3 className="logo">
					<Link className="link" to="/">
						Blog
					</Link>
				</h3>
				<div className="left__side">
					<Button2 text="register" link="/register" />
					<Button2 text="login" link="/login" />
				</div>
			</div>
		</header>
	);
};

export default Header;
