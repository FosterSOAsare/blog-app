import React, { useEffect, useReducer, useState } from "react";
import { useGlobalContext } from "../../../context/AppContext";
import Interaction from "./Interaction/Interaction";

const Comment = ({ comment, likes, dislikes, timestamp, id, upvotes, author_id, blog_id }) => {
	const { firebase } = useGlobalContext();
	const [repliesInfo, setRepliesInfo] = useReducer(reducerFunc, { showReplies: false, replies: [] });
	const [activeReply, setActiveReply] = useState(null);

	function reducerFunc(replies, action) {
		switch (action.type) {
			case "storeReplies":
				return { ...replies, replies: action.payload };
			case "setShowReplies":
				return { ...replies, showReplies: action.payload };
			default:
				return replies;
		}
	}
	// Fetch author and set author
	useEffect(() => {
		firebase.fetchCommentsOrReplies("replies", id, "asc", (res) => {
			console.log(res);
			if (res.error) return;
			if (res.empty) {
				setRepliesInfo({ type: "storeReplies", payload: [] });
				return;
			}
			setRepliesInfo({ type: "storeReplies", payload: res });
		});
	}, [id, firebase]);

	return (
		<>
			<Interaction {...{ type: "comments", message: comment, likes, dislikes, timestamp, id, upvotes, author_id, replies: repliesInfo?.replies, setRepliesInfo, repliesInfo, blog_id }} />
			{repliesInfo?.showReplies && (
				<div className="replies">
					{repliesInfo?.replies &&
						repliesInfo?.replies.map((e) => {
							return (
								<Interaction
									key={e.id}
									{...{
										type: "replies",
										message: e.message,
										likes: e.likes,
										dislikes: e.dislikes,
										timestamp: e.timestamp,
										id: e.id,
										upvotes: e.upvotes,
										author_id: e.author_id,
										base_id: e.base_comment_id,
										reply_to: e.reply_to,
										activeReply,
										setActiveReply,
										blog_id,
									}}
									// Receiver id is the id of the comment this reply is to
								/>
							);
						})}
				</div>
			)}
		</>
	);
};

export default Comment;
