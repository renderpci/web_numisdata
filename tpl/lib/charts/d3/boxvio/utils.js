"use strict";

/**
 * Compute (boxplot) metrics for the data
 * @param {number[]} values the data values
 * @param {[number, number]} whiskers_quantiles if specified, the whiskers will be at those
 * 		quantiles. If not specified, they will be located at Q1 - 1.5 * IQR and Q3 + 1.5 * IQR
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
export function calc_boxplot_metrics(values, whiskers_quantiles=null) {
	const metrics = {
		max: 			null,
		upper_fence:	null,
		quartile3: 		null,
		median: 		null,
		mean: 			null,
		iqr: 			null,
		quartile1: 		null,
		lower_fence: 	null,
		min: 			null,
	}

	metrics.min = d3.min(values)
	metrics.quartile1 = d3.quantile(values, 0.25)
	metrics.median = d3.median(values)
	metrics.mean = d3.mean(values)
	metrics.quartile3 = d3.quantile(values, 0.75)
	metrics.max = d3.max(values)
	metrics.iqr = metrics.quartile3 - metrics.quartile1
	metrics.lower_fence = whiskers_quantiles
		? d3.quantile(values, whiskers_quantiles[0]/100)
		: metrics.quartile1 - 1.5 * metrics.iqr
	metrics.upper_fence = whiskers_quantiles
		? d3.quantile(values, whiskers_quantiles[1]/100)
		: metrics.quartile3 + 1.5 * metrics.iqr

	return metrics
}