import React from "react";
import { useGlobalContext } from "../../context/AppContext";
import { useAuthContext } from "../../context/AuthContext";
import Error from "../../components/form/Error";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
const Forgotpassword = () => {
	const { firebase } = useGlobalContext();
	const { error, errorFunc, verifications } = useAuthContext();
	const [queryParams, setQueryParams] = useState({});
	const [waiting, setWaiting] = useState(false);
	const [changed, setChanged] = useState(false);

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		setQueryParams(Object.fromEntries(searchParams));
	}, []);

	useEffect(() => {
		if (error.display !== "none") setWaiting(false);
	}, [error.display]);

	function submitReset(e) {
		e.preventDefault();
		const email = new FormData(e.target).get("email");
		if (!verifications.verifyEmail(email)) {
			errorFunc({ type: "displayError", payload: "Please enter a valid email address" });
			return;
		}
		firebase.sendPasswordResetMail(email, (res) => {
			console.log(res);
			if (res?.error) {
				return;
			}
		});
	}

	function resetPassword(e) {
		e.preventDefault();
		let formData = new FormData(e.target);
		let newPassword = formData.get("password"),
			confirmPassword = formData.get("confirmPassword");
		setWaiting(true);
		// validate passwords
		if (!verifications.validatePassword(newPassword) || !verifications.validatePassword(confirmPassword)) {
			errorFunc({ type: "displayError", payload: "Password must contain at least eight characters, at least one number , both lower and uppercase letters and a special character" });
			return;
		}

		if (newPassword !== confirmPassword) {
			errorFunc({ type: "displayError", payload: "Passwords do not match" });
			return;
		}

		// Update password
		firebase.updatePassword(queryParams?.oobCode, newPassword, (res) => {
			setWaiting(false);
			if (res.error && res.payload) {
				errorFunc({ type: "displayError", payload: res.payload });
				return;
			}
			if (res.error) return;
			// Set navigation to login page
			setChanged(true);
		});
	}
	return (
		<section className="passwordReset">
			{!queryParams?.oobCode && (
				<div className="container">
					<h3>Enter your email to receive reset email</h3>
					<form action="" onSubmit={submitReset}>
						<input type="text" name="email" id="" onFocus={() => errorFunc({ type: "clearError" })} />
						{error.display !== "none" && <Error text={error.text} />}
						<button>Send link</button>
					</form>
				</div>
			)}
			{queryParams?.oobCode && queryParams.mode === "resetPassword" && (
				<div className="container">
					<h3>Choose a new password</h3>
					<form action="" onSubmit={resetPassword}>
						<label htmlFor="newPassword">Enter new password</label>
						<input type="password" name="password" placeholder="********" id="newPassword" onFocus={() => errorFunc({ type: "clearError" })} />
						<label htmlFor="confirmPassword"> Confirm new password</label>
						<input type="password" name="confirmPassword" placeholder="********" id="confirmPassword" onFocus={() => errorFunc({ type: "clearError" })} />
						{error.display !== "none" && <Error text={error.text} />}
						<button disabled={waiting}>{waiting ? "Waiting..." : "Reset password"}</button>
					</form>
				</div>
			)}
			{changed && <Navigate to="/login" />}
		</section>
	);
};

export default Forgotpassword;
