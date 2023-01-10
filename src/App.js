import "./App.scss";
import { Route, Routes } from "react-router";
import HomePage from "./Pages/HomePage/HomePage";
import Shared from "./Pages/Shared";
import Register from "./Pages/Register";
import Login from "./Pages/Login";

function App() {
	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<Shared />}>
					<Route index element={<HomePage />}></Route>
					<Route path="register" element={<Register />}></Route>
					<Route path="login" element={<Login />}></Route>
				</Route>
			</Routes>
		</div>
	);
}

export default App;
