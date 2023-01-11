import React, { useReducer, useState } from "react";
import Input from "../components/form/Input";
import PasswordInput from "../components/form/PasswordInput";
import { Link, Navigate } from "react-router-dom";
import Error from "../components/form/Error";
import { useAuthContext } from "../context/AuthContext";
import { useGlobalContext } from "../context/AppContext";

const Register = () => {
	const [registerData, setRegistrationData] = useState({ email: "", password: "" });
	const [isRegistered, setIsRegistered] = useState(false);
	let { error, errorFunc, verifications } = useAuthContext();
	let { firebase } = useGlobalContext();
	function handleSubmit(e) {
		e.preventDefault();
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

		// Create account
		firebase.createAnAuth(registerData.email, registerData.password, (res) => {
			if (res.error) {
				errorFunc({ type: "displayError", payload: res.error });
				return;
			}

			setIsRegistered(true);
			// save user session
			// redirect to verifications page
			// console.log("");
		});
	}

	function handleChange(e) {
		setRegistrationData((prev) => {
			return { ...prev, [e.target.name]: e.target.value };
		});
	}

	function handleFocus() {
		errorFunc({ type: "clearError" });
	}
	return (
		<>
			<main>
				<h3>Create An Acount</h3>
				<form action="" onSubmit={handleSubmit}>
					<Input name="email" placeholder="Enter your email address" handleChange={handleChange} value={registerData.email} handleFocus={handleFocus} />
					<PasswordInput type="password" placeholder="************" handleChange={handleChange} value={registerData.password} handleFocus={handleFocus} />
					{error.display !== "none" && <Error text={error.text} />}
					<button>Sign Up</button>
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
