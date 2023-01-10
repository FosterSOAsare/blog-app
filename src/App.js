import "./App.scss";
import { Route, Routes } from "react-router";
import HomePage from "./Pages/HomePage/HomePage";

function App() {
	return (
		<div className="App">
			<Routes>
				<Route path="/">
					<Route index element={<HomePage />}></Route>
				</Route>
			</Routes>
		</div>
	);
}

export default App;
