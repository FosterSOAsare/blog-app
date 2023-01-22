import React, { useRef } from "react";
import Error from "../form/Error";

const FormPopup = ({ desc, placeholder, type, setShowEditForm, proceed, error, errorFunc }) => {
	const bio = useRef(null);
	console.log(error);

	function clearErr() {
		errorFunc({ type: "clearError" });
	}
	function cancelEdit(e) {
		e.preventDefault();
		setShowEditForm(false);
	}
	return (
		<section className="formPopUp popup">
			<h3>{desc}</h3>
			<form action="">
				{type === "textarea" ? <textarea placeholder={placeholder} ref={bio} onFocus={clearErr} /> : <input type="text" ref={bio} placeholder={placeholder} onFocus={clearErr} />}
				{error.display !== "none" && <Error text={error.text} />}
				<div className="actions">
					<button onClick={(e) => proceed(e, bio.current.value)}>Save bio</button>
					<button onClick={cancelEdit} className="cancel">
						Cancel
					</button>
				</div>
			</form>
		</section>
	);
};

export default FormPopup;
