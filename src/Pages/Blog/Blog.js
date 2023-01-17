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
const Blog = () => {
	const [profileData, setProfileDispatchFunc] = useReducer(reducerFunc, { author: null, blog: {}, comments: [] });
	const { firebase, credentials } = useGlobalContext();
	const [showAddComment, setShowAddComment] = useState(false);
	let { blogTitle } = useParams();
	const commentRef = useRef(null);
	let username = useParams().username;
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
			if (res.error) return;
			if (res.empty) return;
			setProfileDispatchFunc({ type: "storeBlog", payload: res });
		});

		firebase.fetchComments(blogId, (res) => {
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
	}, [firebase, blogTitle, username]);

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
		firebase.storeComment({ comment, author_id, blog_id }, (res) => {
			if (res.error) return;
			setShowAddComment(false);
			commentRef.current.value = "";
		});
	}
	return (
		<>
			{!profileData?.blog?.blog_id && <Loading />}
			{profileData?.blog?.blog_id && (
				<>
					<main className="blog">
						<div className="article__image" data-heading={removeHTML(profileData?.blog?.heading)}>
							<img src={profileData?.blog?.lead_image_src} alt="Lead" />
						</div>
						<AuthorInfo {...profileData?.author} blog_id={profileData?.blog?.blog_id} blog_timestamp={profileData?.blog?.timestamp} />
						<div className="content" dangerouslySetInnerHTML={{ __html: profileData?.blog?.message }}></div>
						<Ratings likes={profileData?.blog?.likes} dislikes={profileData?.blog?.dislikes} blog_id={profileData?.blog?.blog_id} />
						<Upvotes blog_id={profileData?.blog?.blog_id} upvotes={profileData?.blog?.upvotes} author_id={profileData?.author?.userId} />
						<Sponsors data={profileData?.author} />
						<AuthorInfo {...profileData?.author} blog_id={profileData?.blog?.blog_id} blog_timestamp={profileData?.blog?.timestamp} />
					</main>
					<section id="comments">
						<div className="comments__container">
							<h3>Comments</h3>
							{credentials?.user && <textarea name="comment" id="" cols="30" rows="10" placeholder="Add your comment" ref={commentRef}></textarea>}
							{credentials?.user && showAddComment && (
								<button
									onClick={(e) => {
										addComment(commentRef.current.value, credentials?.userId, profileData?.blog?.blog_id);
									}}
								>
									Add comment
								</button>
							)}

							<div className="content">
								{!profileData?.comments && <Loading />}
								{profileData?.comments &&
									profileData?.comments?.map((e) => {
										console.log(e);
										return <Comment key={e.id} {...e} />;
									})}
							</div>
						</div>
					</section>
				</>
			)}
		</>
	);
};

export default Blog;
