import React, { useEffect, useState, useRef } from "react";
import TipBox from "../../../components/TipBox/TipBox";
import Ratings from "../../../components/Ratings/Ratings";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../../context/AppContext";
const Interaction = ({ type, message, likes, dislikes, timestamp, id, upvotes, author_id, base_id, reply_to, setRepliesInfo, repliesInfo, activeReply, setActiveReply }) => {
	const { calculateTime, firebase, credentials } = useGlobalContext();
	const [author, setAuthor] = useState("");
	const replyRef = useRef(null);
	const [showReplyForm, setShowReplyForm] = useState(false);

	useEffect(() => {
		author_id &&
			firebase.fetchUserWithId(author_id, (res) => {
				setAuthor(res);
			});
	}, [firebase, author_id]);
	function addReply(message, author_id, base_id, reply_to = id) {
		if (message === "") return;
		let data = type === "replies" ? { message, author_id, base_comment_id: base_id, reply_to } : { message, author_id, base_comment_id: id };
		firebase.storeCommentOrReply("replies", data, (res) => {
			if (res.error) return;
			setShowReplyForm(false);
			replyRef.current.value = "";
		});
	}
	return (
		<>
			<div className={`reply comment${activeReply === id ? " activeReply" : ""}`} id={id}>
				<div className="actions">
					<i className="fa-solid fa-ellipsis-vertical"></i>
				</div>
				{type === "replies" && reply_to && (
					<p
						className="reply_info"
						onClick={() => {
							setActiveReply(reply_to);
							setTimeout(() => {
								setActiveReply(null);
							}, 2000);
						}}>
						Reply to {reply_to}
					</p>
				)}
				<p>{message}</p>
				<div className="interactions">
					<Ratings {...{ likes, dislikes, id, type }} />
					<TipBox {...{ type, upvotes, author_id: author_id, id }} />
					{author?.img_src ? <img src={author?.img_src} alt="Author" /> : <i className="fa-solid fa-user"></i>}
					<NavLink className="link" to={`/@${author?.username}`}>
						{author?.username}
					</NavLink>
					<p className="time">{calculateTime(timestamp?.seconds)}</p>
					<p className="reply" onClick={() => setShowReplyForm(true)}>
						Add Reply
					</p>
				</div>
				{repliesInfo?.replies?.length > 0 && !repliesInfo?.showReplies && (
					<div
						className="showReplies"
						onClick={() => {
							setRepliesInfo({ type: "setShowReplies", payload: true });
						}}>
						view {repliesInfo?.replies?.length} repl{repliesInfo?.replies?.length === 1 ? "y" : "ies"}
					</div>
				)}
			</div>
			{showReplyForm && (
				<form className="replyForm">
					<div className="container">
						<textarea name="comment" id="" cols="30" rows="10" placeholder="Add your reply" ref={replyRef}></textarea>
						<button
							onClick={(e) => {
								e.preventDefault();
								type === "comments" ? addReply(replyRef.current.value, credentials?.userId, base_id) : addReply(replyRef.current.value, credentials?.userId, base_id, id);
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

export default Interaction;
