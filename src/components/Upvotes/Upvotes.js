import React from "react";
import Encourage from "../../assets/images/svgs/encourage.svg";
import TipBox from "../TipBox/TipBox";

import Tipper from "../Tipper/Tipper";

const Upvotes = ({ blog_id, upvotes, author_id }) => {
	upvotes = upvotes.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
	return (
		<>
			<section className="upvotes" id="upvotes">
				<div className="tips">
					<TipBox {...{ upvotes, author_id, id: blog_id, type: "blogs" }} />
					<div className="tippers">
						{upvotes &&
							upvotes.map((e, index) => {
								return <Tipper {...e} key={index} />;
							})}
					</div>
				</div>
				<div className="image">
					<img src={Encourage} alt="" />
				</div>
			</section>
		</>
	);
};

export default Upvotes;
