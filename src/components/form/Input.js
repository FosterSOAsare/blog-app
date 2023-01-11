import React from "react";

const Input = ({ name, placeholder, handleChange, value, handleFocus }) => {
	return <input type="text" placeholder={placeholder} name={name} value={value} onChange={(e) => handleChange(e)} onFocus={handleFocus} />;
};

export default Input;
