import React, { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import Error from "../../components/form/Error";
import { useAuthContext } from "../../context/AuthContext";
import Loading from "../../components/Loading/Loading";
const Account = () => {
	const [showPasswordChange, setShowPasswordChange] = useState();
	const [userObject, setUserObject] = useState({});
	const myForm = useRef(null);
	const { firebase } = useGlobalContext();
	let { error, errorFunc, verifications } = useAuthContext();
	// Fetch user object
	useEffect(() => {
		firebase.getUserObject((res) => {
			if (res?.error) return;
			setUserObject(res);
		});
	}, [firebase]);

	function changePassword(e) {
		e.preventDefault();
		let formData = new FormData(myForm.current);
		let password = formData.get("currentPassword"),
			newPassword = formData.get("newPassword"),
			confirmPassword = formData.get("confirmPassword");
		// Verifications
		if (!password || !newPassword || !confirmPassword) {
			errorFunc({ type: "displayError", payload: "Please fill in all fileds" });
			return;
		}
		if (!verifications.validatePassword(password) || !verifications.validatePassword(newPassword) || !verifications.validatePassword(confirmPassword)) {
			errorFunc({ type: "displayError", payload: "Password must contain at least eight characters, at least one number , both lower and uppercase letters and a special character" });
			return;
		}
		if (newPassword !== confirmPassword) {
			errorFunc({ type: "displayError", payload: "Passwords do not match" });
			return;
		}
		// // Verifying password
		firebase.validatePassword(userObject, password, (res) => {
			if (res.error) {
				errorFunc({ type: "displayError", payload: "Please enter your valid password" });
				return;
			}
			firebase.updateUsersPassword(userObject, newPassword, (res) => {
				if (res.error) {
					errorFunc({ type: "displayError", payload: "An error occurred" });
					return;
				}
				setShowPasswordChange(false);
			});
		});
	}
	return (
		<>
			{userObject?.email && (
				<div className="account">
					<h3>My account</h3>
					<div className="details">
						<div className="email">
							<h3>My email</h3>
							<p>My email</p>
							<div className="email__address">{userObject?.email}</div>
							{!userObject?.emailVerified && (
								<>
									<p className="warning">Email address not verified. Do so to avoid account loss</p>
									<button
										className="verification"
										onClick={() =>
											firebase.sendVerification(userObject, (res) => {
												if (res?.error) return;
												console.log(res);
											})
										}>
										Send Verification
									</button>
								</>
							)}
							<p className="desc">Cannot be changed</p>
						</div>
						<div className="password">
							<h3>My Password</h3>
							{!showPasswordChange && <button onClick={() => setShowPasswordChange(true)}>Change</button>}
							{showPasswordChange && (
								<form ref={myForm}>
									<label htmlFor="currentPassword">Current Password</label>
									<input type="password" id="currentPassword" name="currentPassword" placeholder="*********" onFocus={() => errorFunc({ type: "clearError" })} />
									<label htmlFor="newPassword">New Password</label>
									<input type="password" id="newPassword" name="newPassword" placeholder="*********" onFocus={() => errorFunc({ type: "clearError" })} />
									<label htmlFor="confirmPassword">New Password (confirm)</label>
									<input type="password" id="confirmPassword" name="confirmPassword" placeholder="*********" onFocus={() => errorFunc({ type: "clearError" })} />
									{error.display !== "none" && <Error text={error?.text} />}

									<div className="controls">
										<button onClick={changePassword} className="change">
											Change
										</button>
										<button
											id="cancel"
											onClick={(e) => {
												e.preventDefault();
												setShowPasswordChange(false);
											}}>
											Cancel
										</button>
									</div>
								</form>
							)}
						</div>
					</div>
				</div>
			)}
			{!userObject?.email && <Loading />}
		</>
	);
};

export default Account;
