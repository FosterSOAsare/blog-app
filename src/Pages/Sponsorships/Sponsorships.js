import React, { useState, useEffect } from "react";
import { useGlobalContext } from "../../context/AppContext";
import Loading from "../../components/Loading/Loading";

const Sponsorships = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [sponsorships, setSponsorships] = useState([]);
	const { firebase, credentials } = useGlobalContext();
	useEffect(() => {
		firebase.fetchSponsoredAuthors(credentials?.userId, (res) => {
			setSponsorships(res);
			setLoading(false);
		});
	}, [firebase, credentials?.userId]);

	function deleteSponsorship(sponsorship_id, author_id) {
		firebase.deleteSponsorship(sponsorship_id, author_id, credentials?.userId, (res) => {
			if (res.error) return;
		});
	}

	function payForSponsporship(sponsorship_id, author_id) {
		if (credentials?.user?.balance < 25) {
			setError(true);
			return;
		}
		firebase.payForSponsporship(sponsorship_id, credentials?.userId, author_id, (res) => {
			if (res.empty) return;
		});
	}
	return (
		<>
			{loading && <Loading />},
			{!loading && (
				<>
					{!sponsorships.empty && (
						<section className="sponsorships">
							<h3>Your sponsorships</h3>
							<table className="heading" cellSpacing="0">
								<thead>
									<tr>
										<td className="image">Image</td>
										<td className="author">Author</td>
										<td className="status">Status</td>
										<td className="actions">Actions</td>
									</tr>
								</thead>
								<tbody>
									{sponsorships.map((e) => {
										return (
											<tr key={e.sponsorship_id} className="sponsorship">
												<td className="image">
													<img src={e.promo_image} alt="adImage" />
												</td>
												<td className="author" href={e.promo_link} target="_blank" rel="noreferrer">
													{e.author?.username}
												</td>
												<td>
													<p className={`status ${e.status}`}>{e.status}</p>
													{!e.settled && e.status === "approved" && <span onClick={() => payForSponsporship(e.sponsorship_id, e.author_id)}>Send Payment</span>}
												</td>
												<td className="actions">
													<p className="cancel" onClick={() => deleteSponsorship(e.sponsorship_id, e.author_id)}>
														{e.status === "declined" ? "Delete" : "Cancel"}
													</p>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
							{error && (
								<div className="insufficientFunds">
									<p>Insufficient funds, please add more funds to continue</p>
									<button
										onClick={() => {
											setError(false);
										}}>
										Ok
									</button>
								</div>
							)}
						</section>
					)}
					{sponsorships.empty && <p className="nothingHere">Nothing here...</p>}
				</>
			)}
		</>
	);
};

export default Sponsorships;
