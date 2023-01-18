import React from "react";

const BlogControls = ({ commentsLen, views, saved }) => {
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
			<div className="control">
				<i className="fa-solid fa-bookmark"></i>
				<p>0</p>
			</div>
		</div>
	);
};

export default BlogControls;
