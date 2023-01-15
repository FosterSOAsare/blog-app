import "./App.scss";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./Pages/HomePage/HomePage";
import Shared from "./Pages/Shared";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Verifications from "./Pages/Verifications/Verifications";
import Communities from "./Pages/Communities/Communities";
import Profile from "./Pages/Profile/Profile";
import Blog from "./Pages/Blog/Blog";
import { useGlobalContext } from "./context/AppContext";
import Search from "./Pages/Search/Search";
import CreateBlog from "./Pages/CreateBlog/CreateBlog";

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
					<Route path="write" element={<LoginRequired><CreateBlog /></LoginRequired>}></Route>
					<Route path="/:username">
						<Route index  element={<Profile />}></Route>
						<Route path=":blogTitle"  element={<Blog />} ></Route>
					</Route>
					<Route path="search" element={<Search />}></Route>
					<Route path="communities" element={<Communities />}></Route>
					<Route path="moderations" element={<Communities />}></Route>
					<Route path="register" element={<CheckLogged><Register /></CheckLogged>}></Route>
					<Route path="login" element={<CheckLogged><Login /></CheckLogged>}></Route>
				</Route>
				<Route path="/verifications" element={<CheckLogged><Verifications /></CheckLogged> }></Route>
			</Routes>
		</div>
	);
}

export default App;
