"use strict";var catalog={trigger_url:page_globals.__WEB_TEMPLATE_WEB__+"/catalog/trigger.catalog.php",search_options:{},selected_term_table:null,filters:{},filter_op:"AND",draw_delay:1,form:null,rows_list_container:null,export_data_container:null,set_up:function(e){const t=this,n=(e.global_search,e.rows_list_container),r=e.export_data_container,o=e.form_items_container,a=e.psqo;t.rows_list_container=n,t.export_data_container=r,t.form_items_container=o;const l=t.render_form();if(t.form_items_container.appendChild(l),a&&a.length>1){const e=psqo_factory.decode_psqo(a),n=psqo_factory.build_psqo(e);for(let e=0;e<n.length;e++){const r=n[e],o=Object.keys(n[e]);t.form.set_operator_node_value(o[0]);const a=r[o];for(let e=0;e<a.length;e++){const n=a[e];t.form.set_form_item(n)}}t.form_submit(l)}else t.load_mint_list().then((function(e){const n=e.result[Math.floor(Math.random()*e.result.length)],r=(new form_factory).item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"p_mint",eq:"LIKE",eq_in:"",eq_out:"",q:n.name,is_term:!0});t.form_submit(l,[r])}));return!0},render_form:function(){const e=this,t=new DocumentFragment;e.form=e.form||new form_factory;const n=common.create_dom_element({element_type:"div",class_name:"form-row fields",parent:t});e.form.item_factory({id:"global_search",name:"global_search",label:tstring.global_search||"global_search",q_column:"global_search",eq:"MATCH",eq_in:"",eq_out:"",class_name:"global_search",parent:n,callback:function(t){const n=t.node_input;let r;common.create_dom_element({element_type:"div",class_name:"search_operators_info",parent:n.parentNode}).addEventListener("click",(function(t){if(t.stopPropagation(),r)return r.remove(),void(r=null);r=e.form.full_text_search_operators_info(),n.parentNode.appendChild(r)})),window.addEventListener("click",(function(e){r&&!n.contains(e.target)&&(r.remove(),r=null)}))}});e.form.item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"p_mint",eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"number",name:"number",q_column:"term",q_table:"types",label:tstring.number_key||"Number & Key",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"culture",name:"culture",label:tstring.culture||"culture",q_column:"p_culture",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"creator",name:"creator",label:tstring.creator||"creator",q_column:"p_creator",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"design_obverse",name:"design_obverse",label:tstring.design_obverse||"design obverse",q_column:"ref_type_design_obverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"design_reverse",name:"design_reverse",label:tstring.design_reverse||"design reverse",q_column:"ref_type_design_reverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"symbol_obverse",name:"symbol_obverse",label:tstring.symbol_obverse||"symbol obverse",q_column:"ref_type_symbol_obverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"symbol_reverse",name:"symbol_reverse",label:tstring.symbol_reverse||"symbol reverse",q_column:"ref_type_symbol_reverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"legend_obverse",name:"legend_obverse",label:tstring.legend_obverse||"legend obverse",q_column:"ref_type_legend_obverse",q_column_filter:"ref_type_legend_transcription_obverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"legend_reverse",name:"legend_reverse",label:tstring.legend_reverse||"legend reverse",q_column:"ref_type_legend_reverse",q_column_filter:"ref_type_legend_transcription_reverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"territory",name:"territory",label:tstring.territory||"territory",q_column:"p_territory",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"group",name:"group",label:tstring.group||"group",q_column:"p_group",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"material",name:"material",q_column:"ref_type_material",q_table:"any",label:tstring.material||"material",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"denomination",name:"denomination",q_column:"ref_type_denomination",q_table:"any",label:tstring.denomination||"denomination",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"technique",name:"technique",q_column:"ref_type_technique",q_table:"types",label:tstring.technique||"technique",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"equivalents",name:"equivalents",q_column:"ref_type_equivalents",q_table:"types",eq_in:"%",eq_out:"%",label:tstring.equivalents||"equivalents",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"period",name:"period",label:tstring.period||"period",q_column:"p_period",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}});const r=common.create_dom_element({element_type:"div",class_name:"form-group field button_submit",parent:t});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.search||"Search",class_name:"btn btn-light btn-block primary",parent:r}).addEventListener("click",(function(t){t.preventDefault(),e.form_submit(a)}));const o=e.form.build_operators_node();t.appendChild(o);const a=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline"});return a.appendChild(t),a},load_mint_list:function(){return data_manager.request({body:{dedalo_get:"records",table:"catalog",ar_fields:["section_id","term AS name","parents"],lang:page_globals.WEB_CURRENT_LANG_CODE,limit:0,count:!1,order:"term ASC",sql_filter:"term_table='mints'"}})},activate_autocomplete:function(e){return this.form.activate_autocomplete({form_item:e,table:"catalog"})},form_submit:function(e,t){const n=this,r=t||n.form.form_items,o=n.rows_list_container,a=o.parentNode,l=common.create_dom_element({element_type:"div",class_name:"spinner",parent:a}),i=[];for(let[e,t]of Object.entries(r))!0===t.is_term&&i.push(t);const _=[];for(let[e,t]of Object.entries(r)){const e=!0===t.is_term?"$or":"$and",n={};if(n[e]=[],t.q.length>0){const r="$and",o={};o[r]=[];const a="string"==typeof t.q||t.q instanceof String?t.q.replace(/(')/g,"''"):t.q,l={field:t.q_column,value:`'%${a}%'`,op:t.eq};o[r].push(l),n[e].push(o)}if(t.q_selected.length>0)for(let r=0;r<t.q_selected.length;r++){const o=t.q_selected[r].replace(/(')/g,"''"),a="$and",l={};l[a]=[];const i={field:t.q_column,value:!0===t.is_term?`'%"${o}"%'`:`'${o}'`,op:!0===t.is_term?"LIKE":"="};l[a].push(i),n[e].push(l)}n[e].length>0&&_.push(n)}if(!0===SHOW_DEBUG&&console.log("ar_query_elements:",_),_.length<1)return l.remove(),!1;n.export_data_buttons||(n.export_data_buttons=page.render_export_data_buttons(),n.export_data_container.appendChild(n.export_data_buttons),n.export_data_container.classList.add("hide")),o.classList.add("loading"),a&&a.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"});const s={};s[e.querySelector('input[name="operators"]:checked').value]=_;return n.search_rows({filter:s,limit:0,process_result:{fn:"process_result::add_parents_and_children_recursive",columns:[{name:"parents"}]}}).then((e=>{for(;o.hasChildNodes();)o.removeChild(o.lastChild);o.classList.remove("loading"),l.remove(),n.draw_rows({target:n.rows_list_container,ar_rows:e}).then((function(){n.export_data_container.classList.remove("hide")}))}))},search_rows:function(e){const t=e.filter||null,n=e.ar_fields||["*"],r=e.order||"norder ASC",o=page_globals.WEB_CURRENT_LANG_CODE,a=e.process_result||null,l=null!=e.limit?e.limit:30;return new Promise((function(e){const i=[],_=function(e){if(e){const t=Object.keys(e)[0],n=e[t],r=[],o=n.length;for(let e=0;e<o;e++){const t=n[e],o=Object.keys(t)[0];if("$and"===o||"$or"===o){const e=""+_(t);r.push(e);continue}let a;a="MATCH"===t.op?"MATCH ("+t.field+") AGAINST ("+t.value+" IN BOOLEAN MODE)":-1!==t.field.indexOf("AS")?t.field+" "+t.op+" "+t.value:"`"+t.field+"` "+t.op+" "+t.value,r.push(a),t.group&&i.push(t.group)}const a="$and"===t?"AND":"$or"===t?"OR":null;return r.join(" "+a+" ")}return null},s=_(t);!0===SHOW_DEBUG&&(console.log("--- search_rows parsed sql_filter:"),console.log(s));const c={dedalo_get:"records",table:"catalog",ar_fields:n,lang:o,sql_filter:s,limit:l,group:i.length>0?i.join(","):null,count:!1,order:r,process_result:a};data_manager.request({body:c}).then((t=>{console.log("--- search_rows API response:",t);const n=page.parse_catalog_data(t.result);event_manager.publish("data_request_done",{request_body:c,result:n,export_data_parser:page.export_parse_catalog_data}),e(n)}))}))},draw_rows:function(e){const t=this,n=e.target,r=e.ar_rows||[];return new Promise((function(e){t.search_options.total,t.search_options.limit,t.search_options.offset;const o=n;if(r.length<1){for(;o.hasChildNodes();)o.removeChild(o.lastChild);common.create_dom_element({element_type:"div",class_name:"no_results_found",inner_html:tstring.no_results_found||"No results found",parent:o});return window.scrollTo(0,0),e(o),!1}return async function(){const e=new DocumentFragment,n=r.filter((e=>"mints"===e.term_table)),o=[];for(let e=0;e<n.length;e++){const t=void 0!==n[e].parent[0]?n[e].parent[0]:null,a=t?r.find((e=>e.section_id==t)):null;if(!a){console.warn("mint don't have public parent:",n[e]);continue}void 0===o.find((e=>e.section_id==t))&&o.push(a)}for(let n=0;n<o.length;n++){t.get_children(r,o[n],e)}return e}().then((t=>{for(;o.hasChildNodes();)o.removeChild(o.lastChild);o.appendChild(t),setTimeout((function(){const e=o;page.activate_images_gallery(e,!0)}),600),e(o)})),!0}))},get_children:function(e,t,n){const r=this,o=t.children,a=common.create_dom_element({element_type:"div",class_name:"children_contanier"});if(n.appendChild(a),o)for(let t=0;t<o.length;t++)r.get_child(e,o[t],a)},get_child:function(e,t,n){const r=this,o=e.find((e=>e.section_id==t));if(o){const t=r.render_rows(o,e);n.appendChild(t),o.children&&(r.get_children(e,o,t),t.addEventListener("mouseup",(e=>{e.preventDefault();if(("SPAN"===e.target.tagName?e.target.parentNode:e.target)===t.firstChild){t.querySelector(".children_contanier").classList.toggle("hide")}}),!1))}},render_rows:function(e,t){SHOW_DEBUG,catalog_row_fields.ar_rows=t;return catalog_row_fields.draw_item(e)},get_catalog_range_years:function(){return new Promise((function(e){const t={dedalo_get:"records",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,table:"catalog",ar_fields:["id","section_id","MIN(ref_date_in + 0) AS min","MAX(ref_date_in + 0) AS max"],limit:0,count:!1,offset:0,order:"id ASC"};data_manager.request({body:t}).then((function(t){console.log("-> get_catalog_range_years api_response:",t);let n=0,r=0;if(t.result)for(let e=0;e<t.result.length;e++){const o=t.result[e],a=parseInt(o.min);(0===n||a<n)&&(n=a);r=parseInt(o.max)}e({min:n,max:r})}))}))}};