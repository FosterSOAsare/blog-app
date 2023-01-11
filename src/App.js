import "./App.scss";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./Pages/HomePage/HomePage";
import Shared from "./Pages/Shared";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Verifications from "./Pages/Verifications/Verifications";
import Profile from "./Pages/Profile/Profile";
import { useGlobalContext } from "./context/AppContext";

function LoginRequired({ children }) {
	const { credentials } = useGlobalContext();
	return credentials.userId ? children : <Navigate to="/login"></Navigate>;
}

function App() {
	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<Shared />}>
					<Route index element={<HomePage />}></Route>
					<Route path="register" element={<Register />}></Route>
					<Route path="login" element={<Login />}></Route>
				</Route>
				<Route
					path="/verifications"
					element={
						<LoginRequired>
							<Verifications />
						</LoginRequired>
					}
				></Route>
				<Route
					path="/profile"
					element={
						<LoginRequired>
							<Profile />
						</LoginRequired>
					}
				></Route>
			</Routes>
		</div>
	);
}

export default App;
