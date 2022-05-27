/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page*/
/*eslint no-undef: "error"*/

"use strict";



function timeline_factory() {

	// vars
		// target. DOM element where timeline section is placed
			this.target	= null
		
		// data. Database parsed rows data to create the map
			this.data = null

		// container. Where block nodes are placed
			this.container = null

		// scroll_activated. Scroll activation state
			this.scroll_activated = false

		// block_builder. Function that manage node creation of each block
			this.block_builder = null	



	/**
	* RENDER_TIMELINE
	*/
	this.render_timeline = function(options) {
		if(SHOW_DEBUG===true) {
			console.log("-> render_timeline options:",options);
		}
		
		const self = this

		// fix vars
			// target. DOM element where map is placed
			self.target = options.target
			// data. Preparsed data from rows. Contains items with properties 'lat', 'lon', and 'data' like [{lat: lat, lon: lon, data: []}]
			self.data = options.data
			// block_builder. Use custom options block_builder function
			self.block_builder = options.block_builder
					
		
		return new Promise(function(resolve) {

			// init_timeline library and create basic nodes
			self.init_timeline({})

			// parse_data. Create individual blocks for each data row
			self.parse_data_to_timeline(options.data)

			resolve(true)
		
		}).then(function(result){
			
			// activate_timeline_scroll
			self.activate_timeline_scroll()
		});		
	}//end render_timeline



	/**
	* PARSE_DATA_TO_TIMELINE
	* @return bool
	*/
	this.parse_data_to_timeline = function(data) {
		
		const self = this

		const fragment = new DocumentFragment();

		const data_length = data.length
		for (let i = 0; i < data_length; i++) {
			
			const row = data[i]

			// build timeline block
				const block = self.block_builder(row)

			// add
				fragment.appendChild(block)
		}

		// add all nodes in one operation
			self.container.appendChild(fragment)


		return true
	}//end parse_data_to_timeline



	/**
	* INIT_TIMELINE
	*/
	this.init_timeline = function(options) {
		
		const self = this

		// build wrapper
			const section = common.create_dom_element({
				element_type	: "section",
				class_name		: "cd-timeline js-cd-timeline",
				parent			: self.target
			})
			// fix container (where block nodes will be placed)
			self.container = common.create_dom_element({
				element_type	: "div",
				class_name		: "container max-width-lg cd-timeline__container",
				parent			: section
			})		

		// activate_timeline_scroll
			// self.activate_timeline_scroll()


		return true
	}//end init_timeline



	/**
	* ACTIVATE_TIMELINE_SCROLL
	*/
	this.activate_timeline_scroll = function() {

		if (self.scroll_activated===true) {
			return false
		}
		
		(function(){
		  // Vertical Timeline - by CodyHouse.co
			function VerticalTimeline( element ) {
				this.element = element;
				this.blocks = this.element.getElementsByClassName("cd-timeline__block");
				this.images = this.element.getElementsByClassName("cd-timeline__img");
				this.contents = this.element.getElementsByClassName("cd-timeline__content");
				this.offset = 0.8;
				this.hideBlocks();
			};

			VerticalTimeline.prototype.hideBlocks = function() {
				if ( !"classList" in document.documentElement ) {
					return; // no animation on older browsers
				}
				//hide timeline blocks which are outside the viewport
				var self = this;
				for( var i = 0; i < this.blocks.length; i++) {
					(function(i){
						if( self.blocks[i].getBoundingClientRect().top > window.innerHeight*self.offset ) {
							self.images[i].classList.add("cd-timeline__img--hidden"); 
							self.contents[i].classList.add("cd-timeline__content--hidden"); 
						}
					})(i);
				}
			};

			VerticalTimeline.prototype.showBlocks = function() {
				if ( ! "classList" in document.documentElement ) {
					return;
				}
				var self = this;
				for( var i = 0; i < this.blocks.length; i++) {
					(function(i){
						if( self.contents[i].classList.contains("cd-timeline__content--hidden") && self.blocks[i].getBoundingClientRect().top <= window.innerHeight*self.offset ) {
							// add bounce-in animation
							self.images[i].classList.add("cd-timeline__img--bounce-in");
							self.contents[i].classList.add("cd-timeline__content--bounce-in");
							self.images[i].classList.remove("cd-timeline__img--hidden");
							self.contents[i].classList.remove("cd-timeline__content--hidden");
						}
					})(i);
				}
			};

			var verticalTimelines = document.getElementsByClassName("js-cd-timeline"),
				verticalTimelinesArray = [],
				scrolling = false;
			if( verticalTimelines.length > 0 ) {
				for( var i = 0; i < verticalTimelines.length; i++) {
					(function(i){
						verticalTimelinesArray.push(new VerticalTimeline(verticalTimelines[i]));
					})(i);
				}

				//show timeline blocks on scrolling
				window.addEventListener("scroll", function(event) {
					if( !scrolling ) {
						scrolling = true;
						(!window.requestAnimationFrame) ? setTimeout(checkTimelineScroll, 250) : window.requestAnimationFrame(checkTimelineScroll);
					}
				});
			}

			function checkTimelineScroll() {
				verticalTimelinesArray.forEach(function(timeline){
					timeline.showBlocks();
				});
				scrolling = false;
			};
		})();

		// fix state
			self.scroll_activated = true

		return true
	}//end activate_timeline_scroll



	/**
	* BUILD_TIMELIME_BLOCK
	*/
	// this.build_timelime_block = function(options) {

	// 	const self = this

	// 	// sample html
	// 		// <div class="cd-timeline__block">
			
	// 		//   <div class="cd-timeline__img cd-timeline__img--picture">
	// 		// 	  <img src="assets/img/cd-icon-picture.svg" alt="Picture">
	// 		//   </div> <!-- cd-timeline__img -->

	// 		//   <div class="cd-timeline__content text-component">
	// 		// 	  <h2>Title of section 1</h2>
	// 		// 	  <p class="color-contrast-medium">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iusto, optio, dolorum provident rerum aut hic quasi placeat iure tempora laudantium ipsa ad debitis unde? Iste voluptatibus minus veritatis qui ut.</p>
			
	// 		// 	  <div class="flex justify-between items-center">
	// 		// 	    <span class="cd-timeline__date">Jan 14</span>
	// 		// 	    <a href="#0" class="btn btn--subtle">Read more</a>
	// 		// 	  </div>
	// 		//   </div> <!-- cd-timeline__content -->

	// 		// </div> <!-- cd-timeline__block -->
		
	// 	const timeline_icon_src	= options.timeline_icon_src || 'assets/img/cd-icon-picture.svg'
	// 	const date				= options.date || 'Undefined date'
	// 	const content_node		= options.content_node || common.create_dom_element({
	// 		element_type	: "h2",
	// 		text_content	: "Undefined content_node"
	// 	})

	// 	// wrapper
	// 		const block = common.create_dom_element({
	// 			element_type	: "div",
	// 			class_name		: "cd-timeline__block"
	// 		})

	// 	// icon
	// 		const image_icon = common.create_dom_element({
	// 			element_type	: "div",
	// 			class_name		: "cd-timeline__img cd-timeline__img--picture",
	// 			parent			: block
	// 		})
	// 		const icon = common.create_dom_element({
	// 			element_type	: "img",
	// 			class_name		: "cd-timeline__img cd-timeline__img--picture",
	// 			src				: timeline_icon_src, // from options timeline_icon_src
	// 			parent			: image_icon
	// 		})

	// 	// content
	// 		const block_content = common.create_dom_element({
	// 			element_type	: "div",
	// 			class_name		: "cd-timeline__content text-component",
	// 			parent			: block
	// 		})
	// 		block_content.appendChild(content_node) // from options content_node
		
	// 	// date
	// 		const date_container = common.create_dom_element({
	// 			element_type	: "div",
	// 			class_name		: "flex justify-between items-center",
	// 			parent			: content_node
	// 		})
	// 		const date_span = common.create_dom_element({
	// 			element_type	: "span",
	// 			class_name		: "cd-timeline__date",
	// 			text_content	: date,
	// 			parent			: date_container
	// 		})



	// 	return block
	// }//end build_timelime_block
	


}//end timeline_factory