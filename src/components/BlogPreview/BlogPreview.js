import React from "react";
import { truncateText } from "../../utils/Text";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";
import { removeHTML, createLink } from "../../utils/Text";

const BlogPreview = ({ heading, message, blog_id }) => {
	const { credentials } = useGlobalContext();
	heading = removeHTML(heading);

	let link = createLink(credentials?.user?.username, heading, blog_id);
	return (
		<article className="blogPreview">
			<div className="content">
				<div className="left">
					<NavLink to={link} className="link">
						<h3 className="preview__heading">{truncateText(removeHTML(heading), 100)}</h3>
					</NavLink>
					<NavLink to={link} className="link">
						<p>{truncateText(removeHTML(message), 195)} </p>
					</NavLink>
				</div>
				<div className="leadImage"></div>
			</div>

			<div className="actions">
				<div className="likes action">
					<div className="icon">
						<i className="fa-solid fa-thumbs-up"></i>
					</div>
					<p>0</p>
					<div className="icon">
						<i className="fa-solid fa-thumbs-down"></i>
					</div>
				</div>
				<div className="comments action">
					<div className="icon">
						<i className="fa-solid fa-comments"></i>
					</div>
					<p>20</p>
				</div>
				<div className="views action">
					<div className="icon">
						<i className="fa-solid fa-eye"></i>
					</div>
					<p>20</p>
				</div>

				<p>$0.00</p>

				<p className="username">@scyre27</p>

				<div className="blog_controls">
					<i className="fa-solid fa-ellipsis-vertical"></i>
				</div>
			</div>
		</article>
	);
};

export default BlogPreview;
