import React from "react";

const Button1 = ({ text, iconClasses }) => {
	return (
		<button className="button1">
			<div className="icon">
				<i className={iconClasses}></i>
			</div>
			<p>{text}</p>
		</button>
	);
};

export default Button1;
