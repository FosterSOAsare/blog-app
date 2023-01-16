import React, { useRef, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const Tipper = ({ username, profile_img, amount }) => {
	const [showInfo, setShowInfo] = useState(false);
	const info = useRef(null);
	useEffect(() => {
		let parent = info.current;
		let current = undefined;
		document.addEventListener("mousemove", (e) => {
			current = e.target;
			if (parent.contains(e.target)) {
				setShowInfo(true);
			} else {
				setTimeout(() => {
					!parent.contains(current) && setShowInfo(false);
				}, 200);
			}
		});
	}, []);

	return (
		<NavLink className="tipper" to={`/@${username}`} ref={info}>
			{profile_img !== "" ? <img src={profile_img} alt="Tipper" /> : <i className="fa-solid fa-user"></i>}
			{showInfo && (
				<div className="blog_info">
					<p>
						${amount} from @{username}
					</p>
				</div>
			)}
		</NavLink>
	);
};

export default Tipper;
