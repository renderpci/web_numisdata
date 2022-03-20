(function () {
	'use strict';

	/*global get_label, page_globals, SHOW_DEBUG */
	/*eslint no-undef: "error"*/



	/**
	* DATA_LOADER
	*/
	const data_manager = function() {

	};//end data_manager



	/**
	* REQUEST
	* Make a fetch request to server api
	* @param object options
	* @return promise api_response
	*/
	data_manager.prototype.request = async function(options) {

		// console.log("++++ data_manager request options:", options);

		let url				= options.url || null;
		const method		= options.method || 'POST'; // *GET, POST, PUT, DELETE, etc.
		const mode			= options.mode || 'cors'; // no-cors, cors, *same-origin
		const cache			= options.cache || 'no-cache'; // *default, no-cache, reload, force-cache, only-if-cached
		const credentials	= options.credentials || 'same-origin'; // include, *same-origin, omit
		const headers		= options.headers || {'Content-Type': 'application/json'};// 'Content-Type': 'application/x-www-form-urlencoded'
		const redirect		= options.redirect || 'follow'; // manual, *follow, error
		const referrer		= options.referrer || 'no-referrer'; // no-referrer, *client
		const body			= options.body; // body data type must match "Content-Type" header

		// page_globals check for workers
			const page_globals = typeof window.page_globals!=='undefined'
				? window.page_globals
				: null;

		// url
			if (!url && page_globals) {
				url = page_globals.JSON_TRIGGER_URL;
			}

		// code defaults
			if (!body.code && page_globals) {
				body.code = page_globals.API_WEB_USER_CODE;
			}
		// lang defaults
			if (!body.lang && page_globals) {
				body.lang = page_globals.WEB_CURRENT_LANG_CODE;
			}

		// db_name defaults
			if (!body.db_name && page_globals && page_globals.WEB_DB) {
				body.db_name = page_globals.WEB_DB;
			}

		const handle_errors = function(response) {
			if (!response.ok) {
				console.warn("-> handle_errors response:",response);
				throw Error(response.statusText);
			}
			return response;
		};

	 	const api_response = fetch(
	 		url,
	 		{
				method		: method,
				mode		: mode,
				cache		: cache,
				credentials	: credentials,
				headers		: headers,
				redirect	: redirect,
				referrer	: referrer,
				body		: JSON.stringify(body)
			})
			.then(handle_errors)
			.then(response => {
				// console.log("-> json response 1 ok:",response.body);
				const json_parsed = response.json().then((result)=>{
					//console.log("-> json result 2:",result);
					return result
				});
				return json_parsed
			})// parses JSON response into native Javascript objects
			.catch(error => {
				console.error("!!!!! [page data_manager.request] ERROR:", error);
				return {
					result 	: false,
					msg 	: error.message,
					error 	: error
				}
			});

		return api_response
	};//end request

	/**
	* EVENT_MANAGER
	* the event_manager is created by the page and used by all instances: section, section_group, compnents, etc
	* the event manager is a observable-observer pattern but we implement connection with the instances with tokens
	* the token is stored in the instances and the events is a array of objects every event is auto-explained
	* the ionstances has control to create news and detroy it.
	*
	* events format:[{
	*					event_name 	: the common name of the events for fired by publish/changes,
	*					token 		: unique id stored in the instance for contol the event,
	*					callback 	: the function that will fired when publish/change will fired
	*				}]
	*
	*/
	const event_manager = function(){



		this.events = [];
		this.last_token = -1;



		/**
		* SUBSCRIBE
		*/
		this.subscribe = function(event_name, callback) {

			// new event. Init. Create the unique token
				const token = "event_"+String(++this.last_token);

			// create the event
					const new_event = {
						event_name 	: event_name,
						token 		: token,
						callback 	: callback
					};
			// add the event to the global events of the page
				this.events.push(new_event);

			// return the token to save into the events_tokens propertie inside the caller instance
				return token
		};//end subscribe



		/**
		* UNSUBSCRIBE
		*/
		this.unsubscribe = function(event_token) {

			const self = this;

			// find the event in the global events and remove it
				const result = self.events.map( (current_event, key, events) => {
					(current_event.token === event_token) ? events.splice(key, 1) : null;
				});

			// return the new array without the events
				return result
		};//end unsubscribe



		/**
		* PUBLISH
		* when the publish event is fired it need propagated to the suscribers events
		*/
		this.publish = function(event_name, data={}) {
			//if(SHOW_DEBUG===true) {
				//console.log("[publish] event_name:",event_name)
				//console.log("[publish] data:",data)
			//}

			// find the events that has the same event_name for exec
			const current_events = this.events.filter(current_event => current_event.event_name === event_name);

			// if don't find events don't exec
			if(!current_events){
				return false

			}else {
				// exec the suscribed events callbacks
				const result = current_events.map(current_event => current_event.callback(data));
				return result
			}
		};//end publish



		/**
		* GET_EVENTS
		* @return
		*/
		this.get_events = function() {

			return this.events
		};//end get_events



		/**
		 * Fire an event handler to the specified node. Event handlers can detect that the event was fired programatically
		 * by testing for a 'synthetic=true' property on the event object
		 * @param {HTMLNode} node The node to fire the event handler on.
		 * @param {String} eventName The name of the event without the "on" (e.g., "focus")
		 */
		this.fire_event = function(node, eventName) {
			// Make sure we use the ownerDocument from the provided node to avoid cross-window problems
			var doc;
			if (node.ownerDocument) {
				doc = node.ownerDocument;
			} else if (node.nodeType == 9){
				// the node may be the document itself, nodeType 9 = DOCUMENT_NODE
				doc = node;
			} else {
				throw new Error("Invalid node passed to fireEvent: " + node.id);
			}

			if (node.dispatchEvent) {
				// Gecko-style approach (now the standard) takes more work
				var eventClass = "";

				// Different events have different event classes.
				// If this switch statement can't map an eventName to an eventClass,
				// the event firing is going to fail.
				switch (eventName) {
					case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
					case "mousedown":
					case "mouseup":
						eventClass = "MouseEvents";
						break;

					case "focus":
					case "change":
					case "blur":
					case "select":
						eventClass = "HTMLEvents";
						break;

					default:
						throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
				}
				var event = doc.createEvent(eventClass);

				var bubbles = eventName == "change" ? false : true;
				event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

				event.synthetic = true; // allow detection of synthetic events
				// The second parameter says go ahead with the default action
				node.dispatchEvent(event, true);
			} else  if (node.fireEvent) {
				// IE-old school style
				var event = doc.createEventObject();
				event.synthetic = true; // allow detection of synthetic events
				node.fireEvent("on" + eventName, event);
			}
		};//end fire_event



		/**
		* WHEN_IN_DOM
		* Exec a callback when node element is placed in the DOM (then is possible to know their size, etc.)
		* Useful to render leaflet maps and so forth
		* @return mutation observer
		*/
		this.when_in_dom = function(node, callback) {

			const observer = new MutationObserver(function(mutations) {
				if (document.contains(node)) {
					// console.log("It's in the DOM!");
					observer.disconnect();

					callback(this);
				}
			});

			observer.observe(document, {attributes: false, childList: true, characterData: false, subtree:true});

			return observer
		};//end when_in_dom



	};//end event_manager

	/*global tstring, page_globals, SHOW_DEBUG, row_fields, common, page, forms, document, DocumentFragment, tstring, console */



	// globals
		window.data_manager		= new data_manager();
		window.event_manager	= new event_manager();


	// debug
		// setTimeout(function(){
		// 	console.log("Activated app_utils !");
		// 	console.log("Avilable data_manager:",data_manager);
		// 	console.log("Avilable event_manager:",event_manager);
		// },10)

})();
//# sourceMappingURL=app_utils-min.js.map
