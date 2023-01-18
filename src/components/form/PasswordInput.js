import React, { useRef, useState } from "react";

const PasswordInput = ({ text, placeholder, handleChange, value, handleFocus, name = "password" }) => {
	const [type, setType] = useState(name);
	const input = useRef(null);

	function toggleType() {
		setType((prev) => (prev === "password" ? "text" : "password"));
	}
	return (
		<div className="passwordInput">
			<input type={type} ref={input} value={value} placeholder="********" name="password" onChange={(e) => handleChange(e)} onFocus={handleFocus} />
			<div className="icon" onClick={toggleType}>
				<i className={`fa-solid ${type === "password" ? "fa-eye" : "fa-eye-slash"}`}></i>
			</div>
		</div>
	);
};

export default PasswordInput;
