// WORKER
// Calculate complex data in background like recursive children or parent
// (!) Note that module version of the worker do not works in Firefox and the scope is very annoying to receive functions by name
var window = self
// self.importScripts('../../page/js/app-min.js')
// self.importScripts('../../page/js/app_utils-min.js')
// self.importScripts('../../page/js/enviroment.js.php','../../page/js/app-min.js');


/**
* ONMESSAGE
* Called from caller 'postMessage' action like:

	const current_worker = new Worker(__WEB_TEMPLATE_WEB__ + '/thesaurus/js/worker.js');
	current_worker.postMessage({
		url		: page_globals.JSON_TRIGGER_URL,
		body	: body
	});
	current_worker.onmessage = function(e) {
		... code
		current_worker.terminate()
	}
*/
self.onmessage = function(e) {
	// const t1 = performance.now()

	// options
		const url	= e.data.url
		const body	= e.data.body // string as `(ref_type_design_obverse_iconography_data LIKE '%"${row.section_id}"%' OR ref_type_design_reverse_iconography_data LIKE '%"${row.section_id}"%')`

	// request
		request({
			url		: url,
			body	: body
		})
		.then(function(response){
			// console.log("response:",response);
			// console.log("__***Time performance.now()-t1 worker:", body, performance.now()-t1);

			self.postMessage(response);
		})
}//end onmessage



/**
* REQUEST
* Make a fetch request to server api
* @param object options
* @return promise api_response
*/
async function request(options) {

	// console.log("++++ data_manager request options:", options);

	let url				= options.url || null
	const method		= options.method || 'POST' // *GET, POST, PUT, DELETE, etc.
	const mode			= options.mode || 'cors' // no-cors, cors, *same-origin
	const cache			= options.cache || 'no-cache' // *default, no-cache, reload, force-cache, only-if-cached
	const credentials	= options.credentials || 'same-origin' // include, *same-origin, omit
	const headers		= options.headers || {'Content-Type': 'application/json'}// 'Content-Type': 'application/x-www-form-urlencoded'
	const redirect		= options.redirect || 'follow' // manual, *follow, error
	const referrer		= options.referrer || 'no-referrer' // no-referrer, *client
	const body			= options.body // body data type must match "Content-Type" header

	// // page_globals check for workers
	// 	const page_globals = typeof window.page_globals!=='undefined'
	// 		? window.page_globals
	// 		: null

	// // url
	// 	if (!url && page_globals) {
	// 		url = page_globals.JSON_TRIGGER_URL
	// 	}

	// // code defaults
	// 	if (!body.code && page_globals) {
	// 		body.code = page_globals.API_WEB_USER_CODE
	// 	}
	// // lang defaults
	// 	if (!body.lang && page_globals) {
	// 		body.lang = page_globals.WEB_CURRENT_LANG_CODE
	// 	}

	// // db_name defaults
	// 	if (!body.db_name && page_globals && page_globals.WEB_DB) {
	// 		body.db_name = page_globals.WEB_DB
	// 	}

	const handle_errors = function(response) {
		if (!response.ok) {
			console.warn("-> handle_errors response:",response);
			throw Error(response.statusText);
		}
		return response;
	}

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
			})
			return json_parsed
		})// parses JSON response into native Javascript objects
		.catch(error => {
			console.error("!!!!! [page data_manager.request] ERROR:", error)
			return {
				result 	: false,
				msg 	: error.message,
				error 	: error
			}
		});

	return api_response
}//end request