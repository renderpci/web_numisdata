"use strict";

import { array_equal } from "./utils";


/**
 * Wrapper around keyed data. That is, data which has a key. Several
 * datum are allowed to have the same key.
 * The data can have other keys as well.
 * 
 * Key components (strings) have a rank. Rank 1 is the rightmost one,
 * Rank 2 is the one on the left of Rank 1, and so on...
 * 
 * This class provides utilities to work with keys, querying data and
 * such
 * 
 * @param {{key: string[]}[]} data the data
 * @class
 */
export function keyed_data(data) {
	/**
	 * Internal data
	 * @type {{key: string[]}[]}
	 * @private
	 */
	this._data = data

	/**
	 * Amount of components of the key
	 * @type {number}
	 * @public
	 */
	this.key_size = data[0].key.length
}

/**
 * Get possible key values at a certain rank
 * @param {number} rank the rank
 * @returns {string[]} possible key values
 */
keyed_data.prototype.key_values = function (rank) {
	if (rank < 1 || rank > this.key_size) {
		throw new Error(`Rank ${rank} does not exist in a key of size ${this.key_size}`)
	}
	/** @type {number} */
	const index = this.key_size - rank
	return Array.from(new Set(this._data.map((datum) => datum.key[index])))
}

/**
 * Query the data given a key template
 * @param {string[]} key_tpl the key template. Parts will be matched,
 * 	`null` counts as wildcard
 * @returns {{key: string[]}[]} the filtered data
 */
keyed_data.prototype.query = function (key_tpl) {
	if (key_tpl.length !== this.key_size) {
		throw new Error("Key template is of different size than the plot keys")
	}
	return this._data.filter((ele) => {
		const key = ele.key
		for (let i = 0; i < key.length; i++) {
			if (key_tpl[i] && key_tpl[i] !== key[i]) {
				return false
			}
		}
		return true
	})
}

/**
 * Get key templates up to a rank
 * @param {number} rank the rank. If 1, all existing keys
 *        will be returned. If 2, all existing key templates with a wildcard in
 *        the last component will be returned. If 3, all existing key templates
 *        with a wildcard in the last and second-to-last component will
 *        be returned. Etc.
 * @returns {string[][]} the templates
 */
keyed_data.prototype.get_key_templates = function (rank) {
	if (rank < 1 || rank > this.key_size) {
		throw new Error(`Invalid rank ${rank} for key with size ${this.key_size}`)
	}
	// Convert to real index
	/** @type {number} */
	const i = this.key_size - rank
	const templates_wd = this._data.map((ele) => {
		return ele.key.slice(0,i+1).concat(Array(this.key_size-i-1).fill(null))
	})
	if (!templates_wd.length) return templates_wd
	// Remove duplicates
	const templates = [templates_wd[0]]
	let tmp_template = templates_wd[0]
	for (const template of templates_wd.slice(1)) {
		if (!array_equal(tmp_template, template)) {
			templates.push(template)
			tmp_template = template
		}
	}
	return templates
}

/**
 * Get the possible values of the next key component, given a partial key.
 * E.g., if there are 4 components, and you provide the two leftmost ones
 * in the partial key, possible values for the third leftmost one will be
 * given
 * @param {string[]} pkey partial key
 * @returns {string[]} possible values for the next key component
 */
keyed_data.prototype.get_next_key_component_values = function (pkey) {
	const psize = pkey.length
	if (psize >= this.key_size) {
		throw new Error(`Input key ${pkey} is as long or longer than the actual keys!`)
	}
	const key_tpl = pkey.concat(Array(this.key_size-psize).fill(null))
	/** @type {string[]} */
	return Array.from(
		new Set(
			this.query(key_tpl).map((ele) => ele.key[psize])
		)
	)
}
