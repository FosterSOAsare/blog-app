import { useContext, createContext, useReducer, useEffect, useState, useMemo } from "react";
import { Firebase } from "../utils/Firebase";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
	const [firebase, setFirebase] = useState(null);
	const [notFound, setNotFound] = useState(false);
	useMemo(() => setFirebase(new Firebase()), []);
	const [credentials, credentialsDispatchFunc] = useReducer(reducerFunc, { userId: JSON.parse(localStorage.getItem("userId")) || null, user: null });
	const [blocked, blockedDispatchFunc] = useReducer(blockedFunc, { blockedUsers: [], blockedDocument: null });

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

	function blockedFunc(blocked, action) {
		switch (action.type) {
			case "setBlockedUsers":
				return { ...blocked, blockedUsers: action.payload };
			case "setBlockedDoc":
				return { ...blocked, blockedDocument: action.payload };
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
			firebase.fetchUserWithUid(credentials?.userId, (userData) => {
				if (userData?.error) {
					return;
				}
				if (!userData && navigator.onLine) {
					credentialsDispatchFunc({ type: "logout" });
				}
				credentialsDispatchFunc({ type: "setUser", payload: userData });
			});
			firebase.fetchBlockedUsers(credentials?.userId, (blockedUsers) => {
				if (blockedUsers?.error) {
					return;
				}
				blockedDispatchFunc({ type: "setBlockedUsers", payload: blockedUsers.blocks ? blockedUsers.blocks : [] });
				blockedDispatchFunc({ type: "setBlockedDoc", payload: blockedUsers.doc_id ? blockedUsers.doc_id : null });
			});

			//
		}
		localStorage.setItem("userId", JSON.stringify(credentials.userId));
	}, [credentials.userId, firebase]);
	return <AppContext.Provider value={{ firebase, credentials, credentialsDispatchFunc, calculateTime, notFound, setNotFound, blocked, blockedDispatchFunc }}>{children}</AppContext.Provider>;
};

export const useGlobalContext = () => {
	return useContext(AppContext);
};
