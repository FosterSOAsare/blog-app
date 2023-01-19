import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/AppContext";
import { arrangeSponsorships } from "../../utils/Sponsorship.js/Sponsorship.util";
import Loading from "../Loading/Loading";
import { NavLink } from "react-router-dom";

const Sponsors = ({ data }) => {
	const [sponsors, setSponsors] = useState([]);
	const { firebase, credentials } = useGlobalContext();

	// Fetch Sponsors and set the first 3 (In terms of money);
	useEffect(() => {
		data &&
			firebase.fetchSponsors(data?.userId, (res) => {
				if (res.error) return;
				setSponsors(arrangeSponsorships(res));
			});
	}, [data, firebase]);
	return (
		<section id="sponsors">
			{data?.username && <p className="sponsors_intro">Sponsors of {data?.username}</p>}
			<div className="sponsors__container">
				{!sponsors?.length && <Loading />}
				{sponsors &&
					sponsors.map((e, index) => {
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
			{credentials?.user && credentials?.user?.username !== data?.username && (
				<NavLink to={`/sponsorships/new/${data?.userId}`} className="button">
					Become A Sponsor
				</NavLink>
			)}
		</section>
	);
};

export default Sponsors;
