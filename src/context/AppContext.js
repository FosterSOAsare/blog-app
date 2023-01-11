import { useContext, createContext, useReducer, useEffect, useState, useMemo } from "react";
import { Firebase } from "../utils/Firebase";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
	const [firebase, setFirebase] = useState(null);
	useMemo(() => setFirebase(new Firebase()), []);
	const [credentials, credentialsDispatchFunc] = useReducer(reducerFunc, { userId: JSON.parse(localStorage.getItem("userId")) || null, user: null });

	function reducerFunc(credentials, action) {
		switch (action.type) {
			case "login":
				return { ...credentials, userId: action.payload };
			case "logout":
				return { ...credentials, userId: null };
			case "setUser":
				return { ...credentials, user: action.payload };
			default:
				return credentials;
		}
	}

	useEffect(() => {
		if (credentials.userId) {
			// Fetch credentials
			firebase.fetchUserWithUid(credentials.userId, (userData) => {
				if (userData.error || !userData) {
					credentialsDispatchFunc({ type: "logout" });
					return;
				}
				credentialsDispatchFunc({ type: "setUser", payload: userData });
			});
			//
		}
		localStorage.setItem("userId", JSON.stringify(credentials.userId));
	}, [credentials.userId, firebase]);
	return <AppContext.Provider value={{ firebase, credentials, credentialsDispatchFunc }}>{children}</AppContext.Provider>;
};

export const useGlobalContext = () => {
	return useContext(AppContext);
};
