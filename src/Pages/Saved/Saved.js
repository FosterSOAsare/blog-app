import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import Loading from "../../components/Loading/Loading";
import BlogPreview from "../../components/BlogPreview/BlogPreview";

const Saved = () => {
	const [loading, setLoading] = useState(true);
	const { credentials, firebase } = useGlobalContext();
	const [blogs, setBlogs] = useState([]);
	useEffect(() => {
		// Fetch saved articles
		firebase.fetchBookMarks(credentials?.userId, (res) => {
			if (res.error) return;
			setLoading(false);
			setBlogs(res);
		});
	}, [firebase, credentials?.userId]);
	return (
		<>
			{!loading && (
				<div className="saved">
					{blogs.length > 0 && (
						<>
							<h3>Saved Articles</h3>
							<div className="blogs">
								{blogs.map((e) => {
									return <BlogPreview key={e.blog_id} {...e} />;
								})}
							</div>
						</>
					)}
					{blogs.empty && <p className="nothing">No bookmarks available...</p>}
				</div>
			)}

			{loading && <Loading />}
		</>
	);
};

export default Saved;
