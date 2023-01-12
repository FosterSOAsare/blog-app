import React, { useRef } from "react";
import Error from "../form/Error";
import { useAuthContext } from "../../context/AuthContext";

const FormPopup = ({ desc, placeholder, type, setShowEditForm, proceed }) => {
	let { error, errorFunc } = useAuthContext();
	const bio = useRef(null);

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
				{error.display !== "none" && <Error text="Bio should not be more than 255 characters" />}
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
