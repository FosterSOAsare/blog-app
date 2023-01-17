import React, { useState, useEffect, useRef } from "react";
import { truncateText } from "../../utils/Text";
import { NavLink, Link } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";
import { removeHTML, createLink } from "../../utils/Text";
import Ratings from "../Ratings/Ratings";

const BlogPreview = ({ heading, message, blog_id, lead_image_src, dislikes, likes, views, upvotes, comments, author }) => {
	const { credentials } = useGlobalContext();
	const [sub, showSub] = useState(false);
	heading = removeHTML(heading);
	const subButton = useRef(null);

	let tips = JSON.parse(upvotes);

	let total = 0;
	if (tips?.length) {
		tips.forEach((e) => (total += parseFloat(e.amount)));
	}
	total = total.toFixed(2);

	let link = createLink(author, heading, blog_id);
	let editLink = `/@${author}/edit/${blog_id}`;
	useEffect(() => {
		let parent = subButton.current;

		let current = undefined;
		credentials.user &&
			document.addEventListener("mousemove", (e) => {
				current = e.target;
				if (parent.contains(e.target)) {
					showSub(true);
				} else {
					setTimeout(() => {
						!parent.contains(current) && showSub(false);
					}, 200);
				}
			});
	}, [credentials.user]);

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
				<Ratings likes={likes} dislikes={dislikes} id={blog_id} type="blogs" />
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

				<p>${total}</p>

				<Link className="username link" to={`/@${author}`}>
					@{author}
				</Link>

				<article ref={subButton} className="blog_controls">
					<i className="fa-solid fa-ellipsis-vertical"></i>
					{sub && (
						<div className="controls_sub">
							<NavLink className="elem" to={editLink}>
								Edit article
							</NavLink>
							<NavLink className="elem" to="/report">
								Report this
							</NavLink>
							<p className="elem">Block this user</p>
						</div>
					)}
				</article>
			</div>
		</article>
	);
};

export default BlogPreview;
