import React from "react";

const UserInfo = () => {
	return (
		<section className="userInfo">
			<div className="section__image"></div>
			<div className="section__text">
				<h3>Dangerous_Fly</h3>
				<div className="bio">
					<p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. ligendi quis repudiandae et error voluptatibus.</p>
					<div className="icon"></div>
				</div>
				<div className="subs">
					<div className="subCount">
						<div className="icon"></div>
						<p>0</p>
					</div>
					<button>Subscribe</button>
					<button>Block User</button>
				</div>
			</div>
		</section>
	);
};

export default UserInfo;
