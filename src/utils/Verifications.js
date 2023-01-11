export class Verifications {
	verifyEmail(email) {
		if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
			return false;
		}
		return true;
	}

	validatePassword(password) {
		if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password)) {
			return false;
		}
		return true;
	}
}
