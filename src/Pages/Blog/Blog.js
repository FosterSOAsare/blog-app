import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useGlobalContext } from "../../context/AppContext";
import { removeHTML } from "../../utils/Text";
import Ratings from "../../components/Ratings/Ratings";
import Upvotes from "../../components/Upvotes/Upvotes";
const Blog = () => {
	const { firebase } = useGlobalContext();
	let { blogTitle } = useParams();
	let [blog, setBlog] = useState({});

	useEffect(() => {
		let blogArr = blogTitle.split("-");
		let blogId = blogArr[blogArr.length - 1];

		// Fetch username and blog title
		firebase.fetchBlog(blogId, (res) => {
			if (res.error) return;
			if (res.empty) return;
			setBlog(res);
		});
	}, [firebase, blogTitle]);
	return (
		<main className="blog">
			<div className="article__image" data-heading={removeHTML(blog?.heading)}>
				<img src={blog.lead_image_src} alt="Lead" />
			</div>
			<div className="content" dangerouslySetInnerHTML={{ __html: blog?.message }}></div>
			<Ratings likes={blog?.likes} dislikes={blog?.dislikes} blog_id={blog?.blog_id} />
			<Upvotes blogId={blog?.blog_id} />
		</main>
	);
};

export default Blog;
