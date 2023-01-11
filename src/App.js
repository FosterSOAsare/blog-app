import "./App.scss";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./Pages/HomePage/HomePage";
import Shared from "./Pages/Shared";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Verifications from "./Pages/Verifications/Verifications";
import Profile from "./Pages/Profile/Profile";
import { useGlobalContext } from "./context/AppContext";
import Search from "./Pages/Search/Search";

function LoginRequired({ children }) {
	const { credentials } = useGlobalContext();
	return credentials.userId ? children : <Navigate to="/login"></Navigate>;
}

function CheckLogged({ children }) {
	const { credentials } = useGlobalContext();
	return !credentials.userId ? children : <Navigate to="/"></Navigate>;
}

function App() {
	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<Shared />}>
					<Route index element={<HomePage />}></Route>
					<Route path="search" element={<Search />}></Route>
					<Route
						path="register"
						element={
							<CheckLogged>
								<Register />
							</CheckLogged>
						}
					></Route>
					<Route
						path="login"
						element={
							<CheckLogged>
								<Login />
							</CheckLogged>
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
				</Route>
				<Route
					path="/verifications"
					element={
						<CheckLogged>
							<Verifications />
						</CheckLogged>
					}
				></Route>
			</Routes>
		</div>
	);
}

export default App;
