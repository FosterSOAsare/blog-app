import React from "react";
import Input from "../components/form/Input";
import PasswordInput from "../components/form/PasswordInput";
import { Link } from "react-router-dom";

const Login = () => {
	function handleSubmit(e) {
		e.preventDefault();
	}
	return (
		<main>
			<h3>Log into your Acount</h3>
			<form action="" onSubmit={handleSubmit}>
				<Input type="text" placeholder="Enter your email address" />
				<PasswordInput type="password" placeholder="************" />
				<button>Log in</button>
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
	);
};

export default Login;
