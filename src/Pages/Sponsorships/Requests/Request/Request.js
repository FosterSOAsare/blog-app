import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import Loading from "../../../../components/Loading/Loading";
import { useGlobalContext } from "../../../../context/AppContext";

const Request = () => {
	let { request_id } = useParams();
	const [request, setRequest] = useState({});
	const [loading, setLoading] = useState(true);
	const { firebase, credentials } = useGlobalContext();

	useEffect(() => {
		firebase.fetchRequest(request_id, (res) => {
			console.log(res);
			if (res.error) return;
			setRequest(res);
			setLoading(false);
		});
	}, [firebase, request_id]);

	function moderateRequest(status) {
		firebase.moderateRequest(status, request?.sponsor_id, request?.author_id, request_id, (res) => {
			console.log(res);
		});
	}

	return (
		<>
			{loading && <Loading />}
			{!loading && (
				<>
					<div className="requestSponsorship">
						<img src={request?.promo_image} alt="" />
						<p>{request?.promo_desc}</p>
						<a href={request?.promo_link} target="_blank" rel="noreferrer">
							Link to sponsorship
						</a>
						<button
							onClick={() => {
								moderateRequest("approved");
							}}>
							Accept
						</button>
						<button
							className="cancel"
							onClick={() => {
								moderateRequest("declined");
							}}>
							Decline
						</button>
					</div>
					{request?.author_id !== credentials?.userId && <Navigate to="/" />}
					{request?.status !== "pending" && <Navigate to="/sponsorships/requests" />}
				</>
			)}
		</>
	);
};

export default Request;
