import React, { useEffect, useReducer, useRef, useState } from "react";
import Ratings from "../../../components/Ratings/Ratings";
import TipBox from "../../../components/TipBox/TipBox";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../../context/AppContext";
import Reply from "./Reply/Reply";

const Comment = ({ comment, likes, dislikes, timestamp, id, upvotes, author_id }) => {
	const { calculateTime, credentials, firebase } = useGlobalContext();
	const [commentInfo, commentInfoDispatchFunc] = useReducer(setCommentInfoFunc, { author: null, replies: [], showReplies: false });
	const [showReplyForm, setShowReplyForm] = useState(false);

	function setCommentInfoFunc(comment, action) {
		switch (action.type) {
			case "setAuthor":
				return { ...comment, author: action.payload };
			case "setReplies":
				return { ...comment, replies: action.payload };
			case "setShowReplies":
				return { ...comment, showReplies: action.payload };

			default:
				return comment;
		}
	}
	// Fetch author and set author
	useEffect(() => {
		// setComment({type : 'setComments' , payload : })
		firebase.fetchUserWithId(author_id, (res) => {
			commentInfoDispatchFunc({ type: "setAuthor", payload: res });
		});

		firebase.fetchCommentsOrReplies("replies", id, "asc", (res) => {
			if (res.error) return;
			if (res.empty) {
				commentInfoDispatchFunc({ type: "setReplies", payload: [] });
				return;
			}
			commentInfoDispatchFunc({ type: "setReplies", payload: res });
		});
	}, [id, firebase, author_id]);

	const replyRef = useRef(null);

	function addReply(message, reply_author_id, base_comment_id, reply_to = null) {
		if (comment === "") return;
		firebase.storeCommentOrReply("replies", { message, reply_author_id, base_comment_id, reply_to }, (res) => {
			if (res.error) return;
			setShowReplyForm(false);
			replyRef.current.value = "";
		});
	}

	return (
		<>
			{!showReplyForm && (
				<>
					<div className="comment" id={id}>
						<div className="actions">
							<i className="fa-solid fa-ellipsis-vertical"></i>
						</div>
						<p>{comment}</p>
						<div className="interactions">
							<Ratings {...{ likes, dislikes, id, type: "comments" }} />
							<TipBox {...{ type: "comments", upvotes, author_id, id }} />
							{commentInfo?.author?.img_src ? <img src={commentInfo?.author?.img_src} alt="Author" /> : <i className="fa-solid fa-user"></i>}
							<NavLink className="link" to={`/@${commentInfo?.author?.username}`}>
								{commentInfo?.author?.username}
							</NavLink>
							<p className="time">{calculateTime(timestamp?.seconds)}</p>
							<p className="reply" onClick={() => setShowReplyForm(true)}>
								Add Reply
							</p>
						</div>
						{commentInfo?.replies?.length > 0 && (
							<div
								className="showReplies"
								onClick={() => {
									commentInfoDispatchFunc({ type: "setShowReplies", payload: true });
								}}>
								view {commentInfo?.replies?.length} repl{commentInfo?.replies?.length === 1 ? "y" : "ies"}
							</div>
						)}
					</div>
					{commentInfo?.showReplies && (
						<div className="replies">
							{commentInfo?.replies &&
								commentInfo?.replies.map((e, index) => {
									return <Reply key={index} {...e} base_comment_id={id} />;
								})}
						</div>
					)}
				</>
			)}
			{showReplyForm && (
				<form className="replyForm">
					<div className="container">
						<textarea name="comment" id="" cols="30" rows="10" placeholder="Add your reply" ref={replyRef}></textarea>
						<button
							onClick={(e) => {
								e.preventDefault();
								addReply(replyRef.current.value, credentials?.userId, id);
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

export default Comment;
