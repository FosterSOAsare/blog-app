export function checkSubscribed(followers, userId) {
	return followers && followers.split(" ").find((e) => e === userId);
}

export function removeSubscription(followers, userId) {
	return followers !== "" && followers.filter((e) => e !== userId).join(" ");
}

export function addSubscription(followers, userId) {
	followers.push(userId);
	return followers.join(" ");
}
