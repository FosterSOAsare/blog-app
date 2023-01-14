import React from "react";
import { truncateText, removeSpaces } from "../../utils/Text";
import { NavLink } from "react-router-dom";
import { useGlobalContext } from "../../context/AppContext";

const BlogPreview = ({ heading, message }) => {
	const { credentials } = useGlobalContext();
	// console.log(body);
	return (
		<article className="blogPreview">
			<NavLink to={`/${credentials?.user?.username}/${removeSpaces(heading)}`} className="link">
				<div className="leadImage"></div>
				<h3 dangerouslySetInnerHTML={{ __html: heading }}></h3>
				<p dangerouslySetInnerHTML={{ __html: truncateText(message, 175) }}></p>
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
