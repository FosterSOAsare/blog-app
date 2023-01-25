import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const Verifications = () => {
	const [verificationObject, setVerificationObject] = useState({});
	const location = useLocation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		setVerificationObject(Object.fromEntries(params));
	}, [location]);

	return <div>Verifications</div>;
};

export default Verifications;
