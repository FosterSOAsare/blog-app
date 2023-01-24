import React from "react";
import Error from "../../components/form/Error";
import { useAuthContext } from "../../context/AuthContext";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import EditorBalloon from "@ckeditor/ckeditor5-build-balloon";
import { useRef } from "react";
import { removeHTML } from "../../utils/Text";
import { useGlobalContext } from "../../context/AppContext";
import { useState } from "react";
import { Navigate } from "react-router";

const Report = () => {
	const { error, errorFunc } = useAuthContext();
	const [saved, setSaved] = useState(false);
	const [navigate, setNavigate] = useState(false);
	const report = useRef();
	const { firebase, credentials } = useGlobalContext();

	function validateReport(e) {
		e.preventDefault();
		let reportContent = report.current.editor.getData();
		if (removeHTML(reportContent).length < 25) {
			errorFunc({ type: "displayError", payload: "Report must be more than 25 characters long" });
			return;
		}

		// Store report
		firebase.storeReport(credentials?.userId, reportContent, (res) => {
			if (res.error) return;

			setSaved(true);
			setTimeout(() => {
				setNavigate(true);
			}, 1000);
		});
	}
	return (
		<section className="report">
			{!saved && (
				<>
					<h3>Enter report here:</h3>
					<p>Please make sure to attach releveant links to the report. Link to user's profile and others . You can also add images </p>

					<article className="editor">
						<CKEditor
							editor={EditorBalloon}
							data=""
							ref={report}
							onReady={(editor) => {
								// You can store the "editor" and use when it is needed.
								editor.editing.view.change((writer) => {
									writer.setStyle("min-height", "400px", editor.editing.view.document.getRoot());
									writer.setStyle("font-size", "17px", editor.editing.view.document.getRoot());
									writer.setStyle("border-radius", "3px", editor.editing.view.document.getRoot());
									writer.setStyle("border", "2px solid grey", editor.editing.view.document.getRoot());
								});
							}}
							onFocus={(e) => {
								errorFunc({ type: "clearError" });
							}}
							config={{ placeholder: "Enter report here..." }}
						/>
					</article>
					{error.display !== "none" && <Error text={error.text} />}
					<button type="submit" onClick={validateReport}>
						Submit
					</button>
				</>
			)}
			{navigate && <Navigate to="/" />}
			{saved && <p className="saved">Report has been saved successfully</p>}
		</section>
	);
};

export default Report;
