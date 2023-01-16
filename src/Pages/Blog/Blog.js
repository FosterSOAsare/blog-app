import React, { useEffect, useReducer } from "react";
import { useParams } from "react-router";
import { useGlobalContext } from "../../context/AppContext";
import { removeHTML } from "../../utils/Text";
import Ratings from "../../components/Ratings/Ratings";
import Upvotes from "../../components/Upvotes/Upvotes";
import AuthorInfo from "./AuthorInfo/AuthorInfo";
import Loading from "../../components/Loading/Loading";
const Blog = () => {
	const [profileData, setProfileDispatchFunc] = useReducer(reducerFunc, { author: null, blog: {} });
	const { firebase } = useGlobalContext();
	let { blogTitle } = useParams();
	let username = useParams().username;
	username = username.split("@")[1];

	function reducerFunc(data, action) {
		switch (action.type) {
			case "storeAuthor":
				return { ...data, author: action.payload };
			case "storeBlog":
				return { ...data, blog: action.payload };
			case "setComment":
				return {
					...data,
					blogs: data.blogs.map((e) => {
						return e.blog_id === action.id ? { ...data, comments: action.payload } : e;
					}),
				};
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

		firebase.fetchUserWithUsername(username, (res) => {
			if (res?.error) {
				return;
			}
			setProfileDispatchFunc({ type: "storeAuthor", payload: res });
		});
	}, [firebase, blogTitle, username]);
	return (
		<>
			{!profileData?.blog?.blog_id && <Loading />}
			{profileData?.blog?.blog_id && (
				<main className="blog">
					<div className="article__image" data-heading={removeHTML(profileData?.blog?.heading)}>
						<img src={profileData?.blog?.lead_image_src} alt="Lead" />
					</div>
					<AuthorInfo {...profileData?.author} blog_id={profileData?.blog?.blog_id} blog_timestamp={profileData?.blog?.timestamp} />
					<div className="content" dangerouslySetInnerHTML={{ __html: profileData?.blog?.message }}></div>
					<Ratings likes={profileData?.blog?.likes} dislikes={profileData?.blog?.dislikes} blog_id={profileData?.blog?.blog_id} />
					<Upvotes blog_id={profileData?.blog?.blog_id} upvotes={profileData?.blog?.upvotes} author_id={profileData?.author?.userId} />
				</main>
			)}
		</>
	);
};

export default Blog;
