/**
 * Truncates a given string to a specified limit and adds "..." to the end if the string is longer than the limit
 * @param {string} text - The text to be truncated
 * @param {number} limit - The maximum number of characters to be returned
 * @returns {string} The truncated text
 */
export function truncateText(text, limit) {
	return text && `${text.substring(0, limit)}${text.length > limit ? "..." : ""}`;
}

/**
 * Replaces multiple spaces with a single space and replaces spaces with dashes
 * @param {string} text - The text to be modified
 * @returns {string} The modified text
 */
export function removeSpaces(text) {
	if (text) {
		let newText = text.replace(/  +/g, " ");
		return newText.split(" ").join("-");
	}
	return;
}

/**
 * Removes all HTML elements from a string
 * @param {string} str - The string containing HTML elements
 * @returns {string} The string with all HTML elements removed
 */
export function removeHTML(str) {
	let doc = new DOMParser().parseFromString(str, "text/html");
	return doc.body.textContent || "";
}

/**
 * Removes all special characters from a string
 * @param {string} str - The string to be modified
 * @returns {string} The modified string
 */
export function removeSpecialChars(str) {
	return str.replace(/[^a-zA-Z0-9 ]/g, "");
}

/**
 * Creates a link using a given username, string, and id
 * @param {string} username - The username to be used in the link
 * @param {string} str - The string to be used in the link
 * @param {string} id - The id to be used in the link
 * @returns {string} The generated link
 */
export function createLink(username, str, id) {
	return `/@${username}/${removeSpaces(removeSpecialChars(str)).toLowerCase()}-${id}`;
}

/**
 * Counts the number of elements in a given text
 * @param {string} text - The text to be evaluated
 * @returns {number} The number of elements in the text
 */
export function countElements(text) {
	if (text) {
		text = text.trim();
		if (text === "") return 0;
		text = text.replace(/  +/g, " ");
		return text.split(" ").length;
	}
	return 0;
}

/**
 * Capitalize all first letter of words in a given text
 * @param {string} text - The text to be capitalized
 * @returns {string} The capitalized text
 */
export const capitalize = (text) => {
	const lowercaseText = text.toLowerCase();
	const words = lowercaseText.split(" ");
	for (let i = 0; i < words.length; i++) {
		words[i] = `${words[i].charAt(0).toUpperCase()}${words[i].slice(1)}`;
	}
	return words.join(" ");
};
