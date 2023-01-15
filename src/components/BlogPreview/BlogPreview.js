import React from "react";
import { truncateText } from "../../utils/Text";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";
import { removeHTML, createLink } from "../../utils/Text";
import Ratings from "../Ratings/Ratings";

const BlogPreview = ({ heading, message, blog_id, lead_image_src, dislikes, likes, views, upvotes, comments }) => {
	const { credentials } = useGlobalContext();
	heading = removeHTML(heading);

	let link = createLink(credentials?.user?.username, heading, blog_id).toLowerCase();

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
				<div className="leadImage">
					<img src={lead_image_src} alt="Lead" />
				</div>
			</div>

			<div className="actions">
				<Ratings likes={likes} dislikes={dislikes} blog_id={blog_id} />
				<NavLink className="comments action" to={`${link}#comments`}>
					<div className="icon">
						<i className="fa-solid fa-comments"></i>
					</div>
					<p>{comments?.length}</p>
				</NavLink>
				<div className="views action">
					<div className="icon">
						<i className="fa-solid fa-eye"></i>
					</div>
					<p>{views}</p>
				</div>

				<p>${upvotes.toFixed(2)}</p>

				<p className="username">@scyre27</p>

				<div className="blog_controls">
					<i className="fa-solid fa-ellipsis-vertical"></i>
				</div>
			</div>
		</article>
	);
};

export default BlogPreview;
