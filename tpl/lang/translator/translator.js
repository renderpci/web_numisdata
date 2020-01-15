import {request} from './data_manager.js'



/**
* INIT_TRANSLATOR
*/
export const init_translator = (options) => {
	
	// render list
		build_list(options)

	return true
}//end init_translator



/**
* build_list
*/
const build_list = (options) => {
	
	const main = document.getElementById("main")

	const base_lang_data = options.data[options.base_lang]
	const langs 		 = Object.keys(options.data)

	// sort langs with base_lang on top
	const first = options.base_lang;
	langs.sort(function(x,y){ return x == first ? -1 : y == first ? 1 : 0; });	

	// headers
		for (let i = 0; i < langs.length; i++) {

			const input = document.createElement("input")
			input.type  = "text"
			input.setAttribute('value', langs[i])
			input.setAttribute('readonly', true)
			input.classList.add("header")

			main.appendChild(input)
		}
	
		
	// iterate base lang
		for(const label in base_lang_data) {

			const ar_values 	= []		
			const value 		= {
				lang  : options.base_lang,
				value : base_lang_data[label]
			}
			ar_values.push(value)

			for (let i = 0; i < langs.length; i++) {
				
				const lang = langs[i]
				if (lang===options.base_lang) continue;

				const current_value = {
					lang  : lang,
					value : options.data[lang][label] || null
				} 
				ar_values.push(current_value)
			}
			const node = build_line(label, ar_values)
				//console.log("node:",node);


			main.appendChild(node)
		}
	
	
	return true
}//end build_list



/**
* BUILD_LINE
*/
const build_line = (label, ar_values) => {
	
	const line = document.createElement("div")

	// label
		//const 	label_node = document.createElement("span")
		//		label_node.innerText = label
		//		line.appendChild(label_node)

	// input
		for (let i = 0; i < ar_values.length; i++) {
			
			const value = ar_values[i].value || ""
			const lang 	= ar_values[i].lang

			const input = document.createElement("input")

			input.type  = "text"
			input.setAttribute('value', value);
			input.setAttribute('placeholder', label)
			input.setAttribute('title', label)
			input.dataset.key  = label
			input.dataset.lang = lang

			input.addEventListener("change", function(e){
				//console.log("e:",e.target.value, e);
				save_lang_file(e.target, lang)
			})

			line.appendChild(input)
		}


	return line
}//end build_line



/**
* SAVE_LANG_FILE
*/
const save_lang_file = (node, lang) => {
	
	const data = {}

	const ar_inputs = document.querySelectorAll("input[data-lang='"+lang+"']")
	for (let i = 0; i < ar_inputs.length; i++) {
		
		const key 	= ar_inputs[i].dataset.key
		const value = ar_inputs[i].value
		
		data[key] = value
	}
	//console.log("data:",data);


	request({
		url  : "trigger.translator.php",
		body : {
			lang : lang,
			data : data
		}
	})
	.then((response)=>{
		//console.log("response:",response);

		node.classList.remove("saved","not_saved")

		if (response.result<1) {			
			alert("Error on save file " + lang + ".json");
			node.classList.add("not_saved")	
		}else{			
			console.log("File saved!:", response);
			//alert("File saved successfully! \nname:"+ lang + ".json");
			node.classList.add("saved")						
		}

		setTimeout(()=>{
			node.classList.remove("saved","not_saved")
		},3000)
	})


	return true
}//end save_lang_file


