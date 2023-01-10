import React, { useRef, useState } from "react";

const PasswordInput = ({ text, placeholder }) => {
	const [type, setType] = useState("password");
	const input = useRef(null);

	function toggleType() {
		setType((prev) => (prev == "password" ? "text" : "password"));
	}
	return (
		<div className="passwordInput">
			<input type={type} ref={input} placeholder="********" />
			<div className="icon" onClick={toggleType}>
				<i className={`fa-solid ${type === "password" ? "fa-eye" : "fa-eye-slash"}`}></i>
			</div>
		</div>
	);
};

export default PasswordInput;
