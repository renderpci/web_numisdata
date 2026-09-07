/**
 * die_estimation (mint page entry)
 *
 * Exposes the shared regression logic as the `die_estimation` global for the
 * mint page. The single source of truth is:
 *
 *     tpl/regression/js/regression_logic.js
 *
 * which is loaded as a plain global (`regression_logic`) on both pages. Do NOT
 * duplicate the regression math here.
 */

window.die_estimation = regression_logic;
