import React, { useState } from "react";
import { useGlobalContext } from "../../../context/AppContext";
import { Navigate } from "react-router";

const Notification = ({ link, desc, message, notification_id, status, timestamp, receiver_id }) => {
	const { calculateTime } = useGlobalContext();
	const [navigate, setNavigate] = useState(false);

	const { firebase } = useGlobalContext();

	function setRead() {
		firebase.setReadNotification(notification_id, receiver_id, (res) => {
			setNavigate(true);
		});
	}
	return (
		<>
			<div className="notification" onClick={setRead}>
				<div className="title">
					{status === "unread" && <div className="unread"></div>}
					<p className="desc">{desc}</p>
				</div>
				{message && <div className="attached_content">{message}</div>}
				<p className="timestamp">{calculateTime(timestamp.seconds)}</p>
			</div>
			{navigate && <Navigate to={link}></Navigate>}
		</>
	);
};

export default Notification;
