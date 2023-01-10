import React from "react";
import { Link } from "react-router-dom";

const Button2 = ({ text, link }) => {
	return (
		<button className={`button2 ${text}`}>
			<Link to={link} className="link">
				{text}
			</Link>
		</button>
	);
};

export default Button2;
