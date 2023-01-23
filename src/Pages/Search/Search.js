import React, { useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import BlogPreview from "../../components/BlogPreview/BlogPreview";

const Search = () => {
	const [searchResult, setSearchResult] = useState([]);
	const { firebase } = useGlobalContext();

	function submitSearch(e) {
		e.preventDefault();
		let data = new FormData(e.target).get("searchQuery");
		firebase.getQuery(data, (res) => {
			if (res.error) return;
			setSearchResult(res);
		});
	}
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
					For example : <span>Dead_Alnix</span>
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
