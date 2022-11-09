"use strict";

/**
 * Width (in pixels) of color picker
 * @type {number}
 */
export const COLOR_PICKER_WIDTH = 200

/**
 * Default name for the chart -> when exporting,
 * `<name>.<format>`
 * @type {string}
 */
const DEFAULT_CHART_NAME = 'chart'

/**
 * Default color for chart bars in rgba
 * @type {string}
 */
export const DEFAULT_BAR_COLOR = 'rgba(255,190,92,0.5)'


/**
 * Chart wrapper class
 * @class
 * @abstract
 * @param {Element} div_wrapper 
 */
export function chart_wrapper(div_wrapper) {
    if (this.constructor === chart_wrapper) {
        throw new Error("Abstract class 'chart_wrapper' cannot be instantiated")
    }
    /**
     * Div element wrapping the chart itself and
     * the controls
     * @type {Element}
     * @protected
     */
    this.div_wrapper = div_wrapper
    /**
     * Div container for chart download
     * @type {Element}
     * @protected
     */
    this.download_chart_container = undefined
    /**
     * Div container for user controls
     * Used freely by each subclass
     * @type {Element}
     * @protected
     */
    this.controls_container = undefined
}

/**
 * Render the chart and controls
 * 
 * Empties the div wrapper and resets properties
 * 
 * Subclasses must call this method at the top
 * of their own implementation
 * @name chart_wrapper#render
 * @function
 */
chart_wrapper.prototype.render = function () {
    // Save this chart_wrapper intance
    /**
     * This chart_wrapper intance
     * @type {chart_wrapper}
     */
    const self = this
    // Remove all children in the div_wrapper
    this.div_wrapper.replaceChildren()
    // Set controls container to undefined
    this.controls_container = undefined
    // Create the chart download section
    this.download_chart_container = common.create_dom_element({
        element_type: 'div',
        id: 'download_chart_container',
        class_name: 'o-purple',
        parent: this.div_wrapper,
    })
    const format_select = common.create_dom_element({
        element_type: 'select',
        id: 'chart_export_format',
        parent: this.download_chart_container,
        // TODO: add ARIA attributes?
    })
    for (const format of this.get_supported_export_formats()) {
        common.create_dom_element({
            element_type: 'option',
            value: format,
            text_content: format.toUpperCase(),
            parent: format_select,
        })
    }
    const chart_download_button = common.create_dom_element({
        element_type: 'button',
        text_content: 'Download',
        parent: this.download_chart_container,
    })
    chart_download_button.addEventListener('click', () => {
        self.download_chart(format_select.value)
    })
}

/**
 * Download the chart as an image
 * 
 * For each supported format in the subclass,
 * @see chart_wrapper#get_supported_export_formats
 * the subclass must implement a method called
 * `download_chart_as_<format>`
 * @param {string} format the image format
 * @function
 * @abstract
 * @name chart_wrapper#download_chart
 */
chart_wrapper.prototype.download_chart = function (format) {
    /**
     * File name for the chart
     * @type {string}
     */
    const filename = `${DEFAULT_CHART_NAME}.${format}`
    /**
     * Function name for downloading with the particular format
     * @type {string}
     */
    const download_func_name = `download_chart_as_${format}`
    if (this[download_func_name] === undefined) {
        throw new Error(`${download_func_name} is not implemented!`)
    }
    this[download_func_name](filename)
}

/**
 * Get the supported chart export formats
 * 
 * Subclasses must return their own supported formats, e.g.,
 * `['png', 'jpg', 'eps']`
 * @function
 * @returns {string[]} the supported formats
 * @abstract
 * @name chart_wrapper#get_supported_export_formats
 */
chart_wrapper.prototype.get_supported_export_formats = function () {
    throw new Error(`Abstract method 'chart_wrapper.download_chart' cannot be called`)
}