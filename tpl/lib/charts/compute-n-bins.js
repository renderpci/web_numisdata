/**
 * Implements methods for computing the number of
 * bins based on the data values
 * 
 * Each method takes an array of data values as input
 * and outputs the number of bins
 * @class
 */
export function compute_n_bins() {}

/**
 * Compute number of bins with the square root rule
 * @param {number[]} values the datapoints
 * @returns {number} the number of bins 
 */
compute_n_bins.sqrt = function (values) {
	return Math.ceil(Math.sqrt(values.length))
}

/**
 * Compute number of bins with the Sturges rule
 * @param {number[]} values the datapoints
 * @returns {number} the number of bins 
 */
compute_n_bins.sturges = function (values) {
	return Math.ceil(Math.log2(values.length)) + 1
}

/**
 * Compute number of bins with the Rice rule
 * @param {number[]} values the datapoints
 * @returns {number} the number of bins 
 */
compute_n_bins.rice = function (values) {
	return Math.ceil(2*Math.pow(values.length, 1/3))
}

/**
 * Compute number of bins with Doane's formula
 * 
 * @param {number[]} values the datapoints
 * @returns {number} the number of bins 
 */
compute_n_bins.doane = function (values) {
	const n = values.length
	if (n < 2) {
		throw new Error("Doane's rule needs at least 2 datapoints")
	}
	const sigma = Math.sqrt(6*(n-2)/((n+1)*(n+3)))
	const std = d3.deviation(values)
	const mean = d3.mean(values)
	const sum = d3.sum(values)
	// The adjusted Fisher-Pearson skewness coefficient
	// https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/skewness.htm
	const skew = (Math.sqrt(n*(n+1))/(n-2))*((sum-n*mean)/(n*Math.pow(std, 3)))
	return 1 + Math.ceil(Math.log2(n)) + Math.ceil(Math.log2(1+Math.abs(skew)/sigma))
}

/**
 * Compute number of bins with Scott's normal
 * reference rule
 * @param {number[]} values the datapoints
 * @returns {number} the number of bins 
 */
compute_n_bins.scott = function (values) {
	if (values.length < 2) {
		throw new Error(
			"Cannot compute standard deviation of an array with less than 2 values"
		)
	}
	return Math.ceil(
		(d3.max(values)-d3.min(values))*Math.pow(values.length, 1/3)/(3.49*d3.deviation(values))
	)
}

/**
 * Compute number of bins with Freedman-Diaconis' choice
 * @param {number[]} values the datapoints
 * @returns {number} the number of bins 
 */
compute_n_bins.freedman_diaconis = function (values) {
	const quartile3 = d3.quantile(values, 0.75)
	const quartile1 = d3.quantile(values, 0.25)
	const iqr =  quartile3 - quartile1
	if (quartile1 === quartile3) {
		throw new Error("IQR is 0!")
	}
	return Math.ceil(
		(d3.max(values)-d3.min(values))*Math.pow(values.length, 1/3)/(2*iqr)
	)
}
