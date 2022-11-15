/**
 * Get a deep copy of an object
 * @param {Object} obj the object
 * @returns a deep copy of the object
 */
export function deepcopy(obj) {
	return JSON.parse(JSON.stringify(obj))
}