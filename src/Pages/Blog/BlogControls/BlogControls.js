import React from "react";
import { useGlobalContext } from "../../../context/AppContext";

const BlogControls = ({ commentsLen, views = 0, bookmarks = [], blog_id }) => {
	const { firebase, credentials } = useGlobalContext();

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
	return (
		<div className="blogControls">
			<div className="control">
				<i className="fa-solid fa-comments"></i>
				<p>{commentsLen}</p>
			</div>
			<div className="control views">
				<i className="fa-solid fa-eye"></i>
				<p>{views}</p>
			</div>
			<div onClick={toggleBookmarks} className={`control${bookmarks.includes(credentials?.userId) ? " booked" : ""}`}>
				<i className="fa-solid fa-bookmark"></i>
				<p>{bookmarks.length}</p>
			</div>
		</div>
	);
};

export default BlogControls;
