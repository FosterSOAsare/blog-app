import { useContext, useState } from "react";
import { createContext } from "react";
import { useGlobalContext } from "./AppContext";

const BlockedContext = createContext();

const BlockedProvider = ({ children }) => {
	let [loggedInUserBlocked, setLoggedInUserBlocked] = useState(false);
	const { credentials, firebase } = useGlobalContext();

	function checkBlockedByAuthor(profileId) {
		profileId &&
			firebase.fetchBlockedUsers(profileId, (res) => {
				if (res.error) return;
				if (res.empty) {
					setLoggedInUserBlocked(false);
					return;
				}
				if (res.blocks.includes(credentials?.userId)) {
					setLoggedInUserBlocked(true);
				}
			});
	}
	return <BlockedContext.Provider value={{ loggedInUserBlocked, setLoggedInUserBlocked, checkBlockedByAuthor }}>{children}</BlockedContext.Provider>;
};

export const useBlockedContext = () => {
	return useContext(BlockedContext);
};

export default BlockedProvider;
