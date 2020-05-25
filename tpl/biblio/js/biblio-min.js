"use strict";var biblio={trigger_url:page_globals.__WEB_TEMPLATE_WEB__+"/biblio/trigger.biblio.php",search_options:null,set_up:function(e){const t=this,o=document.getElementById("search_form");if(o){const e=o.querySelectorAll("input.form-control"),a=e.length;for(var n=0;n<a;n++)t.activate_autocomplete(e[n]);t.search_rows({ar_query:[],limit:100})}else if("undefined"!=typeof biblio_section_id){var a=[],l={name:"section_id",value:biblio_section_id,search_mode:"string",table:"publicaciones"};a.push(l),t.search_rows({ar_query:a,limit:1})}return!0},set_value:function(e,t,o){const n=document.getElementById(e.id+"_values"),a=n.querySelectorAll(".input_values");for(var l=a.length-1;l>=0;l--)if(t===a[l].value)return!1;const i=common.create_dom_element({element_type:"div",class_name:"line_value",parent:n});return common.create_dom_element({element_type:"i",class_name:"icon fa-trash",parent:i}).addEventListener("click",(function(){this.parentNode.remove()})),common.create_dom_element({element_type:"input",class_name:"input_values",parent:i,data_set:e.dataset}).value=t,!0},activate_autocomplete:function(e){const t=this;return $(e).autocomplete({delay:150,minLength:0,source:function(o,n){const a=o.term,l=t.trigger_url,i={q:a,mode:e.dataset.mode,q_name:e.dataset.q_name||null,q_search:e.dataset.q_search||e.dataset.q_name,q_table:e.dataset.q_table||null,dd_relations:e.dataset.dd_relations||null};!0===SHOW_DEBUG&&console.log("[biblio.activate_autocomplete] trigger_vars:",i),common.get_json_data(l,i).then((function(t){console.log("[biblio.activate_autocomplete] response_data",t);const o="fecha_publicacion"===e.id?t.result.map(e=>(e.label=e.label.substring(0,4),e)):t.result;n(o)}),(function(e){console.error("[activate_autocomplete] Failed get_json!",e)}))},select:function(e,o){return e.preventDefault(),t.set_value(this,o.item.label,o.item.value),this.value="",!1},focus:function(){return!1},close:function(e,t){},change:function(e,t){},response:function(e,t){}}).on("keydown",(function(e){e.keyCode===$.ui.keyCode.ENTER&&$(this).autocomplete("close")})).focus((function(){$(this).autocomplete("search",null)})).blur((function(){})),!0},search:function(e,t){t&&t.preventDefault();for(var o=[],n=e.querySelectorAll("input.input_values, input.form-control"),a=n.length,l=0;l<a;l++){const e=n[l];if(e.value.length>0){console.log("input:",e);let t=e.value,n=e.dataset.q_name;if(-1!==e.dataset.q_name.indexOf(" AS ")){if(n=e.dataset.q_name.split(" AS ")[1],"authors"===n){const e=/\,/gi;t=t.replace(e,"")}}const a={name:n,value:t,search_mode:e.dataset.search,table:e.dataset.q_table};o.push(a)}}!0===SHOW_DEBUG&&console.log("search.ar_query:",o);const i=e.querySelector('input[name="operators"]:checked').value,r=this.search_rows({ar_query:o,operator:i}),s=document.querySelector(".result");return s&&s.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"}),r},search_rows:function(e){this.search_options=e;const t=document.getElementById("biblio_rows_list");t.style.opacity="0.4";const o=this.trigger_url,n={mode:"search_rows",ar_query:void 0!==e.ar_query?e.ar_query:null,limit:e.limit||10,offset:e.offset||0,count:e.count||!1,total:e.total||!1,order:e.order||"section_id ASC",operator:e.operator||"OR"};return!0===SHOW_DEBUG&&console.log("[biblio.search_rows] trigger_vars:",n),common.get_json_data(o,n).then((function(e){return!0===SHOW_DEBUG&&console.log("[biblio.search_rows] get_json_data response:",e),t.style.opacity="1",e?biblio.draw_rows({target:"biblio_rows_list",ar_rows:e.result.result,total:e.result.total,limit:n.limit,offset:n.offset}):(console.warn("[biblio.search_rows] Error. Received response data is null"),!1)}))},draw_rows:function(e){const t=e.ar_rows||[],o=t.length,n=document.getElementById(e.target);for(;n.hasChildNodes();)n.removeChild(n.lastChild);const a=new DocumentFragment,l=common.create_dom_element({element_type:"div",class_name:"pagination top"});l.appendChild(this.draw_paginator({total:e.total,limit:e.limit,offset:e.offset,count:o})),a.appendChild(l);let i=new Intl.Collator("es",{sensitivity:"base",ignorePunctuation:!0});t.sort((e,t)=>{let o=e.autoria+" "+e.fecha_publicacion,n=t.autoria+" "+t.fecha_publicacion;return i.compare(o,n)});for(var r=0;r<o;r++){const e=t[r];!0===SHOW_DEBUG&&console.log("i biblio_object:",r,e);const o=common.create_dom_element({element_type:"div",class_name:"biblio_row_wrapper",data_set:{section_id:e.section_id},parent:a}),n=row_fields;n.biblio_object=e,o.appendChild(n.author()),o.appendChild(row_fields.publication_date()),o.appendChild(row_fields.row_title()),o.appendChild(row_fields.row_body()),o.appendChild(row_fields.row_url())}const s=common.create_dom_element({element_type:"div",class_name:"pagination bottom"});return s.appendChild(this.draw_paginator({total:e.total,limit:e.limit,offset:e.offset,count:o})),a.appendChild(s),n.appendChild(a),!0},draw_paginator:function(e){const t=this,o=new DocumentFragment,n=paginator.get_full_paginator({total:e.total,limit:e.limit,offset:e.offset,n_nodes:10,callback:e=>{const o=e.offset,n=e.total;t.search_options.offset=o,t.search_options.total=n;const a=t.search_rows(t.search_options);return a.then((function(e){const t=document.querySelector(".result");t&&t.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"})})),a}});o.appendChild(n),common.create_dom_element({element_type:"div",class_name:"spacer",parent:o});const a=paginator.get_totals_node({total:e.total,limit:e.limit,offset:e.offset,count:e.count});return o.appendChild(a),o}};