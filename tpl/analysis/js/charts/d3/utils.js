/**
 * Toggle visibility of a d3 selection element
 * @param {d3.selection} element the elememt
 */
export function toggle_visibility(element) {
    if (element.attr('opacity') == 0) {
        element.transition().attr('opacity', 1)
    } else {
        element.transition().attr('opacity', 0)
    }
}

/**
 * Get an array of values, evenly spaced over an
 * interval
 * 
 * https://gist.github.com/davebiagioni/1ac21feb1c2db04be4e6
 * @param {number} start start value
 * @param {number} stop stop value
 * @param {number} nsteps amount of spets
 * @returns {number[]} the values
 */
export function linspace(start, stop, nsteps){
    const delta = (stop-start)/(nsteps-1)
    return d3.range(nsteps).map((i) => start+i*delta)
}