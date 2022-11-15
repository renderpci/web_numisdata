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
 * Color palette, totally stolen from matplotlib
 * @type {string[]}
 */
export const COLOR_PALETTE = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']


/**
 * Chart wrapper class
 * 
 * The `render` method must be called for the chart to be rendered to the DOM!!!
 * 
 * Within the provided div wrapper, it will create three divs:
 * 1. If download is supported, a div to containing the download section, with
 *    id `chart<id>_download_chart_container` class `download_chart_container`
 * 2. A div to contain the plot itself, with id `chart<id>_plot_wrapper` class `plot_wrapper` 
 * 3. A div to contain the control panel, with id `chart<id>_control_panel` and class `control_panel`
 * 
 * It clears the container div during render, so subclasses should work with the dom
 * after the render method of this superclass has been called
 * @class
 * @abstract
 * @param {Element} div_wrapper 
 */
export function chart_wrapper(div_wrapper) {
    if (this.constructor === chart_wrapper) {
        throw new Error("Abstract class 'chart_wrapper' cannot be instantiated")
    }
    chart_wrapper._n_charts_created++;
    /**
     * Unique identifier for the chart.
     * 
     * Subclasses MUST use this in order to assing IDs
     * to DOM elements, in order to avoid bugs and cross-chart events
     * @type {number}
     */
    this.id = chart_wrapper._n_charts_created
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
     * Div inside the div_wrapper, that just wraps the drawing
     * @type {Element}
     * @protected
     */
    this.plot_container = undefined
    /**
     * Div container for user controls
     * Used freely by each subclass
     * @type {Element}
     * @protected
     */
    this.controls_container = undefined
}

/**
 * Amount of created charts
 * @type {number}
 * @static
 * @private
 */
chart_wrapper._n_charts_created = 0;

/**
 * Get a string representing the ID of the chart
 * @returns {string} the id as a string
 *          (`'chart1'`, `'chart2'`, ...)
 */
chart_wrapper.prototype.id_string = function () {
    return `chart${this.id}`
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
    const supported_formats = this.get_supported_export_formats()
    if (supported_formats.length) {
        this.download_chart_container = common.create_dom_element({
            element_type: 'div',
            id: `${this.id_string()}_download_chart_container`,
            class_name: 'o-purple download_chart_container',
            style: {
                'display': 'flex',
                'flex-direction': 'row',
                'justify-content': 'center',
            },
            parent: this.div_wrapper,
        })
        const format_select = common.create_dom_element({
            element_type: 'select',
            id: `${this.id_string()}_chart_export_format`,
            style: {
                'width': '80%',
            },
            parent: this.download_chart_container,
            // TODO: add ARIA attributes?
        })
        for (const format of supported_formats) {
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
            style: {
                'width': '20%',
            },
            parent: this.download_chart_container,
        })
        chart_download_button.addEventListener('click', () => {
            self.download_chart(format_select.value)
        })
    }

    // Create the div for wrapping the plot
    this.plot_container = common.create_dom_element({
        element_type: 'div',
        id: `${this.id_string()}_plot_wrapper`,
        class_name: 'o-purple plot_wrapper',
        parent: this.div_wrapper,
    })

    // Create the div for the control panel
    this.controls_container = common.create_dom_element({
        element_type: 'div',
        id: `${this.id_string()}_control_panel`,
        class_name: 'o-green control_panel',
        parent: this.div_wrapper,
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
 * Subclasses must return their own supported formats, if any, e.g.,
 * `['png', 'jpg', 'eps']`. If no format is supported, there is no
 * need to override this method.
 * @function
 * @returns {string[]} the supported formats
 * @name chart_wrapper#get_supported_export_formats
 */
chart_wrapper.prototype.get_supported_export_formats = function () {
    return []
}