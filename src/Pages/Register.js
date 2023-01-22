import React, { useState } from "react";
import Input from "../components/form/Input";
import PasswordInput from "../components/form/PasswordInput";
import { Link, Navigate } from "react-router-dom";
import Error from "../components/form/Error";
import { useAuthContext } from "../context/AuthContext";
import { useGlobalContext } from "../context/AppContext";
import { useEffect } from "react";

const Register = () => {
	const [registerData, setRegistrationData] = useState({ email: "", password: "", username: "" });
	const [isRegistered, setIsRegistered] = useState(false);
	let { error, errorFunc, verifications, waiting, setWaiting } = useAuthContext();
	let { firebase } = useGlobalContext();
	function handleSubmit(e) {
		if (waiting) return;
		e.preventDefault();
		setWaiting(true);

		// Validate email
		if (!verifications.verifyEmail(registerData.email)) {
			errorFunc({ type: "displayError", payload: "Please enter a valid email address" });
			return;
		}
		// Validate password
		if (!verifications.validatePassword(registerData.password)) {
			errorFunc({ type: "displayError", payload: "Password must contain at least eight characters, at least one number , both lower and uppercase letters and a special character" });
			return;
		}
		// Validate username
		if (!verifications.validateUsername(registerData.username)) {
			errorFunc({ type: "displayError", payload: "Username must contain at least three characters , any of the symbols ( . - _) and alphanumerics " });
			return;
		}

		// Check username exists. If no , create new user
		firebase.checkUserExists(registerData.username, (res) => {
			if (res?.length) {
				// username exists
				errorFunc({ type: "displayError", payload: "Username already exists. Choose a different one" });
				return;
			} else {
				// Create account
				firebase.createAnAuth(registerData.email, registerData.password, registerData.username, (res) => {
					if (res.error) {
						errorFunc({ type: "displayError", payload: res.error });
						return;
					}

					setIsRegistered(true);
					setWaiting(false);
				});
			}
		});
	}

	function handleChange(e) {
		setRegistrationData((prev) => {
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
				<h3>Create An Acount</h3>
				<form action="" onSubmit={handleSubmit}>
					<Input name="username" placeholder="Please enter a username" handleChange={handleChange} value={registerData.username} handleFocus={handleFocus} />
					<Input name="email" placeholder="Enter your email address" handleChange={handleChange} value={registerData.email} handleFocus={handleFocus} />
					<PasswordInput type="password" placeholder="************" handleChange={handleChange} value={registerData.password} handleFocus={handleFocus} />
					{error.display !== "none" && <Error text={error.text} />}
					<button>{!waiting ? "Sign Up" : "Waiting..."}</button>
				</form>
				<p className="rectify">
					Already have an account?
					<span>
						<Link to="/login" className="link">
							Sign in
						</Link>
					</span>
				</p>
			</main>

			{/* Redirecting to the login page at the moment will add Email verification soon */}
			{isRegistered && <Navigate to="/login" />}
		</>
	);
};

export default Register;
