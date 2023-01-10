import React from "react";
import { useGlobalContext } from "../../context/AppContext";

const HomePage = () => {
	const { firebase } = useGlobalContext();
	console.log(firebase);
	return <div>HomePage</div>;
};

export default HomePage;
