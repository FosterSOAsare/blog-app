import React, { useState } from "react";

const Sponsors = () => {
	const [sponsors] = useState([{}, {}, {}]);
	// Fetch Sponsors and set the first 3 (In terms of money);
	return (
		<section id="sponsors">
			<div className="sponsors__container">
				{sponsors.map((e, index) => {
					return <div className="sponsor" key={index}></div>;
				})}
			</div>
			<button>Become A Sponsor</button>
		</section>
	);
};

export default Sponsors;
