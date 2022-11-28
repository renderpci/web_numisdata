/**
 * Get a deep copy of an object
 * @param {Object} obj the object
 * @returns a deep copy of the object
 */
export function deepcopy(obj) {
	return JSON.parse(JSON.stringify(obj))
}

/**
 * Insert a dom element after another
 * @param {Eleemnt} new_node the new node 
 * @param {Element} existing_node the one to add after of
 */
export function insert_after(new_node, existing_node) {
	existing_node.parentNode.insertBefore(new_node, existing_node.nextSibling);
}

/**
 * Check if arrays are equal
 * @param {any[][]} arrs the arrays to compare
 * @return {boolean} `true` if they are equal,
 * 		   `false` otherwise
 */
export function array_equal(...arrs) {
	if (!arrs.length) {
		throw new Error("There are no input arrays")
	}
	const size = arrs[0].length
	for (const arr of arrs.slice(1)) {
		if (arr.length !== size) {
			return false
		}
	}
	for (let i = 0; i < size; i++) {
		const value = arrs[0][i]
		for (const arr of arrs.slice(1)) {
			if (arr[i] !== value) {
				return false
			}
		}
	}
	return true
}