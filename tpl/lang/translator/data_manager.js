



export const request = async function(options) {

	const url 			= options.url || 'trigger.translator.php'
	const method 		= options.method || 'POST' // *GET, POST, PUT, DELETE, etc.
	const mode 			= options.mode || 'cors' // no-cors, cors, *same-origin
	const cache 		= options.cache || 'no-cache' // *default, no-cache, reload, force-cache, only-if-cached
	const credentials 	= options.credentials || 'same-origin' // include, *same-origin, omit
	const headers 		= options.headers || {'Content-Type': 'application/json'}// 'Content-Type': 'application/x-www-form-urlencoded'
	const redirect 		= options.redirect || 'follow' // manual, *follow, error
	const referrer 		= options.referrer || 'no-referrer' // no-referrer, *client
	const body 			= options.body // body data type must match "Content-Type" header

	const handle_errors = function(response) {
		if (!response.ok) {
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
		.then(response => response.json()) // parses JSON response into native Javascript objects
		.catch(error => {
			console.error("!!!!! [data_manager.request] ERROR: ",error)
			return {
				result 	: false,
				msg 	: error.message,
				error 	: error
			}
		});

	return api_response
}//end request