/**
 * Check if a user is subscribed to a list of followers
 * @param {Array} followers - Array of user IDs representing the list of followers
 * @param {string} userId - ID of the user to check for subscription
 * @returns {boolean} - Returns true if the user is subscribed, false otherwise
 */
export function checkSubscribed(followers, userId) {
	return followers.length > 0 && followers.find((e) => e === userId);
}

/**
 * Remove a user's subscription from a list of followers
 * @param {Array} followers - Array of user IDs representing the list of followers
 * @param {string} userId - ID of the user to remove subscription for
 * @returns {Array} - Returns the updated list of followers with the user's subscription removed
 */
export function removeSubscription(followers, userId) {
	return followers.length > 0 && followers.filter((e) => e !== userId);
}

/**
 * Add a user's subscription to a list of followers
 * @param {Array} followers - Array of user IDs representing the list of followers
 * @param {string} userId - ID of the user to add subscription for
 * @returns {Array} - Returns the updated list of followers with the new subscription added
 */
export function addSubscription(followers, userId) {
	followers.push(userId);
	return followers;
}
