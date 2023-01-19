import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";
import Loading from "../../../components/Loading/Loading";

const Requests = () => {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const { firebase, credentials } = useGlobalContext();
	useEffect(() => {
		firebase.fetchAllRequests(credentials?.userId, (res) => {
			if (res.error) return;
			setRequests(res);
			setLoading(false);
		});
	}, [firebase, credentials?.userId]);
	return (
		<div className="requests">
			<h3>Received Sponsorship Requests</h3>
			{!loading && (
				<>
					{requests &&
						!requests?.empty &&
						requests.map((e, index) => {
							return (
								<div key={index} className="request">
									<div className="image">
										<img src={e.promo_image} alt="adImage" />
									</div>
									<a className="desc" href={e.promo_link} target="_blank" rel="noreferrer">
										{e.promo_desc}
									</a>
									<Link to={`/sponsorships/requests/${e.request_id}`} className="moderate">
										Moderate
									</Link>
								</div>
							);
						})}

					{requests && requests?.empty && <p>Nothing here...</p>}
				</>
			)}
			{loading && <Loading />}
		</div>
	);
};

export default Requests;
