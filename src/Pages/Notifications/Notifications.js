import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import Notification from "./Notification/Notification";
import Waiting from "../../assets/images/Waiting.gif";
import Loading from "../../components/Loading/Loading";

const Notifications = () => {
	const [notifications, setNotifications] = useState([]);
	// Waiting for a functionality like mark as read or filtering
	const [waiting, setWaiting] = useState(false);
	const [loading, setLoading] = useState(true);
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
			setLoading(false);
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
			{notifications?.empty && !waiting && !loading && <p className="nothingHere">Nothing Here...</p>}
			{!notifications?.empty && !loading && (
				<>
					{/* If notifications is not empty and is not waiting for mark all as read functionality */}
					{!waiting && (
						<>
							<div className="actions">
								<div className="filter">
									<i className="fa-solid fa-filter"></i>
									<p>filter</p>
								</div>
								{/* Check if there are unread messages . If yes display , mark these as read */}
								{notifications.filter((e) => e.status === "unread").length > 0 && (
									<button className="markRead" onClick={markRead}>
										Mark These As Read
									</button>
								)}
							</div>
							<div className="content">
								{notifications.map((e) => {
									return <Notification key={e.notification_id} {...e} receiver_id={credentials?.userId} />;
								})}
							</div>
						</>
					)}
					{/* If notifications is not empty but is  waiting for mark all as read functionality */}
					{waiting && (
						<div className="waiting">
							<img className="" src={Waiting} alt="Waiting" />
						</div>
					)}
				</>
			)}
			{loading && <Loading />}
		</section>
	);
};

export default Notifications;
