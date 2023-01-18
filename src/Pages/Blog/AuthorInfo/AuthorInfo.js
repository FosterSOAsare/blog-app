import React, { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../../context/AppContext";
import { useReducer, useEffect } from "react";
import { checkSubscribed } from "../../../utils/Subscriptions.util";
import { useSubscriptionContext } from "../../../context/SubscriptionContext";

const AuthorInfo = ({ username, blog_id, img_src, bio, blog_timestamp, editTime }) => {
	const [subs, subsDispatchFunc] = useReducer(reducerFunc, { subscribed: false, subscribers: [], data: {} });
	const [showDrop, setShowDrop] = useState(false);
	let { credentials, firebase, calculateTime } = useGlobalContext();
	let { subscriptionToggle } = useSubscriptionContext();
	const complain = useRef(null);
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
		let parent = complain.current;
		let current = undefined;
		credentials.user &&
			document.addEventListener("mousemove", (e) => {
				current = e.target;
				if (parent.contains(e.target)) {
					setShowDrop(true);
				} else {
					setTimeout(() => {
						!parent.contains(current) && setShowDrop(false);
					}, 200);
				}
			});
	}, [credentials.user]);
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
			<div className={`image${img_src ? "" : " icon"}`}>{img_src ? <img src={img_src} alt="Author's Profile " /> : <i className="fa-user fa-solid"></i>}</div>
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
				<div className="bio">{bio ? bio : "User has no bio at the moment"}</div>
				<div className="userTime">
					<p>{time}</p>
					<div className="complain" ref={complain}>
						<i className="fa-solid fa-ellipsis-vertical"></i>
						{showDrop && (
							<div className="drop">
								<NavLink to="/report" className="drop_elem link">
									Report this
								</NavLink>
								<div className="drop_elem">Block this user</div>
							</div>
						)}
					</div>
				</div>
				{<p className="editTime">Last edited : {calculateTime(editTime?.seconds)}</p>}
				<div className="communities"></div>
			</div>
		</section>
	);
};

export default AuthorInfo;
