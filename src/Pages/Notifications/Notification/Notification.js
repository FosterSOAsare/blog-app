import React, { useEffect, useReducer, useState } from "react";
import { useGlobalContext } from "../../../context/AppContext";
import { Navigate } from "react-router";

const Notification = ({ type, notification_id, sponsor_id, sponsor_username, status, sponsorship_id, timestamp, request_id }) => {
	const [attachedData, setAttachedFunc] = useReducer(reducerFunc, { description: "", link: "" });
	const { credentials, calculateTime } = useGlobalContext();
	const [navigate, setNavigate] = useState(false);

	const { firebase } = useGlobalContext();

	function reducerFunc(attachedData, action) {
		switch (action.type) {
			case "setDesc":
				return { ...attachedData, description: action.payload };
			case "setLink":
				return { ...attachedData, link: action.payload };
			default:
				return attachedData;
		}
	}
	useEffect(() => {
		if (type === "newSponsorshipRequest") {
			// Fetch sponsor
			firebase.fetchUserWithId(sponsor_id, (res) => {
				setAttachedFunc({ type: "setDesc", payload: `New sponsorship request received from @${res?.username}` });
				setAttachedFunc({ type: "setLink", payload: "/sponsorships/requests" });
			});
			return;
		}
		if (type === "requestModerated") {
			// fetch Request
			firebase.fetchRequest(request_id, (res) => {
				setAttachedFunc({ type: "setDesc", payload: `Your sponsorship, "${res.promo_desc}" has been ${res.status}. ${res.status === "approved" ? "Check to complete payment " : ""} ` });
				setAttachedFunc({ type: "setLink", payload: "/sponsorships" });
			});
			return;
		}
		if (type === "sponsorshipDeleted") {
			// fetch Request
			setAttachedFunc({ type: "setDesc", payload: `The sponsorship request from "${sponsor_username}" has been deleted by sponsor ` });
			setAttachedFunc({ type: "setLink", payload: "/sponsorships/requests" });
			return;
		}
		if (type === "sponsorshipSettled") {
			// fetch Request
			firebase.fetchUserWithId(sponsor_id, (res) => {
				setAttachedFunc({ type: "setDesc", payload: `Payment received from "@${res.username}" to finalize sponsorship ` });
				setAttachedFunc({ type: "setLink", payload: `/@${credentials?.user?.username}` });
			});
			return;
		}
	}, [type, firebase, sponsor_id, request_id, credentials?.user?.username, sponsor_username]);

	function setRead() {
		console.log("clicked");
		firebase.setReadNotification(notification_id, status, (res) => {
			console.log(res);
			if (res.error) return;
			setNavigate(true);
			console.log(navigate);
		});
	}
	return (
		<>
			<div className="notification" onClick={setRead}>
				<div className="title">
					{!status && <div className="unread"></div>}
					<p className="desc">{attachedData?.description}</p>
				</div>
				{<div className="attached_content"></div>}
				<p className="timestamp">{calculateTime(timestamp?.seconds)}</p>
			</div>
			{navigate && <Navigate to={attachedData?.link}></Navigate>}
		</>
	);
};

export default Notification;
