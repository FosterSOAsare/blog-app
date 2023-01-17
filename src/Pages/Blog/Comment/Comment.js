import React from "react";
import Ratings from "../../../components/Ratings/Ratings";

const Comment = ({ commentOrReplyAuthor, comment, likes, dislikes, totalReplies, timestamp, id }) => {
	const { username, img_src } = commentOrReplyAuthor;
	console.log(username, img_src, comment, likes, dislikes, totalReplies, timestamp.seconds);
	return (
		<div className="comment">
			<div className="actions">
				<i className="fa-solid fa-ellipsis-vertical"></i>
			</div>
			<p>{comment}</p>
			<div className="interactions">
				<Ratings {...{ likes, dislikes, id }} />
			</div>
		</div>
	);
};

export default Comment;
