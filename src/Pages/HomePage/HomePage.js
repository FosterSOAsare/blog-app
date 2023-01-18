import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../context/AppContext";
import BlogPreview from "../../components/BlogPreview/BlogPreview";
import Loading from "../../components/Loading/Loading";
const HomePage = () => {
	const [blogs, setBlogs] = useState([]);
	const { firebase } = useGlobalContext();

	useEffect(() => {
		// Fetch all blogs
		firebase.fetchBlogs(null, (res) => {
			setBlogs(res);
		});
	}, [firebase]);
	return (
		<section className="homepage">
			<div className="container">
				{blogs.length > 0 && (
					<div className="blogs">
						{blogs?.map((e) => {
							return e ? <BlogPreview {...e} key={e.blog_id} /> : "";
						})}
					</div>
				)}
				{blogs.length === 0 && <Loading />}
			</div>
		</section>
	);
};

export default HomePage;
