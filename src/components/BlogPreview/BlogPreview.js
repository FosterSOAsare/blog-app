import React from "react";
import { truncateText, removeSpaces } from "../../utils/Text";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";

const BlogPreview = ({ title, body }) => {
	const { credentials } = useGlobalContext();
	return (
		<article className="blogPreview">
			<NavLink to={`/${credentials?.user?.username}/${removeSpaces(title)}`} className="link">
				<div className="leadImage"></div>
				<h3>{truncateText(body, 55)}</h3>
				<p>{truncateText(body, 255)}</p>
				<div className="actions">
					<div className="like action">
						<div className="icon"></div>
						<p>$0.00</p>
						<div className="icon"></div>
					</div>
					<div className="comments action">
						<div className="icon"></div>
						<p>20</p>
					</div>
					<div className="tips action">
						<div className="icon"></div>
						<p>$0.00</p>
					</div>
					<p className="username">@scyre27</p>
				</div>
			</NavLink>
		</article>
	);
};

export default BlogPreview;
