import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import Notification from "./Notification/Notification";

const Notifications = () => {
	const [notifications, setNotifications] = useState([]);
	const [waiting, setWaiting] = useState(false);
	const { firebase, credentials } = useGlobalContext();

	useEffect(() => {
		firebase.fetchUserNotifications(credentials?.userId, (res) => {
			if (res.empty) {
				setNotifications(res);
				return;
			}
			// Sorting read and unread
			// Group read and unread
			res = [...res.filter((e) => e.status === "unread"), ...res.filter((e) => e.status === "read")];
			if (res.error) return;
			setNotifications(res.length === 0 ? { empty: true } : res);
		});
	}, [firebase, credentials?.userId]);

	function markRead() {
		let unread = notifications.filter((e) => e.status === "unread");
		if (unread.length) {
			setWaiting(true);
			unread.forEach((notification, index) => {
				firebase.setReadNotification(notification.notification_id, credentials?.userId, (res) => {
					if (res.error) return;
					if (res && index === unread.length - 1) {
						setTimeout(() => {
							setWaiting(false);
						}, 2000);
					}
				});
			});
		}
	}
	return (
		<section className="notifications">
			{/* If notifications is empty. */}
			{notifications?.empty && !waiting && <p className="nothingHere">Nothing Here...</p>}
			{!notifications?.empty && (
				<>
					{/* If notifications is not empty and is not waiting for mark all as read functionality */}
					{!waiting && (
						<>
							<div className="actions">
								<div className="filter">
									<i className="fa-solid fa-filter"></i>
									<p>filter</p>
								</div>
								<button className="markRead" onClick={markRead}>
									Mark As Read
								</button>
							</div>
							<div className="content">
								{notifications.map((e) => {
									return <Notification key={e.notification_id} {...e} receiver_id={credentials?.userId} />;
								})}
							</div>
						</>
					)}
					{/* If notifications is not empty but is  waiting for mark all as read functionality */}
					{waiting && <p className="nothingHere waiting">Waiting...</p>}
				</>
			)}
		</section>
	);
};

export default Notifications;
