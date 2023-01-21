import React, { useState } from "react";
import { useGlobalContext } from "../../context/AppContext";

const Search = () => {
	const [searchResult, setSearchResult] = useState([]);
	const { firebase } = useGlobalContext();

	function submitSearch(e) {
		e.preventDefault();
		let data = new FormData(e.target).get("searchQuery");
		firebase.getQuery(data, (res) => {
			console.log(res);
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

				{searchResult.length > 0 && <div className="result"></div>}
			</div>
		</section>
	);
};

export default Search;
