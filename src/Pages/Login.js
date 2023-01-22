import React, { useState, useEffect } from "react";

import Input from "../components/form/Input";
import PasswordInput from "../components/form/PasswordInput";
import { Link, Navigate } from "react-router-dom";
import { useGlobalContext } from "../context/AppContext";
import Error from "../components/form/Error";
import { useAuthContext } from "../context/AuthContext";
const Login = () => {
	const [loginData, setLoginData] = useState({ email: "", password: "" });

	let { error, errorFunc, verifications, setWaiting, waiting } = useAuthContext();
	const { firebase, credentials, credentialsDispatchFunc } = useGlobalContext();

	function handleSubmit(e) {
		e.preventDefault();
		if (waiting) return;
		setWaiting(true);
		// Validate email
		if (!verifications.verifyEmail(loginData.email)) {
			errorFunc({ type: "displayError", payload: "Please enter a valid email address" });
			return;
		}
		// Validate password
		if (!verifications.validatePassword(loginData.password)) {
			errorFunc({ type: "displayError", payload: "Password must contain at least eight characters, at least one number , both lower and uppercase letters and a special character" });
			return;
		}

		// Get users account

		firebase.getUserData(loginData.email, loginData.password, (user) => {
			// check unverified and redirect to verification page after sending veification email
			// if (!user.verified) {
			// 	return;
			// }
			if (user.error) {
				errorFunc({ type: "displayError", payload: user.error });
				return;
			}
			credentialsDispatchFunc({ type: "login", payload: user.uid });
		});
	}
	function handleChange(e) {
		setLoginData((prev) => {
			return { ...prev, [e.target.name]: e.target.value };
		});
	}
	useEffect(() => {
		errorFunc({ type: "clearError" });
	}, [errorFunc]);

	useEffect(() => {
		if (error.display === "block") {
			setWaiting(false);
		}
	}, [error, setWaiting]);

	function handleFocus() {
		errorFunc({ type: "clearError" });
	}

	return (
		<>
			<main>
				<h3>Log into your Acount</h3>
				<form action="" onSubmit={handleSubmit}>
					<Input name="email" placeholder="Enter your email address" handleChange={handleChange} value={loginData.email} handleFocus={handleFocus} />
					<PasswordInput type="password" placeholder="************" handleChange={handleChange} value={loginData.password} handleFocus={handleFocus} />
					{error.display !== "none" && <Error text={error.text} />}
					<button>{waiting ? "Waiting..." : "Log in"}</button>
				</form>
				<p className="rectify">
					Already have an account?
					<span>
						<Link to="/register" className="link">
							Sign up
						</Link>
					</span>
				</p>
			</main>
			{credentials.user && <Navigate to="/"></Navigate>}
		</>
	);
};

export default Login;
