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
	const [subActions, showSubActions] = useState(false);
	const showSubButton = useRef(null);

	useEffect(() => {
		let parent = showSubButton.current;

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
		author_id &&
			firebase.fetchUserWithId(author_id, (res) => {
				setAuthor(res);
			});
	}, [firebase, author_id]);
	/**

	Adds a new reply to a comment or sub-reply.
	@function
	@param {string} message - The message of the reply.
	@param {string} [reply_to=id] - The ID of the comment or sub-reply that the reply is being added to.
	@returns {void}
	*/
	function addReply(message, reply_to = id) {
		setWaiting(true);
		if (message === "") return;
		// Type here specifies if the reply is a reply to either a comment or another reply
		let data =
			type === "replies"
				? { message, author_id: credentials?.userId, base_comment_id: base_id, reply_to: id, blog_id }
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
				<div className="actions" ref={showSubButton}>
					<i className="fa-solid fa-ellipsis-vertical"></i>
					{subActions && (
						<div className="controls_sub">
							<NavLink className="elem" to="/report">
								Report this
							</NavLink>
							{credentials?.user?.username !== author.username && (
								<NavLink className="elem" to={`/block/${author_id}`}>
									Block this user
								</NavLink>
							)}
						</div>
					)}
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
					<div className="left">
						<Ratings {...{ likes, dislikes, id, type }} />
						<TipBox {...{ type, upvotes, author_id: author_id, id, blog_id }} />
						{author?.img_src ? <img src={author?.img_src} alt="Author" className="author_img" /> : <i className="fa-solid fa-user"></i>}
						<NavLink className="link" to={`/@${author?.username}`}>
							{author?.username}
						</NavLink>
					</div>
					<div className="right">
						<p className="time">{calculateTime(timestamp?.seconds)}</p>
						<p className="reply" onClick={() => setShowReplyForm(true)}>
							Add Reply
						</p>
					</div>
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
