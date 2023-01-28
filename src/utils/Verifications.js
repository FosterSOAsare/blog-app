export class Verifications {
	/*
	Verify the email address
	@param {string} email - The email address to be verified
	*/
	verifyEmail(email) {
		return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
	}
	/*
	Validate the password
	@param {string} password - The password to be validated
	@returns {boolean} - true if password is valid, false otherwise
	*/
	validatePassword(password) {
		return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password);
	}
	/*
	Validate the username
	@param {string} username - The username to be validated
	@returns {boolean} - true if username is valid, false otherwise
	*/

	validateUsername(username) {
		return /^[a-zA-Z0-9._-]{3,15}$/.test(username);
	}
	/*
	Validate the length of a string of text
	@param {string} text - The text to be validated by its length
	@param {number} length - The length to be used for the validation
	@returns {boolean} - true if text's length is less than or equal to the length specified , false otherwise
	*/
	checkLength(text, length) {
		return text.length <= length;
	}
	/*
	Validate the link
	@param {string} link - The link to be validated
	@returns {boolean} - true if username is valid, false otherwise
	*/
	validateLink(link) {
		return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(link);
	}
}
