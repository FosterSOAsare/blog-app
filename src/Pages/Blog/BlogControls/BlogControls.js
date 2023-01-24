import React from "react";
import { useGlobalContext } from "../../../context/AppContext";
import { useEffect } from "react";
import { useViewsContext } from "../../../context/ViewsContext";

const BlogControls = ({ commentsLen, viewers, bookmarks = [], blog_id }) => {
	const { firebase, credentials } = useGlobalContext();
	const { userIp } = useViewsContext();
	// To prevent storing more than once(useEffect sometimes runs more than once or twice )

	function toggleBookmarks() {
		if (bookmarks.includes(credentials?.userId)) {
			bookmarks = bookmarks.filter((e) => e !== credentials?.userId);
		} else {
			bookmarks.push(credentials?.userId);
		}
		// Update bookmarks
		firebase.updateBookmarks(blog_id, bookmarks, (res) => {
			if (res.error) return;
		});
	}

	useEffect(() => {
		let viewedUsers = viewers ? viewers : [];
		if (!viewedUsers.includes(userIp)) {
			let newData = viewedUsers ? [...viewedUsers, userIp] : [userIp];
			firebase.updateViewers(blog_id, newData, (res) => {
				if (res.error) return;
			});
		}
	}, [firebase, viewers, userIp, blog_id]);
	return (
		<div className="blogControls">
			<div className="control">
				<i className="fa-solid fa-comments"></i>
				<p>{commentsLen}</p>
			</div>
			<div className="control views">
				<i className="fa-solid fa-eye"></i>
				<p>{viewers ? viewers.length : 0}</p>
			</div>
			<div onClick={toggleBookmarks} className={`control${bookmarks.includes(credentials?.userId) ? " booked" : ""}`}>
				<i className="fa-solid fa-bookmark"></i>
				<p>{bookmarks.length}</p>
			</div>
		</div>
	);
};

export default BlogControls;
