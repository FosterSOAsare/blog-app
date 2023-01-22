import { useContext, createContext } from "react";
import { useReducer } from "react";
import { Verifications } from "../utils/Verifications";
import { useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [error, errorFunc] = useReducer(reducerFunc, { display: "none", text: "" });
	const [waiting, setWaiting] = useState(false);
	const verifications = new Verifications();

	function reducerFunc(error, action) {
		switch (action.type) {
			case "displayError":
				return { display: "block", text: action.payload };
			case "clearError":
				return { display: "none", text: "" };
			default:
				return error;
		}
	}

	return <AuthContext.Provider value={{ error, errorFunc, verifications, waiting, setWaiting }}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
	return useContext(AuthContext);
};
