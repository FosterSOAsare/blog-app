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

	function setRead() {
		firebase.setReadNotification(notification_id, status, (res) => {});
	}
	return (
		<>
			<div className="notification" onClick={setRead}>
				<div className="title">
					{!status && <div className="unread"></div>}
					<p className="desc">Dead</p>
				</div>
				{<div className="attached_content"></div>}
				<p className="timestamp">20 minutes ago</p>
			</div>
			{navigate && <Navigate to={attachedData?.link}></Navigate>}
		</>
	);
};

export default Notification;
