export function truncateText(text, limit) {
	return `${text.substring(0, limit)}${text.length > limit ? "..." : ""}`;
}

export function removeSpaces(text) {
	return text.split(" ").join("-");
}
