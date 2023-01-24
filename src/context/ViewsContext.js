import React, { createContext, useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
const ViewsContext = createContext();

function ViewsProvider({ children }) {
	const [userIp, setUserIp] = useState(null);

	useEffect(() => {
		(async function () {
			let data = await fetch("https://api.ipify.org?format=json");
			data = await data.json();
			let ip = data.ip;
			setUserIp(ip);
		})();
	});

	return <ViewsContext.Provider value={{ userIp }}>{children}</ViewsContext.Provider>;
}

export function useViewsContext() {
	return useContext(ViewsContext);
}
export default ViewsProvider;
