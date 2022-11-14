var analysis_min = (function (exports) {
    'use strict';

    /**
     * Default name for the chart -> when exporting,
     * `<name>.<format>`
     * @type {string}
     */
    const DEFAULT_CHART_NAME = 'chart';

    /**
     * Color palette, totally stolen from matplotlib
     * @type {string[]}
     */
    const COLOR_PALETTE = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];


    /**
     * Chart wrapper class
     * 
     * It clears the container div during render, so subclasses should work with the dom
     * after the render method of this superclass has been called
     * @class
     * @abstract
     * @param {Element} div_wrapper 
     */
    function chart_wrapper(div_wrapper) {
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
        this.id = chart_wrapper._n_charts_created;
        /**
         * Div element wrapping the chart itself and
         * the controls
         * @type {Element}
         * @protected
         */
        this.div_wrapper = div_wrapper;
        /**
         * Div container for chart download
         * @type {Element}
         * @protected
         */
        this.download_chart_container = undefined;
        /**
         * Div container for user controls
         * Used freely by each subclass
         * @type {Element}
         * @protected
         */
        this.controls_container = undefined;
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
    };

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
        const self = this;
        // Remove all children in the div_wrapper
        this.div_wrapper.replaceChildren();
        // Set controls container to undefined
        this.controls_container = undefined;
        // Create the chart download section
        this.download_chart_container = common.create_dom_element({
            element_type: 'div',
            id: 'download_chart_container',
            class_name: 'o-purple',
            style: {
                'display': 'flex',
                'flex-direction': 'row',
                'justify-content': 'center',
            },
            parent: this.div_wrapper,
        });
        const format_select = common.create_dom_element({
            element_type: 'select',
            id: 'chart_export_format',
            style: {
                'width': '80%',
            },
            parent: this.download_chart_container,
            // TODO: add ARIA attributes?
        });
        for (const format of this.get_supported_export_formats()) {
            common.create_dom_element({
                element_type: 'option',
                value: format,
                text_content: format.toUpperCase(),
                parent: format_select,
            });
        }
        const chart_download_button = common.create_dom_element({
            element_type: 'button',
            text_content: 'Download',
            style: {
                'width': '20%',
            },
            parent: this.download_chart_container,
        });
        chart_download_button.addEventListener('click', () => {
            self.download_chart(format_select.value);
        });
    };

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
        const filename = `${DEFAULT_CHART_NAME}.${format}`;
        /**
         * Function name for downloading with the particular format
         * @type {string}
         */
        const download_func_name = `download_chart_as_${format}`;
        if (this[download_func_name] === undefined) {
            throw new Error(`${download_func_name} is not implemented!`)
        }
        this[download_func_name](filename);
    };

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
    };

    /**
     * D3 chart wrapper class
     * 
     * Appends an `svg` tag to the provided div, so that it spans all width
     * 
     * Subclasses MUST specify the viewBox of the svg, so that it responds to window resizing
     * @param {Element} div_wrapper the div containing the chart
     * @class
     * @abstract
     * @extends chart_wrapper
     */
    function d3_chart_wrapper(div_wrapper) {
        if (this.constructor === d3_chart_wrapper) {
            throw new Error("Abstract class 'd3_chart_wrapper' cannot be instantiated")
        }
        chart_wrapper.call(this, div_wrapper);
        /**
         * D3 selection object for the root `svg` tag
         * @protected
         */
        this.svg = undefined;

    }
    // Set prototype chain
    Object.setPrototypeOf(d3_chart_wrapper.prototype, chart_wrapper.prototype);

    /**
     * Render the chart (d3) and controls
     * 
     * Subclasses must call this method at the top
     * of their own implementation
     * @name d3_chart_wrapper#render
     * @function
     */
    d3_chart_wrapper.prototype.render = function () {
        chart_wrapper.prototype.render.call(this);

        this.svg = d3.select(this.div_wrapper)
            .append('svg')
            .attr('version', '1.1') // When drawing SVG to canvas with an `Image`, if we don't add version and xmlns the `Image` will never load :(
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('width', '100%');
    };

    /**
     * Get the supported chart export formats
     * @function
     * @returns {string[]} the supported formats
     * @name d3_chart_wrapper#get_supported_export_formats
     */
    d3_chart_wrapper.prototype.get_supported_export_formats = function () {
        return ['svg']
    };

    /**
     * Download the chart as svg
     * @param {string} filename the name of the file
     * @function
     * @name d3_chart_wrapper#_download_chart_as_svg
     */
    d3_chart_wrapper.prototype.download_chart_as_svg = function (filename) {
        const svg_data = this.svg.node().outerHTML;
        const svg_blob = new Blob([svg_data], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svg_blob);
        /**
         * Temporary link
         * @type {Element}
         */
        const tmpLink = common.create_dom_element({
            element_type: 'a',
            href: url,
        });
        tmpLink.setAttribute('download', filename);
        tmpLink.click();
        tmpLink.remove();
        URL.revokeObjectURL(url);
    };

    /**
     * Toggle visibility of a d3 selection element
     * @param {d3.selection} element the elememt
     */
    function toggle_visibility(element) {
        if (element.attr('opacity') == 0) {
            element.transition().attr('opacity', 1);
        } else {
            element.transition().attr('opacity', 0);
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
    function linspace(start, stop, nsteps){
        const delta = (stop-start)/(nsteps-1);
        return d3.range(nsteps).map((i) => start+i*delta)
    }

    /**
     * Boxplot + violin chart wrapper
     * 
     * Inspired in http://bl.ocks.org/asielen/d15a4f16fa618273e10f
     * 
     * @param {Element}  div_wrapper the div to work in
     * @param {{[group_name: string]: number[]}} data the input data: group name
     *        and array of values
     * @param {string} ylabel the y label
     * @class
     * @extends d3_chart_wrapper
     */
    function boxvio_chart_wrapper(div_wrapper, data, ylabel) {
        d3_chart_wrapper.call(this, div_wrapper);
        /**
         * Data: group name to array of values
         * @type {Object.<string, number[]>}
         * @private
         */
        this._data = data;
        /**
         * The label for the y axis
         * @type {string}
         * @private
         */
        this._ylabel = ylabel;
        /**
         * Boxplot metrics for each group name
         * @type {{[group_name: string]: {
         *  max: number,
         *  upper_fence: number,
         *  quartile3: number,
         *  median: number,
         *  mean: number,
         *  iqr: number,
         *  quartile1: number,
         *  lower_fence: number,
         *  min: number,
         * }}}
         * @private
         */
        this._metrics = {};
        for (const [name, values] of Object.entries(data)) {
            this._metrics[name] = calc_metrics(values);
        }
        /**
         * Outliers per group name
         * @type {{[group_name: string]: number[]}}
         * @private
         */
        this._outliers = {};
        for (const [name, values] of Object.entries(this._data)) {
            this._outliers[name] = values.filter(
                (v) => v < this._metrics[name].lower_fence || v > this._metrics[name].upper_fence
            );
        }
        /**
         * Maximum and minimum of the input data
         * @type {[number, number]}
         */
        this._data_extent = d3.extent(Object.values(this._data).flat());
        /**
         * Full width of svg
         * @type {number}
         */
        this._full_width = 960;
        /**
         * Full height of svg
         * @type {number}
         */
        this._full_height = 420;
        /**
         * Non-graphic components of the chart: setting, scales, etc.
         * @private
         */
        this._chart = {};
        this._chart.margin = { top: 15, right: 3, bottom: 23, left: 50 };
        this._chart.width = this._full_width - this._chart.margin.left - this._chart.margin.right;
        this._chart.height = this._full_height - this._chart.margin.top - this._chart.margin.bottom;
        this._chart.yscale = d3.scaleLinear()
            .range([this._chart.height, 0])
            .domain(this._data_extent)
            .clamp(true);  // when input outside of domain, its output is clamped to range
        this._chart.yaxis = d3.axisLeft(this._chart.yscale);
        this._chart.violin_scale_default = 0.8;
        this._chart.violin_scale = this._chart.violin_scale_default;
        this._chart.box_scale_default = 0.3;
        this._chart.box_scale = this._chart.box_scale_default;
        this._chart.xscale = d3.scaleBand()
            .domain(Object.keys(this._data))
            .range([0, this._chart.width]);
            // .padding(1-this._chart.violin_scale)     // This is important: it is the space between 2 groups. 0 means no padding. 1 is the maximum.
        this._chart.xaxis = d3.axisBottom(this._chart.xscale);
        this._chart.n_bins_default = 15;
        this._chart.n_bins = this._chart.n_bins_default;
        this._chart.max_bins_multiplier = 3;
        this._chart.histogram = d3.bin()
            .domain(this._chart.yscale.domain())
            // TODO: compute number of bins automatically depending on the range of the data
            .thresholds(
                linspace(this._data_extent[0], this._data_extent[1], this._chart.n_bins+1)
            )
            .value((d) => d);
        this._chart.bins = Object.entries(this._data).map(
            ([name, values]) => {return {key: name, value: this._chart.histogram(values)}}
        );
        /**
         * Graphic components of the chart: d3 selection objects
         * @private
         * @type {{[name: string]: d3.selection}}
         */
        this._graphics = {
            root_g: null,
            violins_g: null,
            boxes_g: null,
            outliers: {},
        };
    }
    // Set prototype chain
    Object.setPrototypeOf(boxvio_chart_wrapper.prototype, d3_chart_wrapper.prototype);

    /**
     * Set a new number of bins for the violin plot
     * @function
     * @param {number} n_bins the number of bins
     * @name boxvio_chart_wrapper#set_n_bins
     */
    boxvio_chart_wrapper.prototype.set_n_bins = function (n_bins) {
        this._chart.n_bins = n_bins;
        this._chart.histogram.thresholds(
            linspace(this._data_extent[0], this._data_extent[1], n_bins+1)
        );
        this._chart.bins = Object.entries(this._data).map(
            ([name, values]) => {return {key: name, value: this._chart.histogram(values)}}
        );
        // Remove the violin graphics, only leaving its root g tag (violins_g)
        this._graphics.violins_g.selectAll('*').remove();
        this._render_violins(true);
    };

    /**
     * Set the scale for the violins
     * @function
     * @param {number} scale the scale [0, 1]
     * @name boxvio_chart_wrapper#set_violin_scale
     */
    boxvio_chart_wrapper.prototype.set_violin_scale = function (scale) {
        this._chart.violin_scale = scale;
        // Remove the violin graphics, only leaving its root g tag (violins_g)
        this._graphics.violins_g.selectAll('*').remove();
        this._render_violins(true);
    };

    /**
     * Set the scale for the boxes
     * @function
     * @param {number} scale the scale [0, 1]
     * @name boxvio_chart_wrapper#set_box_scale
     */
     boxvio_chart_wrapper.prototype.set_box_scale = function (scale) {
        this._chart.box_scale = scale;
        // Remove the box graphics, only leaving its root g tag (boxes_g)
        this._graphics.boxes_g.selectAll('*').remove();
        this._render_boxes(true);
    };

    /**
     * Render the chart and the control panel
     * @function
     * @name boxvio_chart_wrapper#render
     */
    boxvio_chart_wrapper.prototype.render = function () {
        // Call super render method
        d3_chart_wrapper.prototype.render.call(this);
        // Render chart
        this._render_chart();
        // Render control panel
        this._render_control_panel();
    };

    /**
     * Render the chart
     * @function
     * @private
     * @name boxvio_chart_wrapper#_render_chart
     */
    boxvio_chart_wrapper.prototype._render_chart = function () {

        // Set viewBox of svg
        this.svg.attr('viewBox', `0 0 ${this._full_width} ${this._full_height}`);

        // Root g tag
        this._graphics.root_g = this.svg.append('g')
            .attr('transform', `translate(${this._chart.margin.left},${this._chart.margin.top})`);

        this._render_axis();
        this._render_violins();
        this._render_boxes();

    };

    /**
     * Render the axis
     * @function
     * @private
     * @name boxvio_chart_wrapper#_render_axis
     */
    boxvio_chart_wrapper.prototype._render_axis = function () {
        const g = this._graphics.root_g;
        // Render x axis
        g.append('g')
            .attr('transform', `translate(0,${this._chart.height})`)
            .call(this._chart.xaxis);
        // Render y axis
        g.append('g')
            .call(this._chart.yaxis);

        // Render Y axis label
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('y', -this._chart.margin.left + 20)
            .attr('x', -this._chart.height / 2)
            .text(this._ylabel);
    };

    /**
     * Render the violins
     * @function
     * @private
     * @param {boolean} is_g_ready whether the g tag for violins is
     *        set up (default: `false`)
     * @name boxvio_chart_wrapper#_render_violins
     */
    boxvio_chart_wrapper.prototype._render_violins = function (is_g_ready=false) {

        const chart = this._chart;
        const g = this._graphics.root_g;

        // Get the largest count in a bin, as it will be the maximum width
        let max_count = 0;
        for (const group of chart.bins) {
            const longest = d3.max(group.value.map((v) => v.length));
            if (longest > max_count) {
                max_count = longest;
            }
        }

        // Make a scale linear to map bin counts to bandwidth
        const xNum = d3.scaleLinear()
            .range([0, chart.xscale.bandwidth()])
            .domain([-max_count, max_count]);

        // Render
        if (!is_g_ready) {
            this._graphics.violins_g = g.append('g');
        }
        this._graphics.violins_g
            .selectAll('violin')
            .data(chart.bins)
            .enter()  // Working per group now
            .append('g')
                .attr('transform', (d) => `translate(${chart.xscale(d.key)},0)`)
            .append('path')
                .datum((d) => d.value)  // Working per bin within a group
                .style('stroke', 'gray')
                .style('stroke-width', 0.4)
                .style('fill', 'ghostwhite')
                .attr('d', d3.area()
                    .x0((d) => xNum(-d.length*chart.violin_scale))
                    .x1((d) => xNum(d.length*chart.violin_scale))
                    .y((d) => chart.yscale(d.x0))
                    .curve(d3.curveCatmullRom)
            );

    };

    /**
     * Render the boxes (including whiskers and outliers)
     * @function
     * @private
     * @param {boolean} is_g_ready whether the g tag for boxes is
     *        set up (default: `false`)
     * @name boxvio_chart_wrapper#_render_boxes
     */
    boxvio_chart_wrapper.prototype._render_boxes = function (is_g_ready=false) {

        const chart = this._chart;
        const g = this._graphics.root_g;

        // Draw
        if (!is_g_ready) {
            this._graphics.boxes_g = g.append('g');
        }
        const boxes = this._graphics.boxes_g;
        const bandwidth = chart.xscale.bandwidth();
        const box_width = this._chart.box_scale * bandwidth;

        const whiskers_lw = 2;
        const median_lw = 3;

        // Iterate over the groups
        for (const [i, name] of Object.entries(Object.keys(this._data))) {

            const metrics = this._metrics[name];
            const color = COLOR_PALETTE[i % COLOR_PALETTE.length];  // loop around!

            const group_box = boxes.append('g')
                .attr('transform', `translate(${chart.xscale(name) + bandwidth / 2},0)`);

            // Draw outliers
            this._graphics.outliers[name] = group_box.append('g');
            const outliers = this._graphics.outliers[name];
            for (const outlier of this._outliers[name]) {
                outliers.append('circle')
                    .attr('cx', 0)
                    .attr('cy', chart.yscale(outlier))
                    .attr('r', 0.027*bandwidth)
                    .style('fill', color)
                    .style('opacity', 0.7);
            }

            // Draw whiskers
            const whiskers = group_box.append('g');
            whiskers.append('line')  // vertical line
                .attr('x1', 0)
                .attr('y1', chart.yscale(metrics.lower_fence))
                .attr('x2', 0)
                .attr('y2', chart.yscale(metrics.upper_fence))
                .attr('stroke', color)
                .attr('stroke-width', whiskers_lw);
            whiskers.append('line') // lower horizontal
                .attr('x1', -box_width / 2)
                .attr('y1', chart.yscale(metrics.lower_fence))
                .attr('x2', box_width / 2)
                .attr('y2', chart.yscale(metrics.lower_fence))
                .attr('stroke', color)
                .attr('stroke-width', whiskers_lw);
            whiskers.append('line') // upper horizontal
                .attr('x1', -box_width / 2)
                .attr('y1', chart.yscale(metrics.upper_fence))
                .attr('x2', box_width / 2)
                .attr('y2', chart.yscale(metrics.upper_fence))
                .attr('stroke', color)
                .attr('stroke-width', whiskers_lw);

            // Draw IQR box
            const iqr = group_box.append('g');
            iqr.append('rect')  // iqr rect
                .attr('x', -box_width / 2)
                .attr('y', chart.yscale(metrics.quartile3))
                .attr('width', box_width)
                .attr('height', chart.yscale(metrics.quartile1) - chart.yscale(metrics.quartile3))
                .attr('fill', color);
            iqr.append('line')  // median line
                .attr('x1', -box_width / 2)
                .attr('y1', chart.yscale(metrics.median))
                .attr('x2', box_width / 2)
                .attr('y2', chart.yscale(metrics.median))
                .attr('stroke', 'black')
                .attr('stroke-width', median_lw);
            iqr.append('circle')  // median dot
                .attr('cx', 0)
                .attr('cy', chart.yscale(metrics.median))
                .attr('r', 4.5)
                .style('fill', 'white')
                .attr('stroke', 'black')
                .attr('stroke-width', 2);
        }

    };



    /**
     * Render the control panel
     * @function
     * @private
     * @name boxvio_chart_wrapper#_render_control_panel
     */
    boxvio_chart_wrapper.prototype._render_control_panel = function () {

        // Create controls container
        const controls_container_id = `${this.id_string()}_controls`;
        this.controls_container = common.create_dom_element({
            element_type: 'div',
            id: controls_container_id,
            class_name: 'o-green',
            parent: this.div_wrapper,
        });

        /**
         * Slider for number of bins
         * @type {Element}
         */
        const n_bins_slider = common.create_dom_element({
            element_type: 'input',
            type: 'range',
            value: this._chart.n_bins_default,
            parent: this.controls_container,
        });
        n_bins_slider.setAttribute('min', 1);
        n_bins_slider.setAttribute('max', this._chart.max_bins_multiplier * this._chart.n_bins_default);
        n_bins_slider.addEventListener('input', () => {
            this.set_n_bins(Number(n_bins_slider.value));
        });
        /**
         * Reset button for the n_bins_slider
         * @type {Element}
         */
        const n_bins_slider_reset = common.create_dom_element({
            element_type: 'button',
            type: 'button',
            text_content: 'Reset',
            parent: this.controls_container,
        });
        n_bins_slider_reset.addEventListener('click', () => {
            n_bins_slider.value = this._chart.n_bins_default;
            this.set_n_bins(Number(n_bins_slider.value));
        });

        const show_violins_checkbox_id = `${this.id_string()}_show_violins_checkbox`;
        /**
         * Checkbox for showing violins
         * @type {Element}
         */
        const show_violins_checkbox = common.create_dom_element({
            element_type: 'input',
            type: 'checkbox',
            id: show_violins_checkbox_id,
            parent: this.controls_container,
        });
        show_violins_checkbox.checked = true;
        /**
         * Checkbox label for density plot
         * @type {Element}
         */
        const show_violins_label = common.create_dom_element({
            element_type: 'label',
            text_content: 'Show violins',
            parent: this.controls_container,
        });
        show_violins_label.setAttribute('for', show_violins_checkbox_id);
        show_violins_checkbox.addEventListener('change', () => {
            toggle_visibility(this._graphics.violins_g);
        });

        const show_boxes_checkbox_id = `${this.id_string()}_show_boxes_checkbox`;
        /**
         * Checkbox for showing boxes
         * @type {Element}
         */
         const show_boxes_checkbox = common.create_dom_element({
            element_type: 'input',
            type: 'checkbox',
            id: show_boxes_checkbox_id,
            parent: this.controls_container,
        });
        show_boxes_checkbox.checked = true;
        /**
         * Checkbox label for density plot
         * @type {Element}
         */
        const show_boxes_label = common.create_dom_element({
            element_type: 'label',
            text_content: 'Show boxes',
            parent: this.controls_container,
        });
        show_boxes_label.setAttribute('for', show_boxes_checkbox_id);
        show_boxes_checkbox.addEventListener('change', () => {
            toggle_visibility(this._graphics.boxes_g);
        });

        const show_outliers_checkbox_id = `${this.id_string()}_show_outliers_checkbox`;
        /**
         * Checkbox for showing outliers
         * @type {Element}
         */
        const show_outliers_checkbox = common.create_dom_element({
            element_type: 'input',
            type: 'checkbox',
            id: show_outliers_checkbox_id,
            parent: this.controls_container,
        });
        show_outliers_checkbox.checked = true;
        /**
         * Checkbox label for density plot
         * @type {Element}
         */
        const show_outliers_label = common.create_dom_element({
            element_type: 'label',
            text_content: 'Show outliers',
            parent: this.controls_container,
        });
        show_outliers_label.setAttribute('for', show_outliers_checkbox_id);
        show_outliers_checkbox.addEventListener('change', () => {
            for (const group of Object.values(this._graphics.outliers)) {
                toggle_visibility(group);
            }
        });

        /**
         * Slider for violin scale
         * @type {Element}
         */
        const violin_scale_slider = common.create_dom_element({
            element_type: 'input',
            type: 'range',
            // value: this._chart.violin_scale_default,  // This does not work here?
            parent: this.controls_container,
        });
        violin_scale_slider.setAttribute('min', 0);
        violin_scale_slider.setAttribute('max', 1);
        violin_scale_slider.setAttribute('step', 0.05);
        violin_scale_slider.value = this._chart.violin_scale_default;
        violin_scale_slider.addEventListener('input', () => {
            this.set_violin_scale(Number(violin_scale_slider.value));
        });
        /**
         * Reset button for the violin_scale_slider
         * @type {Element}
         */
        const violin_scale_slider_reset = common.create_dom_element({
            element_type: 'button',
            type: 'button',
            text_content: 'Reset',
            parent: this.controls_container,
        });
        violin_scale_slider_reset.addEventListener('click', () => {
            violin_scale_slider.value = this._chart.violin_scale_default;
            this.set_violin_scale(Number(violin_scale_slider.value));
        });

        /**
         * Slider for box scale
         * @type {Element}
         */
         const box_scale_slider = common.create_dom_element({
            element_type: 'input',
            type: 'range',
            // value: this._chart.box_scale_default,  // This does not work here?
            parent: this.controls_container,
        });
        box_scale_slider.setAttribute('min', 0);
        box_scale_slider.setAttribute('max', 1);
        box_scale_slider.setAttribute('step', 0.05);
        box_scale_slider.value = this._chart.box_scale_default;
        box_scale_slider.addEventListener('input', () => {
            this.set_box_scale(Number(box_scale_slider.value));
        });
        /**
         * Reset button for the box_scale_slider
         * @type {Element}
         */
        const box_scale_slider_reset = common.create_dom_element({
            element_type: 'button',
            type: 'button',
            text_content: 'Reset',
            parent: this.controls_container,
        });
        box_scale_slider_reset.addEventListener('click', () => {
            box_scale_slider.value = this._chart.box_scale_default;
            this.set_box_scale(Number(box_scale_slider.value));
        });

    };

    // HELPER FUNCTIONS

    /**
     * Compute (boxplot) metrics for the data
     * @param {number[]} values the data values
     * @returns {{
     *  max: number,
     *  upper_fence: number,
     *  quartile3: number,
     *  median: number,
     *  mean: number,
     *  iqr: number,
     *  quartile1: number,
     *  lower_fence: number,
     *  min: number,
     * }}
     */
    function calc_metrics(values) {
        const metrics = {
            max: null,
            upper_fence: null,
            quartile3: null,
            median: null,
            mean: null,
            iqr: null,
            quartile1: null,
            lower_fence: null,
            min: null,
        };

        metrics.min = d3.min(values);
        metrics.quartile1 = d3.quantile(values, 0.25);
        metrics.median = d3.median(values);
        metrics.mean = d3.mean(values);
        metrics.quartile3 = d3.quantile(values, 0.75);
        metrics.max = d3.max(values);
        metrics.iqr = metrics.quartile3 - metrics.quartile1;
        metrics.lower_fence = metrics.quartile1 - 1.5 * metrics.iqr;
        metrics.upper_fence = metrics.quartile3 + 1.5 * metrics.iqr;

        return metrics
    }

    /*global tstring, page_globals, Promise, data_manager, common */


    const analysis =  {

    	// Form factory instance
    	form: null,

    	area_name				: null,
    	row						: null,

    	// DOM containers
    	export_data_container		: null,
    	form_items_container		: null,
    	diameter_chart_container	: null,
    	weight_chart_container		: null,

    	/**
    	 * Chart wrapper instance for diameter
    	 * @type {chart_wrapper}
    	 */
    	diameter_chart_wrapper: null,
    	/**
    	 * Chart wrapper instance for weight
    	 * @type {chart_wrapper}
    	 */
    	weight_chart_wrapper: null,


    	set_up : function(options) {

    		const self = this;

    		// options
    			self.area_name					= options.area_name;
    			self.export_data_container		= options.export_data_container;
    			self.row						= options.row;
    			self.form_items_container		= options.form_items_container;
    			self.diameter_chart_container	= options.diameter_chart_container;
    			self.weight_chart_container		= options.weight_chart_container;

    		// form
    		const form_node = self.render_form();
    		self.form_items_container.appendChild(form_node);

    		return true
    	},//end set_up

    	/**
    	 * RENDER FORM
    	 */
    	render_form : function() {

    		const self = this;

    		// DocumentFragment is like a virtual DOM
    		const fragment = new DocumentFragment();

    		// form_factory instance
    			self.form = self.form || new form_factory();

    		const form_row = common.create_dom_element({
    			element_type	: "div",
    			class_name		: "form-row fields",
    			parent			: fragment
    		});

    		// mint
    			self.form.item_factory({
    				id				: "mint",
    				name			: "mint",
    				label			: tstring.mint || "mint",
    				q_column		: "p_mint",
    				value_wrapper	: ['["', '"]'], // to obtain ["value"] in selected value only
    				eq				: "LIKE",
    				eq_in			: "%",
    				eq_out			: "%",
    				is_term			: true,
    				parent			: form_row,
    				callback		: function(form_item) {
    					self.form.activate_autocomplete({
    						form_item	: form_item,
    						table		: 'catalog'
    					});
    				}
    			});
    		
    		// number
    			self.form.item_factory({
    				id 			: "number",
    				name 		: "number",
    				q_column 	: "term",
    				q_table 	: "types",
    				label		: tstring.number_key || "Number & Key",
    				is_term 	: false,
    				parent		: form_row,
    				group_op 	: '$or',
    				callback	: function(form_item) {
    					self.form.activate_autocomplete({
    						form_item	: form_item,
    						table		: 'catalog'
    					});
    				}
    			});
    		
    		// denomination
    			self.form.item_factory({
    				id 			: "denomination",
    				name 		: "denomination",
    				q_column 	: "ref_type_denomination",
    				q_table 	: "any",
    				label		: tstring.denomination || "denomination",
    				is_term 	: false,
    				parent		: form_row,
    				callback	: function(form_item) {
    					self.form.activate_autocomplete({
    						form_item	: form_item,
    						table		: 'catalog'
    					});
    				}
    			});

    		// submit button
    			const submit_group = common.create_dom_element({
    				element_type	: "div",
    				class_name		: "form-group field button_submit",
    				parent			: fragment
    			});
    			const submit_button = common.create_dom_element({
    				element_type	: "input",
    				type			: "submit",
    				id				: "submit",
    				value			: tstring.search || "Search",
    				class_name		: "btn btn-light btn-block primary",
    				parent			: submit_group
    			});
    			submit_button.addEventListener("click", function (e) {
    				e.preventDefault();
    				self.form_submit(form);
    			});

    		// reset button
    			const reset_button = common.create_dom_element({
    				element_type	: "input",
    				type			: "button",
    				id				: "button_reset",
    				value			: tstring.reset || 'Reset',
    				class_name		: "btn btn-light btn-block secondary button_reset",
    				parent			: submit_group
    			});
    			reset_button.addEventListener("click", function (e) {
    				e.preventDefault();
    				window.location.replace(window.location.pathname);
    			});

    		// operators
    			// fragment.appendChild( forms.build_operators_node() )
    			const operators_node = self.form.build_operators_node();
    			fragment.appendChild( operators_node );

    		// the form element itself!
    			const form = common.create_dom_element({
    				element_type	: "form",
    				id				: "search_form",
    				class_name		: "form-inline"
    			});
    			form.appendChild(fragment);


    		return form
    	},//end render_form

    	/**
    	 * FORM SUBMIT
    	 * Form submit launch search
    	 */
    	form_submit : function(form_obj, options={}) {
    		
    		const self = this;

    		// options
    			const scroll_result	= typeof options.scroll_result==="boolean" ? options.scroll_result : true;
    			const form_items	= options.form_items || self.form.form_items;

    		// build filter
    			const filter = self.form.build_filter({
    				form_items: form_items
    			});
    		
    		// empty filter case
    			if (!filter || filter.length<1) {
    				return false
    			}

    		// scroll to head result
    			if (scroll_result) {
    				this.diameter_chart_container.scrollIntoView(
    					{behavior: "smooth", block: "start", inline: "nearest"}
    				);
    			}

    		// search rows exec against API
    			self.search_rows({
    				filter			: filter,
    				limit			: 0,
    				process_result	: {
    					fn		: 'process_result::add_parents_and_children_recursive',
    					columns	: [{name : "parents"}]
    				}
    			})
    			.then((parsed_data)=>{

    				event_manager.publish('form_submit', parsed_data);

    				console.log(parsed_data);

    				// const diameters = parsed_data
    				// 	.map((ele) => ele.full_coins_reference_diameter_max)
    				// 	.flat()
    				// 	.filter((v) => v)
    				// console.log(diameters)

    				// this.chart_wrapper = new histogram_wrapper(
    				// 	this.chart_wrapper_container,
    				// 	diameters,
    				// 	'Diameter'
    				// )
    				// this.chart_wrapper.render()

    				const data = {};
    				for (const ele of parsed_data) {
    					const name = ele.term.split(' ')[0].slice(0, -1);
    					if (!['12', '59', '62', '18','11a','14'].includes(name)) continue
    					// if (!['59', '62'].includes(name)) continue
    					const tmpData = {};
    					const calculable = ele.full_coins_reference_calculable;
    					const diameter_max = ele.full_coins_reference_diameter_max;
    					const diameter_min = ele.full_coins_reference_diameter_min;
    					const weight = ele.full_coins_reference_weight;
    					if (diameter_max && diameter_max.length) {
    						tmpData.diameter_max = diameter_max.filter((v, i) => v && calculable[i]);
    					}
    					if (diameter_min && diameter_min.length) {
    						tmpData.diameter_min = diameter_min.filter((v, i) => v && calculable[i]);
    					}
    					if (weight && weight.length) {
    						tmpData.weight = weight.filter((v, i) => v && calculable[i]);
    					}
    					if (Object.keys(tmpData).length) {
    						data[name] = tmpData;
    					}
    				}
    				console.log(data);

    				// Diameters
    				const diameters = {};
    				for (const [name, props] of Object.entries(data)) {
    					diameters[name] = props.diameter_max;
    				}
    				this.diameter_chart_wrapper = new boxvio_chart_wrapper(
    					this.diameter_chart_container,
    					diameters,
    					'Diameter'
    				);
    				this.diameter_chart_wrapper.render();

    				// Diameters
    				const weights = {};
    				for (const [name, props] of Object.entries(data)) {
    					weights[name] = props.weight;
    				}
    				this.weight_chart_wrapper = new boxvio_chart_wrapper(
    					this.weight_chart_container,
    					weights,
    					'Weight'
    				);
    				this.weight_chart_wrapper.render();

    			});

    	},

    	/**
    	 * SEARCH_ROWS
    	 * Call to API and load json data results of search
    	 */
    	search_rows : function(options) {

    		const self = this;

    		// sort vars
    			const filter			= options.filter || null;
    			const ar_fields			= options.ar_fields || ["*"];
    			const order				= options.order || "norder ASC";
    			const lang				= page_globals.WEB_CURRENT_LANG_CODE;
    			const process_result	= options.process_result || null;
    			const limit				= options.limit != undefined
    										? options.limit
    										: 30;
    		
    		return new Promise(function(resolve){
    			// parse_sql_filter
    				const group = [];
    			// parsed filters
    				const sql_filter = self.form.parse_sql_filter(filter);
    			// request
    				const request_body = {
    					dedalo_get		: 'records',
    					table			: 'catalog',
    					ar_fields		: ar_fields,
    					lang			: lang,
    					sql_filter		: sql_filter,
    					limit			: limit,
    					group			: (group.length>0) ? group.join(",") : null,
    					count			: false,
    					order			: order,
    					process_result	: process_result
    				};
    				data_manager.request({
    					body : request_body
    				})
    				.then((response)=>{
    					// data parsed
    					const data = page.parse_catalog_data(response.result);

    					resolve(data);
    				});
    		})

    	},

    };//end analysis

    exports.analysis = analysis;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
