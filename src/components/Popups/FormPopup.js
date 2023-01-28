import React, { useRef, useState } from "react";
import Error from "../form/Error";

const FormPopup = ({ desc, placeholder, type, setShow, proceed, error, errorFunc, opt1, inputType = "text", value = "" }) => {
	const bio = useRef(null);

	const [inputValue, storeValue] = useState(value);
	function clearErr() {
		errorFunc({ type: "clearError" });
	}
	function cancelEdit(e) {
		e.preventDefault();
		setShow(false);
	}

	function handleChange(e) {
		storeValue(e.target.value);
	}
	return (
		<section className="formPopUp popup">
			<div className="container">
				<h3>{desc}</h3>
				<form action="">
					{type === "textarea" ? (
						<textarea placeholder={placeholder} ref={bio} onFocus={clearErr} value={inputValue} onChange={handleChange} />
					) : (
						<input type={inputType} ref={bio} placeholder={placeholder} onFocus={clearErr} value={inputValue} onChange={handleChange} />
					)}
					{error.display !== "none" && <Error text={error.text} />}
					<div className="actions">
						<button onClick={(e) => proceed(e, bio.current.value)}>{opt1}</button>
						<button onClick={cancelEdit} className="cancel">
							Cancel
						</button>
					</div>
				</form>
			</div>
		</section>
	);
};

export default FormPopup;
