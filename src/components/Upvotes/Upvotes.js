import React, { useEffect, useRef, useState } from "react";
import Encourage from "../../assets/images/svgs/encourage.svg";
import Error from "../../components/form/Error";
import { useAuthContext } from "../../context/AuthContext";
import { useGlobalContext } from "../../context/AppContext";

import Tipper from "../Tipper/Tipper";

const Upvotes = ({ blog_id, upvotes, author_id }) => {
	const [showForm, setShowForm] = useState(false);
	const [blogTips, setBlogTips] = useState([]);
	const { credentials, firebase } = useGlobalContext();
	let tippers = upvotes && JSON.parse(upvotes);

	let { error, errorFunc } = useAuthContext();
	let amountInput = useRef(null);

	useEffect(() => {
		// Amount , username , profile picture
		let tips = upvotes && upvotes !== "" ? JSON.parse(upvotes) : [];
		// Sort to get the highest tip
		if (tips.length) {
			tips = tips.sort((a, b) => b.amount - a.amount);
		}
		setBlogTips(tips);
	}, [upvotes]);

	function sendTip(e) {
		e.preventDefault();
		let value = parseFloat(amountInput.current.value);
		if (value.length < 1) {
			errorFunc({ type: "displayError", payload: "Please enter an amount to tip" });
			return;
		}
		// Check if user has more sufficient funds
		if (credentials?.user?.balance <= value && value < 0) {
			errorFunc({ type: "displayError", payload: "Insufficient funds" });
			return;
		}

		// Check if user has already upvoted and update
		let newData = blogTips.find((e) => e.username === credentials?.user?.username);

		if (newData) {
			newData = blogTips.map((e) => {
				return e.username === credentials?.user?.username ? { ...e, amount: (parseFloat(e.amount) + parseFloat(value)).toFixed(2) } : e;
			});
		} else {
			newData = [{ amount: parseFloat(value).toFixed(2), username: credentials?.user?.username, profile_img: credentials?.user?.img_src || "" }];
		}

		firebase.storeUpvote(blog_id, JSON.stringify(newData), author_id, credentials?.userId, parseFloat(value).toFixed(2), (res) => {
			if (res.error) return;
			setShowForm(false);
		});
	}
	return (
		<>
			<section className="upvotes">
				<div className="tips">
					<div
						className="upvote"
						onClick={() => {
							if (credentials?.userId === author_id) return;
							setShowForm(true);
						}}
					>
						<i className="fa-solid fa-arrow-up"></i>
						<p>$ 0.00</p>
					</div>
					<div className="tippers">
						{tippers &&
							tippers.map((e, index) => {
								return <Tipper {...e} key={index} />;
							})}
					</div>
				</div>
				<div className="image">
					<img src={Encourage} alt="" />
				</div>
			</section>
			{showForm && (
				<form action="" className="tipForm">
					<label htmlFor="amount">
						Enter amount to tip <span>(to 2 d.p)</span>
					</label>
					<input type="text" name="amount" id="amount" ref={amountInput} onFocus={() => errorFunc({ type: "clearError" })} />
					{error.display !== "none" && <Error text={error.text} />}
					<div className="actions">
						<button onClick={sendTip}>Confirm tip</button>
						<button
							className="cancel"
							onClick={(e) => {
								e.preventDefault(e);
								setShowForm(false);
							}}
						>
							Cancel
						</button>
					</div>
				</form>
			)}
		</>
	);
};

export default Upvotes;
