import React, { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import Notification from "./Notification/Notification";
import Waiting from "../../assets/images/Waiting.gif";
import Loading from "../../components/Loading/Loading";

const Notifications = () => {
	const [notifications, setNotifications] = useState([]);
	const [showOptions, setShowOptions] = useState(false);
	const filterRef = useRef(null);
	// Waiting for a functionality like mark as read or filtering
	const [waiting, setWaiting] = useState(false);
	const [loading, setLoading] = useState(true);
	const { firebase, credentials } = useGlobalContext();

	function sortNotifications(notifications) {
		notifications.sort((a, b) => {
			return b.timestamp.seconds - a.timestamp.seconds;
		});
		return (notifications = [...notifications.filter((e) => e.status === "unread"), ...notifications.filter((e) => e.status === "read")]);
	}
	useEffect(() => {
		firebase.fetchUserNotifications(credentials?.userId, (res) => {
			if (res.empty) {
				setNotifications(res);
				return;
			}
			// Sorting read and unread
			// Group read and unread
			res = sortNotifications(res);
			if (res.error) return;
			setNotifications(res.length === 0 ? { empty: true } : res);
			setLoading(false);
		});
	}, [firebase, credentials?.userId]);

	useEffect(() => {
		let parent = filterRef.current;
		let current = undefined;
		notifications &&
			parent &&
			document.addEventListener("mousemove", (e) => {
				current = e.target;
				if (parent.contains(e.target)) {
					setShowOptions(true);
				} else {
					setTimeout(() => {
						!parent.contains(current) && setShowOptions(false);
					}, 200);
				}
			});
	}, [notifications]);

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
	function fetchFilteredNotifcations(type) {
		setWaiting(true);
		firebase.fetchFilteredNotifications(type, credentials?.userId, (res) => {
			res = sortNotifications(res);
			setNotifications(res);
			setWaiting(false);
		});
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
								<div className="filter" ref={filterRef}>
									<i className="fa-solid fa-filter"></i>
									<p>filter</p>
									{showOptions && (
										<div className="filter_options">
											<p className="option" onClick={() => fetchFilteredNotifcations("all")}>
												All
											</p>
											<p className="option" onClick={() => fetchFilteredNotifcations("comment")}>
												Comments
											</p>
											<p className="option" onClick={() => fetchFilteredNotifcations("reply")}>
												Replies
											</p>
											<p className="option" onClick={() => fetchFilteredNotifcations("sponsorship")}>
												Sponsors
											</p>
											<p className="option" onClick={() => fetchFilteredNotifcations("upvotes")}>
												Upvotes
											</p>
											<p className="option" onClick={() => fetchFilteredNotifcations("post")}>
												Subscriptions
											</p>
										</div>
									)}
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
