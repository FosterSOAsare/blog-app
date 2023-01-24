import React, { useEffect, useReducer } from "react";
import { useGlobalContext } from "../../../context/AppContext";
import { checkSubscribed } from "../../../utils/Subscriptions.util";
import { useSubscriptionContext } from "../../../context/SubscriptionContext";
import Loading from "../../../components/Loading/Loading";
import { NavLink } from "react-router-dom";

const UserInfo = ({ setShowEditForm, setDeleteUserActive, data, checkBlockedByLoggedInUser }) => {
	const { subscriptionToggle, imageUpload } = useSubscriptionContext();
	const [subs, subsDispatchFunc] = useReducer(reducerFunc, { subscribed: false, subscribers: [], data: {} });

	const { firebase, credentials } = useGlobalContext();

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
		if (data) {
			//  Fetch subscription of profile account
			firebase.fetchSubscribers(data.username, (res) => {
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
	}, [data, credentials?.userId, firebase]);

	return (
		<>
			{!data?.username && <Loading />}
			{data?.username && (
				<section className="userInfo">
					<div className="section__image">
						{data?.img_src ? <img src={data?.img_src} alt="Profile" /> : <i className="fa-solid fa-user"></i>}

						{data?.username === credentials?.user?.username && (
							<label htmlFor="profileImg">
								<i className="fa-solid fa-camera"></i>
							</label>
						)}
						{data?.username === credentials?.user?.username && <input type="file" accept="image/*" onChange={(e) => imageUpload(e, data, () => {})} id="profileImg" />}
					</div>
					<div className="section__text">
						<h3>{data?.username}</h3>
						<div className="bio">
							<p>{data?.bio || "User has no bio at the moment "}</p>
							{data?.username === credentials?.user?.username && (
								<div className="icon" onClick={() => setShowEditForm(true)}>
									<i className="fa-solid fa-pencil"></i>
								</div>
							)}
						</div>
						<div className="subs">
							<div className="subCount">
								<div className="icon">
									<i className="fa-solid fa-users"></i>
								</div>
								<p>{subs.subscribers.length}</p>
							</div>

							{credentials?.userId && data.username !== credentials.user.username && !checkBlockedByLoggedInUser() && (
								<button onClick={() => subscriptionToggle(subs.subscribed, subs.subscribers, subs?.data, { username: data?.username, id: credentials?.userId })}>
									{!subs.subscribed ? "Subscribe" : "Unsubscribe"}
								</button>
							)}
							{credentials?.userId && data.username !== credentials.user.username && (
								<NavLink className={`link ${checkBlockedByLoggedInUser() ? "unblock" : "block delete"}`} to={`/block/${data.userId}`}>
									{checkBlockedByLoggedInUser() ? "Unblock" : "Block"} User
								</NavLink>
							)}
							{data?.username === credentials.user?.username && (
								<button className="block" onClick={() => setDeleteUserActive(true)}>
									Delete Account
								</button>
							)}
						</div>
					</div>
				</section>
			)}
		</>
	);
};

export default UserInfo;
