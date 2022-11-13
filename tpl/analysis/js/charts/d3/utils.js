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