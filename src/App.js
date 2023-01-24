import "./App.scss";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./Pages/HomePage/HomePage";
import Shared from "./Pages/Shared";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Verifications from "./Pages/Verifications/Verifications";
import Profile from "./Pages/Profile/Profile";
import Blog from "./Pages/Blog/Blog";
import { useGlobalContext } from "./context/AppContext";
import Search from "./Pages/Search/Search";
import CreateBlog from "./Pages/CreateBlog/CreateBlog";
import Account from "./Pages/Account/Account";
import Saved from "./Pages/Saved/Saved";
import Sponsorships from "./Pages/Sponsorships/Sponsorships";
import NewSponsorship from "./Pages/Sponsorships/NewSponsorship/NewSponsorship";
import Requests from "./Pages/Sponsorships/Requests/Requests";
import Request from "./Pages/Sponsorships/Requests/Request/Request";
import Notifications from "./Pages/Notifications/Notifications";
import ComingSoon from "./Pages/ComingSoon/ComingSoon";
import { useDarkContext } from "./context/DarkContext";
import NotFound from "./Pages/NotFound/NotFound";
import Block from "./Pages/Block/Block";

function LoginRequired({ children }) {
	const { credentials } = useGlobalContext();
	return credentials.userId ? children : <Navigate to="/login"></Navigate>;
}

function CheckLogged({ children }) {
	const { credentials } = useGlobalContext();
	return !credentials.userId ? children : <Navigate to="/"></Navigate>;
}

function App() {
	const {theme } = useDarkContext();
	return (
		<div className={`App ${theme}`}>
			<Routes>
				<Route path="/" element={<Shared />}>
					<Route index element={<HomePage />}></Route>
					<Route path="write" element={<LoginRequired><CreateBlog /></LoginRequired>}></Route>
					<Route path="account" element={<LoginRequired><Account /></LoginRequired>}></Route>
					<Route path="saved" element={<LoginRequired><Saved /></LoginRequired>}></Route>
					<Route path="/:username">
						<Route index  element={<Profile />}></Route>
						<Route path="edit/:blogId"  element={<LoginRequired><CreateBlog /></LoginRequired>} ></Route>
						<Route path=":blogTitle"  element={<Blog />} ></Route>
					</Route>
					<Route path="search" >
						<Route index element={<Search />}></Route>
						<Route path=":topic" element={<Search/>}></Route>
					</Route>
					<Route path="report" element={<ComingSoon />}></Route>
					<Route path="sponsorships" >
						<Route index element={<LoginRequired><Sponsorships /></LoginRequired>}></Route>
						<Route path="new/:userId" element={<LoginRequired><NewSponsorship /></LoginRequired>}></Route>
						<Route path="requests">
							<Route index element={<LoginRequired><Requests /></LoginRequired>}></Route>
							<Route path=":request_id" element={<LoginRequired><Request /></LoginRequired>}></Route>
						</Route>
					</Route>
					<Route path="register" element={<CheckLogged><Register /></CheckLogged>}></Route>
					<Route path="notifications"  element={<LoginRequired><Notifications /></LoginRequired>} ></Route>
					<Route path="login" element={<CheckLogged><Login /></CheckLogged>}></Route>
				</Route>
				<Route path="/verifications" element={<CheckLogged><Verifications /></CheckLogged> }></Route>
				<Route path="/block/:userId" element={<LoginRequired><Block /></LoginRequired> }></Route>
				<Route path="*" element={<NotFound/>}></Route>
			</Routes>
		</div>
	);
}

export default App;
