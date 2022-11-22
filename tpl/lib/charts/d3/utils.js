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
 * @param {number} nsteps amount of steps
 * @returns {number[]} the values
 */
export function linspace(start, stop, nsteps){
	const delta = (stop-start)/(nsteps-1)
	return d3.range(nsteps).map((i) => start+i*delta)
}

/**
 * Map from name to d3 curve
 * https://github.com/d3/d3/blob/main/API.md#curves
 * @type {Object.<string, d3.curve>}
 */
export const CURVES = {
	// cubic basis spline, repeating the end points
	'Basis': d3.curveBasis,
	// a closed cubic basis spline
	'Basis closed': d3.curveBasisClosed,
	// a cubic basis spline
	'Basis open': d3.curveBasisOpen,
	// a straightened cubic basis spline (works only with d3.line, not d3.area!)
	'Bundle': d3.curveBundle,
	// a cubic Bézier spline with horizontal tangents
	'Bump X': d3.curveBumpX,
	// a cubic Bézier spline with vertical tangents
	'Bump Y': d3.curveBumpY,
	// a cubic cardinal spline, with one-sided difference at each end
	'Cardinal': d3.curveCardinal,
	// a closed cubic cardinal spline
	'Cardinal closed': d3.curveCardinalClosed,
	// a cubic cardinal spline
	'Cardinal open': d3.curveCardinalOpen,
	// a cubic Catmull–Rom spline, with one-sided difference at each end
	'Catmull-Rom': d3.curveCatmullRom,
	// a closed cubic Catmull–Rom spline
	'Catmull-Rom closed': d3.curveCatmullRomClosed,
	// a cubic Catmull–Rom spline
	'Catmull-Rom open': d3.curveCatmullRomOpen,
	// a polyline
	'Linear': d3.curveLinear,
	// a closed polyline.
	'Linear closed': d3.curveLinearClosed,
	// a cubic spline that, given monotonicity in x, preserves it in y
	'Monotone X': d3.curveMonotoneX,
	// a cubic spline that, given monotonicity in y, preserves it in x
	'Monotone Y': d3.curveMonotoneY,
	// a natural cubic spline
	'Natural': d3.curveNatural,
	// a piecewise constant function
	'Step': d3.curveStep,
	// a piecewise constant function
	'Step after': d3.curveStepAfter,
	// a piecewise constant function
	'Step before': d3.curveStepBefore,
}
