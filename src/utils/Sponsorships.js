/**
	@function arrangeSponsorships
	@param {Array} sponsorships - Array of sponsorship objects
	@returns {Array} - Array of sponsorship objects with at least 3 elements, filled with empty objects if necessary
	This function takes in an array of sponsorship objects and ensures that the array has at least 3 elements.
*/
export function arrangeSponsorships(sponsorships) {
	sponsorships = sponsorships.empty ? [] : sponsorships;
	if (sponsorships.length < 3) {
		let max = 3 - sponsorships.length;
		for (let i = 0; i < max; i++) {
			sponsorships.push({});
		}
	}
	return sponsorships;
}
