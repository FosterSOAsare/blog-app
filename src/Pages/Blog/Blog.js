import React, { useEffect, useReducer, useRef, useState } from "react";
import { useParams } from "react-router";
import { useGlobalContext } from "../../context/AppContext";
import { removeHTML } from "../../utils/Text";
import Ratings from "../../components/Ratings/Ratings";
import Upvotes from "../../components/Upvotes/Upvotes";
import AuthorInfo from "./AuthorInfo/AuthorInfo";
import Loading from "../../components/Loading/Loading";
import Sponsors from "../../components/Sponsors/Sponsors";
import Comment from "./Comment/Comment";
import BlogControls from "./BlogControls/BlogControls";
import NotFound from "../NotFound/NotFound";
import { useBlockedContext } from "../../context/BlockedContext";
import { removeSpaces, removeSpecialChars } from "../../utils/Text";
const Blog = () => {
	const [profileData, setProfileDispatchFunc] = useReducer(reducerFunc, { author: null, blog: {}, comments: [] });
	const { firebase, credentials, notFound, setNotFound } = useGlobalContext();
	const [showAddComment, setShowAddComment] = useState(false);
	let { loggedInUserBlocked, checkBlockedByAuthor } = useBlockedContext();
	const [commentWaiting, setCommentWaiting] = useState(false);

	// Check to see if the user of the current profile page has blocked the loggediIn user or not
	useEffect(() => {
		checkBlockedByAuthor(profileData?.author?.userId);
	}, [profileData?.author, checkBlockedByAuthor]);

	let { blogTitle, username } = useParams();
	const commentRef = useRef(null);
	username = username.split("@")[1];

	function reducerFunc(data, action) {
		switch (action.type) {
			case "storeAuthor":
				return { ...data, author: action.payload };
			case "storeBlog":
				return { ...data, blog: action.payload };
			case "storeComments":
				return { ...data, comments: action.payload };
			default:
				return data;
		}
	}

	useEffect(() => {
		let blogArr = blogTitle.split("-");
		let blogId = blogArr[blogArr.length - 1];

		// Fetch username and blog
		firebase.fetchBlog(blogId, (res) => {
			document.title = removeHTML(res.heading);
			if (res.error) return;
			if (res.empty) {
				setNotFound(true);
				return;
			}
			if (username !== res.author) {
				setNotFound(true);
				return;
			}
			// Check if the link provided is an exaqct match of the heading
			let link = `${removeSpaces(removeSpecialChars(removeHTML(res.heading))).toLowerCase()}-${res.blog_id}`;
			if (link !== blogTitle) {
				setNotFound(true);
				return;
			}
			// Check heading to see if it matches
			setProfileDispatchFunc({ type: "storeBlog", payload: res });
		});

		firebase.fetchCommentsOrReplies("comments", blogId, "desc", (res) => {
			if (res.error) return;
			if (res.empty) return;
			setProfileDispatchFunc({ type: "storeComments", payload: res });
		});

		firebase.fetchUserWithUsername(username, (res) => {
			if (res?.error) {
				return;
			}
			setProfileDispatchFunc({ type: "storeAuthor", payload: res });
		});
	}, [firebase, blogTitle, username, setNotFound]);

	useEffect(() => {
		let parent = commentRef.current;
		if (profileData?.author && parent) {
			parent.addEventListener("keyup", () => {
				if (parent.value !== "") {
					setShowAddComment(true);
				} else {
					setShowAddComment(false);
				}
				parent.style.height = parent.scrollHeight > parent.clientHeight ? parent.scrollHeight + "px" : "60px";
			});
		}
	}, [commentRef, profileData?.author]);

	function addComment(comment, author_id, blog_id) {
		if (comment === "") return;
		setCommentWaiting(true);
		firebase.storeCommentOrReply("comments", { comment, author_id, blog_id, receiver_id: profileData?.author?.userId }, (res) => {
			if (res.error) return;
			setShowAddComment(false);
			commentRef.current.value = "";
			setCommentWaiting(false);
		});
	}
	return (
		<>
			{!notFound && !loggedInUserBlocked && (
				<>
					{!profileData?.blog?.blog_id && <Loading />}
					{profileData?.blog?.blog_id && (
						<>
							<main className="blog">
								<div className="article__image" data-heading={removeHTML(profileData?.blog?.heading)}>
									<img src={profileData?.blog?.lead_image_src} alt="Lead" />
								</div>
								<div className="blog__content">
									<BlogControls
										commentsLen={profileData?.comments.length}
										bookmarks={profileData?.blog?.bookmarks ? profileData?.blog?.bookmarks : []}
										blog_id={profileData?.blog?.blog_id}
										viewers={profileData?.blog?.viewers}
									/>
									<AuthorInfo
										{...profileData?.author}
										blog_id={profileData?.blog?.blog_id}
										blog_timestamp={profileData?.blog?.timestamp}
										editTime={profileData?.blog?.editTime}
										topics={profileData?.blog?.topics}
									/>
									<div className="content" dangerouslySetInnerHTML={{ __html: profileData?.blog?.message }}></div>
									<Ratings likes={profileData?.blog?.likes} dislikes={profileData?.blog?.dislikes} id={profileData?.blog?.blog_id} type="blogs" />
									<Upvotes blog_id={profileData?.blog?.blog_id} upvotes={profileData?.blog?.upvotes} author_id={profileData?.author?.userId} />
									<Sponsors data={profileData?.author} />
									<AuthorInfo
										{...profileData?.author}
										blog_id={profileData?.blog?.blog_id}
										blog_timestamp={profileData?.blog?.timestamp}
										editTime={profileData?.blog?.editTime}
										topics={profileData?.blog?.topics}
									/>
								</div>
							</main>
							<section id="comments">
								<div className="comments__container">
									<h3>Comments</h3>
									{credentials?.user && <textarea name="comment" id="" cols="30" rows="10" placeholder="Add your comment" ref={commentRef}></textarea>}
									{credentials?.user && showAddComment && (
										<>
											{!commentWaiting && (
												<button
													onClick={(e) => {
														addComment(commentRef.current.value, credentials?.userId, profileData?.blog?.blog_id);
													}}>
													Add comment
												</button>
											)}
											{commentWaiting && <button className="waiting">Waiting...</button>}
										</>
									)}

									{!showAddComment && (
										<div className="content">
											{!profileData?.comments && <Loading />}
											{profileData?.comments &&
												profileData?.comments?.map((e) => {
													return <Comment key={e.id} {...e} blog_id={profileData?.blog?.blog_id} />;
												})}
										</div>
									)}
								</div>
							</section>
						</>
					)}
				</>
			)}
			{loggedInUserBlocked && <p className="blocked">You have been blocked by @{profileData?.author?.username}</p>}
			{!loggedInUserBlocked && notFound && <NotFound />}
		</>
	);
};

export default Blog;
