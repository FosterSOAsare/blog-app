import React from "react";

const BlogPreview = ({ title, previewText }) => {
	return (
		<article className="blogPreview">
			<div className="leadImage"></div>
			<h3>{title}</h3>
			<p>{previewText}</p>
			<div className="actions">
				<div className="like action">
					<div className="icon"></div>
					<p>$0.00</p>
					<div className="icon"></div>
				</div>
				<div className="comments action">
					<div className="icon"></div>
					<p>20</p>
				</div>
				<div className="tips action">
					<div className="icon"></div>
					<p>$0.00</p>
				</div>
				<p className="username">@scyre27</p>
			</div>
		</article>
	);
};

export default BlogPreview;
