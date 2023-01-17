import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../context/AppContext";
import { countElements } from "../../utils/Text";

const Ratings = ({ likes, dislikes, blog_id, id, replyId }) => {
	const [rating, setRating] = useState("");
	const { credentials, firebase } = useGlobalContext();
	function removeRating(str) {
		return str !== ""
			? str
					.split(" ")
					.filter((e) => e !== credentials?.user?.username)
					.join(" ")
			: "";
	}
	useEffect(() => {
		// Check liked or disliked
		let checkLiked = likes && likes.split(" ").find((e) => e === credentials?.user?.username);
		let checkDisliked = dislikes && dislikes.split(" ").find((e) => e === credentials?.user?.username);
		setRating(checkLiked ? true : checkDisliked ? false : "");
	}, [likes, credentials?.user?.username, dislikes]);
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

	function rateComment() {}

	function rateReply() {}
	return (
		<div className="likes action rating">
			<div className={`up icon${rating === true ? " active" : ""}`} onClick={() => (blog_id ? rateArticle("like", blog_id) : id ? rateComment("like", id) : rateReply("like", replyId))}>
				<i className="fa-solid fa-thumbs-up"></i>
			</div>
			<p>{countElements(likes) - countElements(dislikes)}</p>
			<div className={`down icon${rating === false ? " dislike" : ""}`} onClick={() => (blog_id ? rateArticle("dislike", blog_id) : id ? rateComment("dislike", id) : rateReply("dislike", replyId))}>
				<i className="fa-solid fa-thumbs-down"></i>
			</div>
		</div>
	);
};

export default Ratings;
