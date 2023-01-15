import React from "react";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../../context/AppContext";
import { useReducer, useEffect } from "react";
import { checkSubscribed } from "../../../utils/Subscriptions.util";
import { useSubscriptionContext } from "../../../context/SubscriptionContext";

const AuthorInfo = ({ username, blog_id, img_src, bio, blog_timestamp }) => {
	const [subs, subsDispatchFunc] = useReducer(reducerFunc, { subscribed: false, subscribers: [], data: {} });
	let { credentials, firebase, calculateTime } = useGlobalContext();
	let { subscriptionToggle } = useSubscriptionContext();
	let editLink = `/@${username}/edit/${blog_id}`;
	let time = blog_timestamp?.seconds && calculateTime(blog_timestamp?.seconds);

	// Fetch user's data
	function reducerFunc(subs, action) {
		switch (action.type) {
			case "setSubscribed":
				return { ...subs, subscribed: action.payload };
			case "setSubscribers":
				return { ...subs, subscribers: action.payload };
			case "setData":
				return { ...subs, data: action.payload };
			default:
				return subs;
		}
	}

	useEffect(() => {
		// Fetching subscribers
		if (username) {
			//  Fetch subscription of profile account
			firebase.fetchSubscribers(username, (res) => {
				if (res.error) return;

				// Document is available
				if (!res.empty) {
					if (checkSubscribed(res.followers, credentials?.userId)) {
						// User is subscribed
						subsDispatchFunc({ type: "setSubscribed", payload: true });
					} else {
						subsDispatchFunc({ type: "setSubscribed", payload: false });
					}
					subsDispatchFunc({ type: "setSubscribers", payload: res.followers !== "" ? res.followers.split(" ") : [] });
				}
				subsDispatchFunc({ type: "setData", payload: res });
			});
		}
	}, [username, firebase, credentials?.userId]);

	return (
		<section className="author_info">
			<div className="image">
				<img src={img_src} alt="Author's Profile " />
			</div>
			<div className="desc">
				<div className="actions">
					<p>
						Written by{" "}
						<NavLink className="link user" to={`/@${username}`}>
							{username}
						</NavLink>
					</p>
					{credentials?.userId && username === credentials.user?.username && (
						<NavLink className="link edit" to={editLink}>
							Edit article
						</NavLink>
					)}
					<div className="subscribers">
						<div className="icon">
							<i className="fa-solid fa-users"></i>
						</div>
						<p>{subs?.subscribers?.length}</p>
					</div>
					{credentials?.userId && username !== credentials.user?.username && (
						<button className="subscribe" onClick={() => subscriptionToggle(subs.subscribed, subs.subscribers, subs?.data, { username, id: credentials?.userId })}>
							{!subs.subscribed ? "Subscribe" : "Unsubscribe"}
						</button>
					)}
				</div>
				<div className="bio">{bio}</div>
				<div className="userTime">
					<p>{time}</p>
					<div className="complain"></div>
				</div>
				<div className="communities"></div>
			</div>
		</section>
	);
};

export default AuthorInfo;
