import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../../context/AppContext";

const UserInfo = ({ setShowEditForm, setBlockUserActive, data }) => {
	const [profileImg, setProfileImage] = useState(null);
	const { credentials } = useGlobalContext();
	let { user } = credentials;
	useEffect(() => {
		setProfileImage(data?.imgSrc);
	}, [data]);
	function imageUpload(event) {
		if (event.target.files && event.target.files[0]) {
			let reader = new FileReader();
			reader.onload = (e) => {
				setProfileImage(e.target.result);

				// const file = event.target.files[0];
				// console.log(file);
			};
			reader.readAsDataURL(event.target.files[0]);
		}
	}

	return (
		<section className="userInfo">
			<div className="section__image">
				{profileImg ? <img src={profileImg} alt="Profile" /> : <i className="fa-solid fa-user"></i>}

				{data?.username === user?.username && <label htmlFor="profileImg"></label>}
				{data?.username === user?.username && <input type="file" accept="image/*" onChange={imageUpload} id="profileImg" />}
			</div>
			<div className="section__text">
				<h3>{data?.username}</h3>
				<div className="bio">
					<p>{data?.bio || "User has no bio at the moment "}</p>
					{data?.username === user?.username && <div className="icon" onClick={() => setShowEditForm(true)}></div>}
				</div>
				<div className="subs">
					<div className="subCount">
						<div className="icon"></div>
						<p>0</p>
					</div>
					{data?.username !== user?.username && <button>Subscribe</button>}
					{data?.username !== user?.username && (
						<button className="block" onClick={() => setBlockUserActive(true)}>
							Block User
						</button>
					)}
				</div>
			</div>
		</section>
	);
};

export default UserInfo;
