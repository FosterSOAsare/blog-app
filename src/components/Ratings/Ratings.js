import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../context/AppContext";
import { countElements } from "../../utils/Text";

const Ratings = ({ type, likes, dislikes, id }) => {
	const [rating, setRating] = useState("");
	const { credentials, firebase } = useGlobalContext();
	function removeRating(str) {
		return str !== ""
			? str
					.split(" ")
					.filter((e) => e !== credentials?.userId)
					.join(" ")
			: "";
	}
	useEffect(() => {
		// Check liked or disliked
		let checkLiked = likes && likes.split(" ").find((e) => e === credentials?.userId);
		let checkDisliked = dislikes && dislikes.split(" ").find((e) => e === credentials?.userId);
		setRating(checkLiked ? true : checkDisliked ? false : "");
	}, [likes, credentials?.userId, dislikes]);
	function toggleRating(str) {
		// remove rating if it exists
		let exists = str !== "" && str.split(" ").filter((e) => e === credentials?.userId)?.length;

		if (exists > 0)
			return str
				.split(" ")
				.filter((e) => e !== credentials?.userId)
				.join(" ");

		let arr = str.split(" ");
		arr.push(credentials?.userId);
		return arr.join(" ");
	}
	function rate(rate_type, id) {
		let newLikesData, newDislikesData;
		// If user likes the post , check to see if user already disliked it or not. Then add a new like
		// Also check if user has already done that action , toggle it off or on
		newDislikesData = rate_type === "like" ? removeRating(dislikes) : toggleRating(dislikes);
		newLikesData = rate_type === "like" ? toggleRating(likes) : removeRating(likes);

		firebase.updateRatings(type, newLikesData, newDislikesData, id);
	}

	return (
		<div className="likes action rating">
			<div className={`up icon${rating === true ? " active" : ""}`} onClick={() => rate("like", id)}>
				<i className="fa-solid fa-thumbs-up"></i>
			</div>
			<p>{countElements(likes) - countElements(dislikes)}</p>
			<div className={`down icon${rating === false ? " dislike" : ""}`} onClick={() => rate("dislike", id)}>
				<i className="fa-solid fa-thumbs-down"></i>
			</div>
		</div>
	);
};

export default Ratings;
