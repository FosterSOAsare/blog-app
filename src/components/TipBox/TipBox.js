import React, { useState, useMemo, useEffect, useRef } from "react";
import { useGlobalContext } from "../../context/AppContext";
import { useAuthContext } from "../../context/AuthContext";
import Error from "../form/Error";

const TipBox = ({ upvotes, author_id, blog_id }) => {
	const { credentials, firebase } = useGlobalContext();
	const [showForm, setShowForm] = useState(false);
	let { error, errorFunc } = useAuthContext();
	const [blogTips, setBlogTips] = useState([]);
	let amountInput = useRef(null);

	const totalTips = useMemo(() => {
		if (blogTips) {
			return blogTips.reduce((total, tip) => total + parseFloat(tip.amount), 0);
		}
		return 0;
	}, [blogTips]);

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
			<div
				className="upvote"
				onClick={() => {
					if (credentials?.userId === author_id) return;
					setShowForm(true);
				}}>
				<i className="fa-solid fa-arrow-up"></i>
				<p>{totalTips.toFixed(2)}</p>
			</div>
			{showForm && (
				<form action="" className="tipForm">
					<div className="container">
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
								}}>
								Cancel
							</button>
						</div>
					</div>
				</form>
			)}
		</>
	);
};

export default TipBox;
