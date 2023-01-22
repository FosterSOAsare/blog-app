import React, { useRef } from "react";
import Error from "../form/Error";

const FormPopup = ({ desc, placeholder, type, setShow, proceed, error, errorFunc, opt1, inputType = "text" }) => {
	const bio = useRef(null);

	function clearErr() {
		errorFunc({ type: "clearError" });
	}
	function cancelEdit(e) {
		e.preventDefault();
		setShow(false);
	}
	return (
		<section className="formPopUp popup">
			<h3>{desc}</h3>
			<form action="">
				{type === "textarea" ? <textarea placeholder={placeholder} ref={bio} onFocus={clearErr} /> : <input type={inputType} ref={bio} placeholder={placeholder} onFocus={clearErr} />}
				{error.display !== "none" && <Error text={error.text} />}
				<div className="actions">
					<button onClick={(e) => proceed(e, bio.current.value)}>{opt1}</button>
					<button onClick={cancelEdit} className="cancel">
						Cancel
					</button>
				</div>
			</form>
		</section>
	);
};

export default FormPopup;
