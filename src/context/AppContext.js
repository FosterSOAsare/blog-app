import { useContext, createContext, useReducer, useEffect, useState, useMemo } from "react";
import { Firebase } from "../utils/Firebase";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
	const [firebase, setFirebase] = useState(null);
	const [notFound, setNotFound] = useState(false);
	useMemo(() => setFirebase(new Firebase()), []);
	const [credentials, credentialsDispatchFunc] = useReducer(reducerFunc, { userId: JSON.parse(localStorage.getItem("userId")) || null, user: null });

	function reducerFunc(credentials, action) {
		switch (action.type) {
			case "login":
				return { ...credentials, userId: action.payload };
			case "logout":
				return { ...credentials, userId: null, user: null };
			case "setUser":
				return { ...credentials, user: action.payload };
			default:
				return credentials;
		}
	}

	function calculateTime(timestamp) {
		let currentTime = Date.now(),
			timeDiff = currentTime / 1000 - timestamp,
			seconds = Math.floor(timeDiff),
			minutes = Math.floor(seconds / 60),
			hours = Math.floor(minutes / 60),
			days = Math.floor(hours / 24),
			years = Math.floor(days / 365);

		if (years > 0) {
			return years + (years === 1 ? " year " : " years ") + "ago";
		}
		if (days > 0) {
			return days + (days === 1 ? " day " : " days ") + "ago";
		}
		if (hours > 0) {
			return hours + (hours === 1 ? " hour " : " hours ") + "ago";
		}
		if (minutes > 0) {
			return minutes + (minutes === 1 ? " minute " : " minutes ") + "ago";
		}
		return seconds + (seconds === 1 ? " second " : " seconds ") + "ago";
	}

	useEffect(() => {
		if (credentials.userId) {
			// Fetch credentials
			firebase.fetchUserWithUid(credentials.userId, (userData) => {
				if (userData?.error || !userData) {
					// credentialsDispatchFunc({ type: "logout" });
					return;
				}
				credentialsDispatchFunc({ type: "setUser", payload: userData });
			});
			//
		}
		localStorage.setItem("userId", JSON.stringify(credentials.userId));
	}, [credentials.userId, firebase]);
	return <AppContext.Provider value={{ firebase, credentials, credentialsDispatchFunc, calculateTime, notFound, setNotFound }}>{children}</AppContext.Provider>;
};

export const useGlobalContext = () => {
	return useContext(AppContext);
};
