import React, { useEffect, useState, useRef } from "react";
import TipBox from "../../../../components/TipBox/TipBox";
import Ratings from "../../../../components/Ratings/Ratings";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../../../context/AppContext";
const Reply = ({ message, likes, dislikes, timestamp, id, upvotes, reply_author_id, base_comment_id, reply_to }) => {
	const { calculateTime, firebase, credentials } = useGlobalContext();
	const [author, setAuthor] = useState("");
	const replyRef = useRef(null);
	const [showReplyForm, setShowReplyForm] = useState(false);

	useEffect(() => {
		firebase.fetchUserWithId(reply_author_id, (res) => {
			setAuthor(res);
		});
	}, [firebase, reply_author_id]);
	function addReply(message, reply_author_id, base_comment_id, reply_to = id) {
		if (message === "") return;
		firebase.storeCommentOrReply("replies", { message, reply_author_id, base_comment_id, reply_to }, (res) => {
			if (res.error) return;
			setShowReplyForm(false);
			replyRef.current.value = "";
		});
	}
	return (
		<>
			<div className="reply comment" id={id}>
				<div className="actions">
					<i className="fa-solid fa-ellipsis-vertical"></i>
				</div>
				{reply_to && (
					<a href={`#${reply_to}`} className="reply_info">
						Reply to {reply_to}{" "}
					</a>
				)}
				<p>{message}</p>
				<div className="interactions">
					<Ratings {...{ likes, dislikes, id, type: "replies" }} />
					<TipBox {...{ type: "replies", upvotes, author_id: reply_author_id, id }} />
					{author?.img_src ? <img src={author?.img_src} alt="Author" /> : <i className="fa-solid fa-user"></i>}
					<NavLink className="link" to={`/@${author?.username}`}>
						{author?.username}
					</NavLink>
					<p className="time">{calculateTime(timestamp?.seconds)}</p>
					<p className="reply" onClick={() => setShowReplyForm(true)}>
						Add Reply
					</p>
				</div>
			</div>
			{showReplyForm && (
				<form className="replyForm">
					<div className="container">
						<textarea name="comment" id="" cols="30" rows="10" placeholder="Add your reply" ref={replyRef}></textarea>
						<button
							onClick={(e) => {
								e.preventDefault();
								addReply(replyRef.current.value, credentials?.userId, base_comment_id, id);
							}}>
							Add Reply
						</button>
						<button
							className="cancel"
							onClick={(e) => {
								e.preventDefault();
								setShowReplyForm(false);
							}}>
							Cancel
						</button>
					</div>
				</form>
			)}
		</>
	);
};

export default Reply;
