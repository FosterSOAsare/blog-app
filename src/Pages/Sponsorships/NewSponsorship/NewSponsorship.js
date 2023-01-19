import React, { useEffect, useReducer, useRef, useState } from "react";
import { useGlobalContext } from "../../../context/AppContext";
import { Navigate, useParams } from "react-router";
import Loading from "../../../components/Loading/Loading";
import Error from "../../../components/form/Error";
import { useAuthContext } from "../../../context/AuthContext";

const NewSponsorship = () => {
	// Fetch user and sponsors
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);

	const [displayedImage, setDisplayedImage] = useState(null);
	const { error, errorFunc, verifications } = useAuthContext();
	const [userData, setUserData] = useReducer(reducerFunc, { user: null, sponsors: [] });
	const adImageRef = useRef(null);

	function reducerFunc(userData, action) {
		switch (action.type) {
			case "storeUser":
				return { ...userData, user: action.payload };
			case "storeSponsors":
				return { ...userData, sponsors: action.payload };
			default:
				return userData;
		}
	}
	const { firebase, credentials } = useGlobalContext();
	const { userId } = useParams();

	useEffect(() => {
		firebase.fetchUserWithId(userId, (res) => {
			setUserData({ type: "storeUser", payload: res });
		});
		firebase.fetchSponsors(userId, (res) => {
			setUserData({ type: "storeSponsors", payload: res.empty ? [] : res });
			setLoading(false);
		});
	}, [firebase, userId]);

	function displayImage(e) {
		let file = e.target.files[0];
		let reader = new FileReader();
		reader.onload = () => {
			setDisplayedImage(reader.result);
		};
		reader.readAsDataURL(file);
	}

	function sendNotice(e) {
		e.preventDefault();
		let formData = new FormData(e.target);
		let promo_desc = formData.get("promo_desc");
		let promo_link = formData.get("promo_link");
		let images = adImageRef.current.files;
		if (!promo_desc || !promo_link || !images?.length) {
			errorFunc({ type: "displayError", payload: "Please fill in all credentials" });
			return;
		}
		if (!verifications.checkLength(promo_desc, 255)) {
			errorFunc({ type: "displayError", payload: "Sponsorship description should be less than 255 characters" });
			return;
		}
		if (!verifications.validateLink(promo_link)) {
			errorFunc({ type: "displayError", payload: "Please enter a valid link " });
			return;
		}

		firebase.storeSponsorship({ promo_desc, promo_link, image: images[0], author_id: userData?.user?.user_id, sponsor_id: credentials?.userId }, (res) => {
			if (res.error) return;
			setShowForm(false);
		});
	}
	return (
		//  userData?.user?.user_id !== credentials?.userId &&
		<>
			{!loading && userData?.user && (
				<>
					{credentials?.userId !== userData?.user?.user_id && (
						<>
							{!showForm && (
								<section className="newSponsorship">
									<h3>Sponsor {userData.user.username}</h3>
									<p>Thank you for considering sponsorship of {userData.user.username}. </p>
									<p className="notice">NB: Every author has a maximum of 3 sponsors with a life time sponsorship fee of $25.</p>
									<p>To start the process, press the button below.</p>
									{userData?.sponsors?.length < 3 && <button onClick={() => setShowForm(true)}>Become a sponsor</button>}
									{userData?.sponsors?.length === 3 && <p className="limitExceeded">Sorry sponsorship limit exceeded </p>}
								</section>
							)}
							{showForm && (
								<form className="newSponsorshipForm" onSubmit={sendNotice}>
									<label htmlFor="promo_desc">Enter sponsorship description</label>
									<input type="text" aria-placeholder="Enter sponsorship description" name="promo_desc" id="promo_desc" onFocus={() => errorFunc({ type: "clearError" })} />
									<label htmlFor="promo_link">Enter link to promote</label>
									<input type="text" aria-placeholder="Enter link to promote" name="promo_link" id="promo_link" onFocus={() => errorFunc({ type: "clearError" })} />
									<label htmlFor="promo_image" className="adImage">
										{!displayedImage ? <p> ad image</p> : <img src={displayedImage} alt="adImage" />}
										<span>+</span>
									</label>
									<input
										type="file"
										aria-placeholder="Select ad image"
										ref={adImageRef}
										accept="image/*"
										name="promo_image"
										id="promo_image"
										onChange={(e) => displayImage(e)}
										onFocus={() => errorFunc({ type: "clearError" })}
									/>
									{error.display !== "none" && <Error text={error.text} />}
									<button>Send sponsorship Notice </button>
								</form>
							)}
						</>
					)}
					{credentials?.userId === userData?.user?.user_id && <Navigate to={`/@${credentials?.user?.username}`} />}
				</>
			)}
			{loading && <Loading />}
		</>
	);
};

export default NewSponsorship;
