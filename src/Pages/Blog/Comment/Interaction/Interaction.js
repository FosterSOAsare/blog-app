import React, { useEffect, useState, useRef } from "react";
import TipBox from "../../../../components/TipBox/TipBox";
import Ratings from "../../../../components/Ratings/Ratings";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../../../context/AppContext";
const Interaction = ({ type, message, likes, dislikes, timestamp, id, upvotes, author_id, base_id, reply_to, setRepliesInfo, repliesInfo, activeReply, setActiveReply, blog_id }) => {
	const { calculateTime, firebase, credentials } = useGlobalContext();
	const [waiting, setWaiting] = useState(false);
	const [author, setAuthor] = useState("");
	const replyRef = useRef(null);
	const [showReplyForm, setShowReplyForm] = useState(false);

	useEffect(() => {
		author_id &&
			firebase.fetchUserWithId(author_id, (res) => {
				setAuthor(res);
			});
	}, [firebase, author_id]);
	function addReply(message, reply_to = id) {
		setWaiting(true);
		if (message === "") return;
		// Type here specifies if the reply is a reply to either a comment or another reply
		let data =
			type === "replies"
				? { message, author_id: credentials?.userId, base_comment_id: reply_to, reply_to: id, blog_id }
				: { message, author_id: credentials?.userId, blog_id, base_comment_id: id };

		firebase.storeCommentOrReply("replies", data, (res) => {
			// Replies here means what we are about to store is either a reply or a sub-reply
			setShowReplyForm(false);
			setWaiting(false);
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
					<TipBox {...{ type, upvotes, author_id: author_id, id, blog_id }} />
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
						{!waiting && (
							<>
								<button
									onClick={(e) => {
										e.preventDefault();
										addReply(replyRef.current.value);
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
							</>
						)}
						{waiting && <button className="waiting">Waiting...</button>}
					</div>
				</form>
			)}
		</>
	);
};

export default Interaction;