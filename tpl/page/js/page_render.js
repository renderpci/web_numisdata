/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/

"use strict";

/**
* COMMON DATA RENDERS
* prototypes page
*/



/**
* RENDER_MAP_LEGEND
* Unified way to build  
*/
page.render_map_legend = function(){

	// map_legend
	const map_legend = common.create_dom_element({
		element_type	: "div",
		class_name		: "map_legend"
	})
	common.create_dom_element({
		element_type	: "div",
		class_name		: "legend_item",
		inner_html		: tstring.mint + '<img src="'+page.maps_config.markers.mint.iconUrl+'"/>',
		parent			: map_legend
	})
	common.create_dom_element({
		element_type	: "div",
		class_name		: "legend_item",
		inner_html		: tstring.hoard + '<img src="'+page.maps_config.markers.hoard.iconUrl+'"/>',
		parent			: map_legend
	})
	common.create_dom_element({
		element_type	: "div",
		class_name		: "legend_item",
		inner_html		: tstring.findspot + '<img src="'+page.maps_config.markers.findspot.iconUrl+'"/>',
		parent			: map_legend
	})


	return map_legend
}//end render_map_legend