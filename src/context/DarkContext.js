import { createContext, useContext, useEffect, useState } from "react";

let DarkContext = createContext();

function DarkProvider({ children }) {
	let [theme, setTheme] = useState("");

	useEffect(() => {
		let theme = localStorage.getItem("blog-app-theme");
		setTheme(theme ? theme : "light");
	}, []);

	//Store Theme
	useEffect(() => {
		localStorage.setItem("blog-app-theme", theme);
	}, [theme]);
	function toggleTheme() {
		setTheme((prev) => (prev === "light" ? "dark" : "light"));
	}
	return <DarkContext.Provider value={{ theme, toggleTheme }}>{children}</DarkContext.Provider>;
}

export function useDarkContext() {
	return useContext(DarkContext);
}
export default DarkProvider;
