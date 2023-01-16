import React from "react";
import LoadingGif from "../../assets/images/loading.gif";

const Loading = () => {
	return (
		<div className="loading">
			<img src={LoadingGif} alt="Loading Gif" />
		</div>
	);
};

export default Loading;
