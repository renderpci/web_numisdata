/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/

"use strict";



function list_factory() {

	// vars
		// target. DOM element where timeline section is placed
			this.target	= null
		
		// data. Database parsed rows data to create the map
			this.data = null

		// row_builder. Function that manage node creation of each block
			this.row_builder = null

	

	/**
	* RENDER_LIST
	*/
	this.render_list = function(options) {

		const self = this
		
		self.target			= options.target
		self.data			= options.data || []
		self.row_builder	= options.list_row_builder
		
		const total			= options.total
		const limit			= options.limit
		const offset		= options.offset


		// container select and clean container div
			const container = self.target
			// while (container.hasChildNodes()) {
			// 	container.removeChild(container.lastChild);
			// }

		// add_spinner
			// page.add_spinner(container)
		
		// build row nodes
			new Promise(function(resolve) {

				const fragment = new DocumentFragment();

				// iterate all rows 
				const ar_rows_length = self.data.length
				for (let i = 0; i < ar_rows_length; i++) {					

					// row_fields set
					// const row_node = row_fields.draw_item(self.data[i])
					const row_node = self.row_builder(self.data[i])

					fragment.appendChild(row_node)
				}

				resolve(fragment)
			}).then(function(end_fragment){
				
				container.appendChild(end_fragment)
			});
		
		// des
			// // const render_nodes = async () => {
			// async function render_nodes() {

			// 	const fragment = new DocumentFragment();

			// 	const ar_mints = ar_rows.filter(item => item.term_table==='mints')

			// 	const ar_parent = []
			// 	for (let i = 0; i < ar_mints.length; i++) {
			// 		const parent = JSON.parse(ar_mints[i].parent)[0]
			// 		const mint_parent 	= ar_rows.find(item => item.section_id===parent)
			// 		if(!mint_parent){
			// 				console.error("mint don't have public parent:",ar_mints[i]);
			// 			continue
			// 		}
			// 		// check if the parent is inside the ar_aprents, if not push inside else nothing
			// 		const unique_parent 	= ar_parent.find(item => item.section_id===parent)
			// 		if(typeof unique_parent === 'undefined'){
			// 			ar_parent.push(mint_parent)
			// 		}
					
			// 	}
			

			// 	return fragment
			// }

			// render_nodes().then(fragment => {

			// 	// setTimeout(()=>{
			// 		while (container.hasChildNodes()) {
			// 			container.removeChild(container.lastChild);
			// 		}

			// 		// bulk fragment nodes to container
			// 		container.appendChild(fragment)
			// 	// },800)
			// })


		return true
	}//end render_list
	



}//end list_factory


