import React, { useEffect, useState } from "react";
import { truncateText } from "../../utils/Text";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";
import { removeHTML, createLink } from "../../utils/Text";
import { countElements } from "../../utils/Text";

const BlogPreview = ({ heading, message, blog_id, lead_image_src, dislikes, likes, views, upvotes, comments }) => {
	const [rating, setRating] = useState("");
	const { credentials, firebase } = useGlobalContext();
	heading = removeHTML(heading);

	useEffect(() => {
		// Check liked or disliked
		let checkLiked = likes && likes.split(" ").find((e) => e === credentials?.user?.username);
		let checkDisliked = dislikes && dislikes.split(" ").find((e) => e === credentials?.user?.username);
		setRating(checkLiked ? true : checkDisliked ? false : "");
	}, [likes, credentials?.user?.username, dislikes]);
	let link = createLink(credentials?.user?.username, heading, blog_id).toLowerCase();

	function removeRating(str) {
		return str !== ""
			? str
					.split(" ")
					.filter((e) => e !== credentials?.user?.username)
					.join(" ")
			: "";
	}
	function toggleRating(str) {
		// remove rating if it exists
		let exists = str !== "" && str.split(" ").filter((e) => e === credentials?.user?.username)?.length;

		if (exists > 0)
			return str
				.split(" ")
				.filter((e) => e !== credentials?.user?.username)
				.join(" ");

		let arr = str.split(" ");
		arr.push(credentials?.user?.username);
		return arr.join(" ");
	}
	function rateArticle(rate_type, blog_id) {
		let newLikesData, newDislikesData;
		// If user likes the post , check to see if user already disliked it or not. Then add a new like
		// Also check if user has already done that action , toggle it off or on
		newDislikesData = rate_type === "like" ? removeRating(dislikes) : toggleRating(dislikes);
		newLikesData = rate_type === "like" ? toggleRating(likes) : removeRating(likes);

		firebase.updateLikes(newLikesData, newDislikesData, blog_id);
	}
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
				<div className="likes action">
					<div className={`icon${rating === true ? " active" : ""}`} onClick={() => rateArticle("like", blog_id)}>
						<i className="fa-solid fa-thumbs-up"></i>
					</div>
					<p>{countElements(likes) - countElements(dislikes)}</p>
					<div className={`icon${rating === false ? " dislike" : ""}`} onClick={() => rateArticle("dislike", blog_id)}>
						<i className="fa-solid fa-thumbs-down"></i>
					</div>
				</div>
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
