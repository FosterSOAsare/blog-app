import React from "react";

const ConfirmPopup = ({ desc, opt1, opt2, setShow, proceed }) => {
	return (
		<section className="confirmPopUp popup ">
			<p>{desc}</p>
			<div className="actions">
				<button className="opt1" onClick={proceed}>
					{opt1}
				</button>
				<button className="opt2" onClick={() => setShow(false)}>
					{opt2}
				</button>
			</div>
		</section>
	);
};

export default ConfirmPopup;
