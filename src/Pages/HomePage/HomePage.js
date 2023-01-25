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
			if (res.error) return;
			setBlogs(res);
		});
	}, [firebase]);
	return (
		<section className="homepage">
			<div className="container">
				{!blogs.empty && blogs.length > 0 && (
					<div className="blogs">
						{blogs?.map((e) => {
							return e ? <BlogPreview {...e} key={e.blog_id} /> : "";
						})}
					</div>
				)}
				{!blogs.empty && blogs?.length === 0 && <Loading />}
				{blogs.empty && <p className="nothingHere">Nothing here...</p>}
			</div>
		</section>
	);
};

export default HomePage;
