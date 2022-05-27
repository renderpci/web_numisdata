/*global common, tstring, SHOW_DEBUG */
/*eslint no-undef: "error"*/
"use strict";



var paginator =  {


	/**
	* BUILD_PAGE_NODES
	* Build an array ob ojects ready to draw a pagination navigator
	*/
	build_page_nodes : function(total, limit, offset, n_nodes) {
		if(SHOW_DEBUG===true) {
			// console.log("[paginator.build_page_nodes] : total",total,"limit:",limit,"offset",offset,"n_nodes:",n_nodes);
		}

		// safe types
			total 	= parseInt(total)
			limit  	= parseInt(limit)
			offset 	= parseInt(offset)
			n_nodes	= parseInt(n_nodes)


		const ar_nodes = []

		// check total
			if (total<1) {
				return ar_nodes
			}

		// n_nodes default
			if (typeof n_nodes==="undefined") {
				n_nodes = 6
			}

		// debug params
			// limit 	= 10
			// offset  	= 0
			// n_nodes 	= 6

		// first
			ar_nodes.push({
				label 		 : tstring.first || "<<",
				offset_value : 0,
				type 		 : "navigator",
				active 		 : (offset>=limit) ? true : false,
				id 			 : 'first'
			})

		// prev
			ar_nodes.push({
				label 		 : tstring.prev || "Prev",
				offset_value : (offset - limit)>0 ? (offset - limit) : 0,
				type 		 : "navigator",
				active 		 : (offset>=limit) ? true : false,
				id 			 : 'previous'
			})

		// intermediate
			const n_pages 		= Math.ceil(total / limit)
			const current_page 	= Math.ceil(offset/limit)+1
			let n_pages_group 	= Math.ceil(n_nodes / 2)

			if (current_page<=n_pages_group) {
				n_pages_group = (n_pages_group*2) -current_page+1
			}

			if(SHOW_DEBUG===true) {
				// console.log("current_page:",current_page, "total:",total, "n_pages",n_pages, "limit:",limit, "offset:",offset,"n_nodes:",n_nodes,"n_pages_group:",n_pages_group);
			}
			for (var i = 1; i <= n_pages; i++) {
				//if ( i < (current_page-n_pages_group) || i > (current_page+n_pages_group)) {
				//	continue
				//}

				//if (i > (n_pages_group) && i < (n_pages-n_pages_group)) {
				//	continue;
				//}

				const selected 	= ((i-1)===(offset/limit)) ? true : false; // offset===((i+1) * limit) ? true : false
				const active 	= !selected

				// middle extra ...
					//if (i===(current_page+1)) {
					//	ar_nodes.push({
					//		label 		 : "...",
					//		offset_value : null,
					//		type 		 : "extra",
					//		active 		 : false,
					//		selected 	 : false
					//	})
					//}

				const offset_value = ((i-1) * limit)

				if( 	(i>=(current_page-n_pages_group) && i<=current_page)
					|| 	(i>=(current_page-n_pages_group) && i<=(current_page+n_pages_group))
					) {

					ar_nodes.push({
						label 		 : i,
						offset_value : offset_value,
						type 		 : "page",
						selected 	 : selected,
						active 		 : active,
						id 			 : i
					})
				}
			}

		// next
			ar_nodes.push({
				label 		 : tstring.next || "Next",
				offset_value : offset + limit, // (n_pages_group+1) * limit,//
				type 		 : "navigator",
				active 		 : (offset < (total-limit)) ? true : false,
				id 			 : 'next'
			})

		// last
			ar_nodes.push({
				label 		 : tstring.last || ">>",
				offset_value : (n_pages-1) * limit,
				type 		 : "navigator",
				active 		 : (offset < (total-limit)) ? true : false,
				id 			 : 'last'
			})

		// response object
			const response = {
				total 		  : total,
				limit 		  : limit,
				offset 		  : offset,
				nodes 		  : n_nodes,
				n_pages 	  : n_pages,
				n_pages_group : n_pages_group,
				current_page  : current_page,
				ar_nodes 	  : ar_nodes
			}

		// debug
			if(SHOW_DEBUG===true) {
				// console.log("[build_page_nodes] response:",response);
			}

		return response
	},//end build_page_nodes



	/**
	* BUILD_PAGINATOR_HTML
	* Builds html of paginator from page_nodes
	*/
	build_paginator_html : function(page_nodes_data, container, callback) {

		const self = this

		const fragment = new DocumentFragment();

		// iterate nodes (li)
			const ar_nodes 		  = page_nodes_data.ar_nodes || []
			const ar_nodes_length = ar_nodes.length
			for (let i = 0; i < ar_nodes_length; i++) {
				const node = ar_nodes[i]

				let class_name 	= ""
				let label 		= node.label
				switch(node.type){
					case "navigator":
						class_name = node.type + " " + node.id
						break;

					case "page":
						class_name = node.type + ""
						break;
				}

				if (node.selected===true) {
					class_name += " selected"
				}

				const li = common.create_dom_element({
					element_type 	: "a",
					class_name 		: class_name + (!node.active ? " unactive" : ""),
					text_content 	: label,
					parent 			: fragment
				})

				// link
					if (node.active===true) {
						li.addEventListener("click", function(e){
							// return window[method_name]({
							// 	offset 	: node.offset_value,
							// 	total 	: page_nodes_data.total
							// })
							const exec_function = typeof callback==='function' ? callback : self.goto_url
							if (typeof exec_function==='function') {
								return exec_function({
									offset 	: node.offset_value,
									total 	: page_nodes_data.total
								})
							}

							return false
						})
						// const a  = common.create_dom_element({
						// 	element_type 	: "a",
						// 	class_name 		: "",
						// 	text_content 	: label,
						// 	parent 			: wrapper_ul
						// })
					}
			}//end iterate nodes

		// wrapper ul
			const wrapper_ul = common.create_dom_element({
				element_type 	: "div",
				class_name 		: "paginator_wrapper navigator"
			})
			wrapper_ul.appendChild(fragment)

		// compatibility only
			if (container) {
				container.appendChild(wrapper_ul)
			}


		return wrapper_ul
	},//end build_paginator_html



	/**
	* GOTO_URL
	*/
	goto_url : function(options) {

		const total  = options.total
		const offset = options.offset

		const url = "../?total=" + total + "&offset=" + offset

		window.location.href = url;

		return true
	},//end goto_url



	/**
	* GET_FULL_PAGINATOR
	* Builds and return complete paginator dom node
	*/
	get_full_paginator : function(options) {

		const self = this

		const total 	= options.total;
		const limit 	= options.limit;
		const offset	= options.offset;
		const n_nodes	= options.n_nodes;
		const callback 	= options.callback || null;

		// page nodes data
		const page_nodes_data = self.build_page_nodes(total, limit, offset, n_nodes)

		// dom nodes
		const paginator_node = self.build_paginator_html(page_nodes_data, false, callback)


		return paginator_node
	},//end get_full_paginator



	/**
	* GET_TOTALS_NODE
	* Builds toatals info div of current viewed records and totals
	*/
	get_totals_node : function(options) {

		// options
			const total		= options.total
			const limit		= options.limit
			const offset	= options.offset
			const count		= options.count

		const from 	= total==0
			? 0
			: Math.ceil(1 * offset) || 1
		const to 	= offset + count

		const info = (total===0)
			? tstring['showed'] + " " + total
			: tstring['showed'] + " " + from + " " + tstring['to'] + " " + to + " " + tstring['of'] + " " + total

		const totals_node = common.create_dom_element({
			element_type	: "div",
			class_name		: "totals",
			text_content	: info
		})


		return totals_node
	}//end get_totals_node



}//end paginator