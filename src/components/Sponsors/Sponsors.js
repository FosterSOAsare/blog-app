import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import { arrangeSponsorships } from "../../utils/Sponsorship.js/Sponsorship.util";

const Sponsors = ({ data, loggedUser }) => {
	const [sponsors, setSponsors] = useState([{}, {}, {}]);
	const { firebase, credentials } = useGlobalContext();

	// Fetch Sponsors and set the first 3 (In terms of money);
	useEffect(() => {
		data &&
			firebase.fetchSponsors(data?.username, (res) => {
				if (res.error) return;
				setSponsors(arrangeSponsorships(res));
			});
	}, [data, firebase]);
	return (
		<section id="sponsors">
			<p className="sponsors_intro">Sponsors of {data?.username}</p>
			<div className="sponsors__container">
				{sponsors.map((e, index) => {
					return (
						<div className="sponsor" key={e?.sponsorship_id || index}>
							{/* For occupied spaces */}
							{e.sponsorship_id && (
								<a className="image" title={e.promo_desc} href={e.promo_link} target="_blank" rel="noreferrer">
									{e.promo_image && <img src={e.promo_image} alt="" />}
								</a>
							)}
							{/* For unoccupied spaces */}
							{!e.sponsorship_id && <div className="empty">Empty</div>}
						</div>
					);
				})}
			</div>
			{credentials?.user && credentials?.user?.username !== data?.username && <button>Become A Sponsor</button>}
		</section>
	);
};

export default Sponsors;
