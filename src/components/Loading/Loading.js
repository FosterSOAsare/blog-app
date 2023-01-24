import React from "react";
import LoadingGif from "../../assets/images/loading.gif";

const Loading = ({ errorStatus }) => {
	return (
		<>
			{!errorStatus && (
				<div className="loading">
					<img src={LoadingGif} alt="Loading Gif" />
				</div>
			)}
			{errorStatus && (
				<div className="errorOccurred">
					<p>An error occurred </p>
					<button>Retry</button>
				</div>
			)}
		</>
	);
};

export default Loading;
