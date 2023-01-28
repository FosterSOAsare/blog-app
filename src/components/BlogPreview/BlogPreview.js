import React, { useState, useEffect, useRef } from "react";
import { truncateText } from "../../utils/Text";
import { NavLink, Link } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";
import { removeHTML, createLink } from "../../utils/Text";
import Ratings from "../Ratings/Ratings";

const BlogPreview = ({ heading, message, blog_id, lead_image_src, dislikes, likes, upvotes, viewers, comments, author }) => {
	const { credentials, firebase } = useGlobalContext();
	const [subActions, showSubActions] = useState(false);

	const [userInfo, setUserInfo] = useState({});
	heading = removeHTML(heading);
	const subButton = useRef(null);

	let tips = upvotes;

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
					showSubActions(true);
				} else {
					setTimeout(() => {
						!parent.contains(current) && showSubActions(false);
					}, 200);
				}
			});
	}, [credentials.user]);

	useEffect(() => {
		firebase.fetchUserWithUsername(author, (res) => {
			if (res.error) return;
			setUserInfo(res);
		});
	}, [firebase, author]);

	return (
		<article className="blogPreview">
			<div className="content">
				<div className="leadImage">{lead_image_src && <img src={lead_image_src} alt="Lead" />}</div>
				<NavLink to={link} className="link">
					<h3 className="preview__heading">{truncateText(removeHTML(heading), 100)}</h3>
				</NavLink>
				<NavLink to={link} className="link">
					<p>{truncateText(removeHTML(message), 195)} </p>
				</NavLink>
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
						<p>{viewers ? viewers.length : 0}</p>
					</div>

					<p>${total}</p>

					<Link className="username link" to={`/@${author}`}>
						@{author}
					</Link>

					<article ref={subButton} className="blog_controls">
						<i className="fa-solid fa-ellipsis-vertical"></i>
						{subActions && (
							<div className="controls_sub">
								{credentials?.user?.username === author && (
									<NavLink className="elem" to={editLink}>
										Edit article
									</NavLink>
								)}
								<NavLink className="elem" to="/report">
									Report this
								</NavLink>
								{credentials?.user?.username !== author && (
									<NavLink className="elem" to={`/block/${userInfo?.userId}`}>
										Block this user
									</NavLink>
								)}
							</div>
						)}
					</article>
				</div>
			</div>
		</article>
	);
};

export default BlogPreview;
