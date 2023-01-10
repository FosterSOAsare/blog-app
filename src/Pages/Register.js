import React from "react";
import Input from "../components/form/Input";
import PasswordInput from "../components/form/PasswordInput";
import { Link } from "react-router-dom";

const Register = () => {
	function handleSubmit(e) {
		e.preventDefault();
	}
	return (
		<main>
			<h3>Create An Acount</h3>
			<form action="" onSubmit={handleSubmit}>
				<Input type="text" placeholder="Enter your email address" />
				<PasswordInput type="password" placeholder="************" />
				<button>Sign Up</button>
			</form>
			<p className="rectify">
				Already have an account?{" "}
				<span>
					<Link to="/login" className="link">
						Sign in
					</Link>
				</span>
			</p>
		</main>
	);
};

export default Register;
