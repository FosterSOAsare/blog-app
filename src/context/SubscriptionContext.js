import { useContext, createContext } from "react";

import { addSubscription, removeSubscription } from "../utils/Subscriptions.util";
import { useGlobalContext } from "./AppContext";

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
	const { firebase, credentials } = useGlobalContext();

	function subscriptionToggle(subscribed, subscribers, data, obj) {
		let newData = subscribed ? removeSubscription(subscribers, credentials?.userId) : addSubscription(subscribers, credentials?.userId);
		// followers
		if (!data.empty) {
			firebase.updateSubscription(newData, data?.id, (res) => {});
		} else {
			firebase.addSubscription(newData, obj?.username, (res) => {
				if (res.error) {
					return;
				}
			});
		}
	}

	function imageUpload(event, data, callback) {
		if (event.target.files && event.target.files[0]) {
			let reader = new FileReader();
			reader.onload = (e) => {
				const file = event.target.files[0];
				firebase.updateProfileImage(file, data.userId, (res) => {
					if (res.error) return callback(res);
					callback(e.target.result);
				});
			};
			reader.readAsDataURL(event.target.files[0]);
		}
	}

	return <SubscriptionContext.Provider value={{ subscriptionToggle, imageUpload }}>{children}</SubscriptionContext.Provider>;
};

export const useSubscriptionContext = () => {
	return useContext(SubscriptionContext);
};
