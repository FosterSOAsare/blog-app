import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import Notification from "./Notification/Notification";

const Notifications = () => {
	const [notifications, setNotifications] = useState([]);
	const { firebase, credentials } = useGlobalContext();
	useEffect(() => {
		firebase.fetchUserNotifications(credentials?.userId, (res) => {
			// Sorting read and unread
			res = [...res.filter((e) => !e.status), ...res.filter((e) => e.status === "read")];
			console.log(res);
			if (res.error) return;

			setNotifications(res);
		});
	}, [firebase, credentials?.userId]);
	return (
		<section className="notifications">
			<div className="actions">
				<div className="filter">
					<i className="fa-solid fa-filter"></i>
					<p>filter</p>
				</div>
				<button className="markRead">Mark As Read</button>
			</div>
			<div className="content">
				{notifications?.empty && <p className="nothingHere">Nothing Here...</p>}
				{!notifications?.empty &&
					notifications.map((e) => {
						return <Notification key={e.notification_id} {...e} />;
					})}
			</div>
		</section>
	);
};

export default Notifications;
