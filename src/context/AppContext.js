import { useContext, createContext } from "react";
import { Firebase } from "../utils/Firebase";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
	const firebase = new Firebase();
	return <AppContext.Provider value={{ firebase }}>{children}</AppContext.Provider>;
};

export const useGlobalContext = () => {
	return useContext(AppContext);
};
