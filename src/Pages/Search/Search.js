import React, { useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import BlogPreview from "../../components/BlogPreview/BlogPreview";
import { useParams } from "react-router";
import { capitalize } from "../../utils/Text";
import { useEffect } from "react";

const Search = () => {
	const [searchResult, setSearchResult] = useState([]);
	const { firebase } = useGlobalContext();
	const { topic } = useParams();

	function submitSearch(e) {
		e.preventDefault();
		let data = new FormData(e.target).get("searchQuery");
		if (data.length < 3) return;
		firebase.getQuery(data, (res) => {
			if (res.error) return;
			setSearchResult(res);
		});
	}

	// Fetch results based on tags
	useEffect(() => {
		topic &&
			firebase.searchBlogsWithATag(topic, (res) => {
				if (res.error) return;
				setSearchResult(res);
				document.title = capitalize(topic);
			});
	}, [topic, firebase]);
	return (
		<section className="search">
			<div className="container">
				<form action="" onSubmit={submitSearch}>
					<input type="text" placeholder="search" name="searchQuery" />
					<button>
						<i className="fa-solid fa-magnifying-glass"></i>
					</button>
				</form>
				<p className="example">
					For example : <span>Domestic Violence</span>
				</p>

				<div className="results">
					{searchResult.length > 0 &&
						searchResult.map((e) => {
							return <BlogPreview key={e.blog_id} {...e} />;
						})}
					{searchResult.empty && <p className="empty">Nothing found</p>}
				</div>
			</div>
		</section>
	);
};

export default Search;
