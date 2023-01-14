import React, { useEffect, useReducer, useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import { checkSubscribed, addSubscription, removeSubscription } from "../../utils/Subscriptions.util";

const UserInfo = ({ setShowEditForm, setBlockUserActive, data }) => {
	const [profileImg, setProfileImage] = useState(null);
	const [subs, subsDispatchFunc] = useReducer(reducerFunc, { subscribed: false, subscribers: [], data: {} });

	const { firebase, credentials } = useGlobalContext();
	let { user } = credentials;

	function subscriptionToggle(e) {
		let newData = subs.subscribed ? removeSubscription(subs.subscribers, credentials?.userId) : addSubscription(subs.subscribers, credentials?.userId);

		// followers
		if (!subs.data.empty) {
			firebase.updateSubscription(newData, subs?.data?.id, (res) => {});
		} else {
			firebase.addSubscription(newData, data?.username, (res) => {
				if (res.error) {
					return;
				}
			});
		}
	}

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
		setProfileImage(data?.img_src);
	}, [data]);

	useEffect(() => {
		// Fetching subscribers
		if (data) {
			//  Fetch subscription of profile account
			firebase.fetchSubscribers(data.username, (res) => {
				if (res.error) return;
				// Document is available
				if (!res.empty) {
					console.log(res);
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

	function imageUpload(event) {
		if (event.target.files && event.target.files[0]) {
			let reader = new FileReader();
			reader.onload = (e) => {
				setProfileImage(e.target.result);

				const file = event.target.files[0];
				firebase.updateProfileImage(file, data.userId, (res) => {
					console.log(res);
				});
			};
			reader.readAsDataURL(event.target.files[0]);
		}
	}

	return (
		<section className="userInfo">
			<div className="section__image">
				{profileImg ? <img src={profileImg} alt="Profile" /> : <i className="fa-solid fa-user"></i>}

				{data?.username === user?.username && (
					<label htmlFor="profileImg">
						<i className="fa-solid fa-camera"></i>
					</label>
				)}
				{data?.username === user?.username && <input type="file" accept="image/*" onChange={imageUpload} id="profileImg" />}
			</div>
			<div className="section__text">
				<h3>{data?.username}</h3>
				<div className="bio">
					<p>{data?.bio || "User has no bio at the moment "}</p>
					{data?.username === user?.username && (
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

					{credentials?.userId && data?.username !== user?.username && <button onClick={(e) => subscriptionToggle(e)}>{!subs.subscribed ? "Subscribe" : "Unsubscribe"}</button>}
					{credentials?.userId && data?.username !== user?.username && (
						<button className="block delete" onClick={() => setBlockUserActive(true)}>
							Block User
						</button>
					)}
					{data?.username === user?.username && <button className="block">Delete Account</button>}
				</div>
			</div>
		</section>
	);
};

export default UserInfo;
