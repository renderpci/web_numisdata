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