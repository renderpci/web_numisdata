"use strict";var biblio={trigger_url:page_globals.__WEB_TEMPLATE_WEB__+"/biblio/trigger.biblio.php",search_options:null,set_up:function(e){const t=this,o=document.getElementById("search_form");if(o){const e=o.querySelectorAll("input.form-control"),n=e.length;for(let o=0;o<n;o++){const n=e[o];!0===(!n.dataset.autocomplete||JSON.parse(n.dataset.autocomplete))&&t.activate_autocomplete(e[o])}t.search_rows({ar_query:[],limit:20})}else if("undefined"!=typeof biblio_section_id){const e=[],o={name:"section_id",value:biblio_section_id,search_mode:"string",table:"publicaciones"};e.push(o),t.search_rows({ar_query:e,limit:1})}return!0},set_value:function(e,t,o){const n=document.getElementById(e.id+"_values"),a=n.querySelectorAll(".input_values");for(let e=a.length-1;e>=0;e--)if(t===a[e].value)return!1;const r=common.create_dom_element({element_type:"div",class_name:"line_value",parent:n});common.create_dom_element({element_type:"i",class_name:"icon fa-trash",parent:r}).addEventListener("click",(function(){this.parentNode.remove()}));return common.create_dom_element({element_type:"input",class_name:"input_values",parent:r,data_set:e.dataset}).value=t,!0},activate_autocomplete:function(e){const t=this;return $(e).autocomplete({delay:150,minLength:0,source:function(o,n){const a=o.term,r=t.trigger_url,i={q:a,mode:e.dataset.mode,q_name:e.dataset.q_name||null,q_search:e.dataset.q_search||e.dataset.q_name,q_table:e.dataset.q_table||null,dd_relations:e.dataset.dd_relations||null,limit:e.dataset.limit||30};!0===SHOW_DEBUG&&console.log("[biblio.activate_autocomplete] trigger_vars:",i,t.trigger_url),common.get_json_data(r,i).then((function(t){let o=[];if("descriptors"===e.id){const e=t.result.length;for(let n=0;n<e;n++){const e=t.result[n].label.split(" - ");for(let t=0;t<e.length;t++){const n=e[t].trim();!o.find((e=>e.value===n))&&n.length>0&&o.push({label:n,value:n})}}const n=page.sort_array_by_property(o,"value");o=(0!=a.length?page.filter_drop_down_list(n,a):n).slice(0,30)}else o="fecha_publicacion"===e.id?t.result.map((e=>(e.label=e.label.substring(0,4),e))):t.result;n(o)}),(function(e){console.error("[activate_autocomplete] Failed get_json!",e)}))},select:function(e,o){return e.preventDefault(),t.set_value(this,o.item.label,o.item.value),this.value="",!1},focus:function(){return!1},close:function(e,t){},change:function(e,t){},response:function(e,t){}}).on("keydown",(function(e){e.keyCode===$.ui.keyCode.ENTER&&$(this).autocomplete("close")})).focus((function(){$(this).autocomplete("search",null)})).blur((function(){})),!0},search:function(e,t){t&&t.preventDefault();for(var o=[],n=e.querySelectorAll("input.input_values, input.form-control"),a=n.length,r=0;r<a;r++){const e=n[r];if(e.value.length>0){let t=e.value,n=e.dataset.q_name;if(-1!==e.dataset.q_name.indexOf(" AS ")){n=e.dataset.q_name.split(" AS ")[1]}const a={name:n,value:t,search_mode:e.dataset.search,table:e.dataset.q_table};o.push(a)}}SHOW_DEBUG;const i=e.querySelector('input[name="operators"]:checked').value,l=this.search_rows({ar_query:o,operator:i}),s=document.querySelector(".result");return s&&s.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"}),l},search_rows:function(e){this.search_options=e;const t=document.getElementById("biblio_rows_list");t.style.opacity="0.4";const o=this.trigger_url,n={mode:"search_rows",ar_query:void 0!==e.ar_query?e.ar_query:null,limit:e.limit||20,offset:e.offset||0,count:e.count||!1,total:e.total||!1,order:e.order||"section_id ASC",operator:e.operator||"$or"};SHOW_DEBUG;return common.get_json_data(o,n).then((function(e){return!0===SHOW_DEBUG&&console.log("[biblio.search_rows] get_json_data response:",e),t.style.opacity="1",e?biblio.draw_rows({target:"biblio_rows_list",ar_rows:e.result.result,total:e.result.total,limit:n.limit,offset:n.offset}):(console.warn("[biblio.search_rows] Error. Received response data is null"),!1)}))},search_item:function(e,t){const o=[{name:e,search_mode:"string",table:"publications",value:t}];return this.search_rows({ar_query:o,count:!0}).then((function(){const e=document.querySelector(".result");e&&e.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"})}))},draw_rows:function(e){const t=this,o=e.ar_rows||[],n=o.length,a=document.getElementById(e.target);for(;a.hasChildNodes();)a.removeChild(a.lastChild);const r=new DocumentFragment,i=common.create_dom_element({element_type:"div",class_name:"pagination top"});i.appendChild(t.draw_paginator({total:e.total,limit:e.limit,offset:e.offset,count:n})),r.appendChild(i);const l=new Intl.Collator("es",{sensitivity:"base",ignorePunctuation:!0});o.sort(((e,t)=>{let o=e.autoria+" "+e.fecha_publicacion,n=t.autoria+" "+t.fecha_publicacion;return l.compare(o,n)}));t.search_options.ar_query.find((function(e){return"transcription"===e.name}));for(let e=0;e<n;e++){const n=o[e];SHOW_DEBUG;const a=common.create_dom_element({element_type:"div",class_name:"biblio_row_wrapper",data_set:{section_id:n.section_id},parent:r}),i=biblio_row_fields;if(i.biblio_object=n,i.caller=t,a.appendChild(i.author()),a.appendChild(i.publication_date()),a.appendChild(i.row_title()),a.appendChild(i.row_body()),a.appendChild(i.row_url()),n.descriptors&&n.descriptors.length>1&&a.appendChild(i.descriptors(n.descriptors)),n.transcription){const e=i.transcription(n.transcription);e&&a.appendChild(e)}}const s=common.create_dom_element({element_type:"div",class_name:"pagination bottom"});return s.appendChild(t.draw_paginator({total:e.total,limit:e.limit,offset:e.offset,count:n})),r.appendChild(s),a.appendChild(r),!0},draw_paginator:function(e){const t=this,o=new DocumentFragment,n=paginator.get_full_paginator({total:e.total,limit:e.limit,offset:e.offset,n_nodes:6,callback:e=>{const o=e.offset,n=e.total;t.search_options.offset=o,t.search_options.total=n;const a=t.search_rows(t.search_options);return a.then((function(e){const t=document.querySelector(".result");t&&t.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"})})),a}});o.appendChild(n),common.create_dom_element({element_type:"div",class_name:"spacer",parent:o});const a=paginator.get_totals_node({total:e.total,limit:e.limit,offset:e.offset,count:e.count});return o.appendChild(a),o}};