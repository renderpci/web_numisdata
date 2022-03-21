"use strict";var catalog={trigger_url:page_globals.__WEB_TEMPLATE_WEB__+"/catalog/trigger.catalog.php",search_options:{},selected_term_table:null,filters:{},filter_op:"AND",draw_delay:1,form:null,rows_list_container:null,export_data_container:null,set_up:function(e){const t=this,r=e.rows_list_container,a=e.export_data_container,n=e.form_items_container,o=e.psqo;t.rows_list_container=r,t.export_data_container=a,t.form_items_container=n;const _=t.render_form();if(t.form_items_container.appendChild(_),o&&o.length>1){const e=psqo_factory.decode_psqo(o);e&&(t.form.parse_psqo_to_form(e),t.form_submit(_,{scroll_result:!0}))}else t.load_mint_list().then((function(e){const r=e.result[Math.floor(Math.random()*e.result.length)],a=(new form_factory).item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"p_mint",eq:"=",eq_in:"",eq_out:"",q:`["${r.name}"]`,is_term:!0});t.form_submit(_,{form_items:[a],scroll_result:!0})}));return!0},render_form:function(){const e=this,t=new DocumentFragment;e.form=e.form||new form_factory;const r=common.create_dom_element({element_type:"div",class_name:"form-row fields",parent:t});e.form.item_factory({id:"global_search",name:"global_search",label:tstring.global_search||"global_search",q_column:"global_search",eq:"MATCH",eq_in:"",eq_out:"",class_name:"global_search",parent:r,callback:function(t){const r=t.node_input;let a;common.create_dom_element({element_type:"div",class_name:"search_operators_info",parent:r.parentNode}).addEventListener("click",(function(t){if(t.stopPropagation(),a)return a.remove(),void(a=null);a=e.form.full_text_search_operators_info(),r.parentNode.appendChild(a)})),window.addEventListener("click",(function(e){a&&!r.contains(e.target)&&(a.remove(),a=null)}))}}),e.form.item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"p_mint",value_wrapper:['["','"]'],eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!0,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"number",name:"number",q_column:"term",q_table:"types",label:tstring.number_key||"Number & Key",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"culture",name:"culture",label:tstring.culture||"culture",q_column:"p_culture",value_wrapper:['["','"]'],eq_in:"%",eq_out:"%",is_term:!0,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"role",name:"role",label:tstring.role||"role",q_column:"ref_type_creators_roles",value_split:"|",q_selected_eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"creator",name:"creator",label:tstring.creator||"creator",q_column:"ref_type_creators_full_name",value_split:" | ",q_selected_eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"design_obverse",name:"design_obverse",label:tstring.design_obverse||"design obverse",q_column:"ref_type_design_obverse",eq_in:"%",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"design_reverse",name:"design_reverse",label:tstring.design_reverse||"design reverse",q_column:"ref_type_design_reverse",eq_in:"%",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"symbol_obverse",name:"symbol_obverse",label:tstring.symbol_obverse||"symbol obverse",q_column:"ref_type_symbol_obverse",eq_in:"%",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"symbol_reverse",name:"symbol_reverse",label:tstring.symbol_reverse||"symbol reverse",q_column:"ref_type_symbol_reverse",eq_in:"%",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"iconography_obverse",name:"iconography_obverse",label:tstring.iconography_obverse||"iconography obverse",q_column:"ref_type_design_obverse_iconography",value_split:" - ",q_splittable:!0,q_selected_eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"iconography_reverse",name:"iconography_reverse",label:tstring.iconography_reverse||"iconography reverse",q_column:"ref_type_design_reverse_iconography",value_split:" - ",q_splittable:!0,q_selected_eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"legend_obverse",name:"legend_obverse",label:tstring.legend_obverse||"legend obverse",q_column:"ref_type_legend_obverse",q_column_filter:"ref_type_legend_transcription_obverse",eq_in:"%",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"legend_reverse",name:"legend_reverse",label:tstring.legend_reverse||"legend reverse",q_column:"ref_type_legend_reverse",q_column_filter:"ref_type_legend_transcription_reverse",eq_in:"%",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"territory",name:"territory",label:tstring.territory||"territory",q_column:"p_territory",eq_in:"%",is_term:!0,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"group",name:"group",label:tstring.group||"group",q_column:"p_group",eq_in:"%",is_term:!0,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"material",name:"material",q_column:"ref_type_material",q_table:"any",label:tstring.material||"material",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"denomination",name:"denomination",q_column:"ref_type_denomination",q_table:"any",label:tstring.denomination||"denomination",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"technique",name:"technique",q_column:"ref_type_technique",q_table:"types",label:tstring.technique||"technique",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"equivalents",name:"equivalents",q_column:"ref_type_equivalents",q_table:"types",eq_in:"%",eq_out:"%",label:tstring.equivalents||"equivalents",is_term:!1,parent:r,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"catalog"})}}),e.form.item_factory({id:"range_slider",name:"range_slider",input_type:"range_slider",label:tstring.period||"Period",class_name:"range_slider",q_column:"ref_date_in,ref_date_end",sql_filter:null,parent:r,callback:function(t){const r=t.node_input,a=r.parentNode.querySelector("#range_slider_in"),n=r.parentNode.querySelector("#range_slider_out");e.get_catalog_range_years().then((function(e){$(r).slider("instance")&&$(r).slider("destroy"),t.sql_filter=null,a.value=e.min,a.addEventListener("change",(function(t){const a=t.target.value>=e.min?t.target.value:e.min;$(r).slider("values",0,a),t.target.value=a})),n.value=e.max,n.addEventListener("change",(function(t){const a=t.target.value<=e.max?t.target.value:e.max;$(r).slider("values",1,t.target.value),t.target.value=a})),$(r).slider({range:!0,min:e.min,max:e.max,step:1,values:[e.min,e.max],slide:function(e,t){a.value=t.values[0],n.value=t.values[1]},change:function(e,r){t.sql_filter="(ref_date_in >= "+r.values[0]+" AND ref_date_in <= "+r.values[1]+")",t.q=r.value}})}))}}),e.form.item_factory({id:"ref_type_design_obverse_iconography_data",name:"ref_type_design_obverse_iconography_data",class_name:"hide",label:tstring.ref_type_design_obverse_iconography_data||"Design obverse iconography ID",q_column:"ref_type_design_obverse_iconography_data",q_selected_eq:"LIKE",eq_in:'%"',eq_out:'"%',is_term:!1,parent:r,callback:function(e){event_manager.subscribe("form_submit",(function(){e.q&&e.q.length>0?(e.node_input.parentNode.classList.remove("hide"),e.node_input.parentNode.querySelector("input").classList.remove("hide")):e.node_input.parentNode.classList.add("hide")}))}}),e.form.item_factory({id:"ref_type_design_reverse_iconography_data",name:"ref_type_design_reverse_iconography_data",class_name:"hide",label:tstring.ref_type_design_reverse_iconography_data||"Design reverse iconography ID",q_column:"ref_type_design_reverse_iconography_data",q_selected_eq:"LIKE",eq_in:'%"',eq_out:'"%',is_term:!1,parent:r,callback:function(e){event_manager.subscribe("form_submit",(function(){e.q&&e.q.length>0?(e.node_input.parentNode.classList.remove("hide"),e.node_input.parentNode.querySelector("input").classList.remove("hide")):e.node_input.parentNode.classList.add("hide")}))}}),e.form.item_factory({id:"ref_type_symbol_obverse_data",name:"ref_type_symbol_obverse_data",class_name:"hide",label:tstring.ref_type_symbol_obverse_data||"Symbol obverse ID",q_column:"ref_type_symbol_obverse_data",q_selected_eq:"LIKE",eq_in:'%"',eq_out:'"%',is_term:!1,parent:r,callback:function(e){event_manager.subscribe("form_submit",(function(){e.q&&e.q.length>0?(e.node_input.parentNode.classList.remove("hide"),e.node_input.parentNode.querySelector("input").classList.remove("hide")):e.node_input.parentNode.classList.add("hide")}))}}),e.form.item_factory({id:"ref_type_symbol_reverse_data",name:"ref_type_symbol_reverse_data",class_name:"hide",label:tstring.ref_type_symbol_reverse_data||"Symbol reverse ID",q_column:"ref_type_symbol_reverse_data",q_selected_eq:"LIKE",eq_in:'%"',eq_out:'"%',is_term:!1,parent:r,callback:function(e){event_manager.subscribe("form_submit",(function(){e.q&&e.q.length>0?(e.node_input.parentNode.classList.remove("hide"),e.node_input.parentNode.querySelector("input").classList.remove("hide")):e.node_input.parentNode.classList.add("hide")}))}});const a=common.create_dom_element({element_type:"div",class_name:"form-group field button_submit",parent:t});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.search||"Search",class_name:"btn btn-light btn-block primary",parent:a}).addEventListener("click",(function(t){t.preventDefault(),e.form_submit(o)}));const n=e.form.build_operators_node();t.appendChild(n);const o=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline"});return o.appendChild(t),o},load_mint_list:function(){return data_manager.request({body:{dedalo_get:"records",table:"catalog",ar_fields:["section_id","term AS name","parents"],lang:page_globals.WEB_CURRENT_LANG_CODE,limit:0,count:!1,order:"term ASC",sql_filter:"term_table='mints'"}})},form_submit:function(e,t={}){const r=this,a="boolean"!=typeof t.scroll_result||t.scroll_result,n=(t.form_items||r.form.form_items,r.rows_list_container),o=n.parentNode,_=common.create_dom_element({element_type:"div",class_name:"spinner",parent:o});n.classList.add("loading");const i=r.form.build_filter();if(!i||i.length<1)return _.remove(),n.classList.remove("loading"),!1;if(!r.export_data_buttons){r.export_data_buttons=page.render_export_data_buttons(),r.export_data_container.appendChild(r.export_data_buttons),r.export_data_container.classList.add("hide");const e=page.create_suggestions_button();r.export_data_container.appendChild(e)}o&&!0===a&&o.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"});return r.search_rows({filter:i,limit:0,process_result:{fn:"process_result::add_parents_and_children_recursive",columns:[{name:"parents"}]}}).then((e=>{for(event_manager.publish("form_submit",e);n.hasChildNodes();)n.removeChild(n.lastChild);n.classList.remove("loading"),_.remove(),r.draw_rows({target:r.rows_list_container,ar_rows:e}).then((function(){r.export_data_container.classList.remove("hide")}))}))},search_rows:function(e){const t=this,r=e.filter||null,a=e.ar_fields||["*"],n=e.order||"norder ASC",o=page_globals.WEB_CURRENT_LANG_CODE,_=e.process_result||null,i=null!=e.limit?e.limit:30;return new Promise((function(e){const l=[],s=t.form.parse_sql_filter(r);SHOW_DEBUG;const c={dedalo_get:"records",table:"catalog",ar_fields:a,lang:o,sql_filter:s,limit:i,group:l.length>0?l.join(","):null,count:!1,order:n,process_result:_};data_manager.request({body:c}).then((t=>{const a=page.parse_catalog_data(t.result);event_manager.publish("data_request_done",{request_body:c,result:a,export_data_parser:page.export_parse_catalog_data,filter:r}),e(a)}))}))},draw_rows:function(e){const t=this,r=e.target,a=e.ar_rows||[];return new Promise((function(e){const n=r;if(a.length<1){for(;n.hasChildNodes();)n.removeChild(n.lastChild);return common.create_dom_element({element_type:"div",class_name:"no_results_found",inner_html:tstring.no_results_found||"No results found",parent:n}),window.scrollTo(0,0),e(n),!1}return async function(){const e=new DocumentFragment,r=a.filter((e=>"mints"===e.term_table)),n=[];for(let e=0;e<r.length;e++){const t=r[e].parent&&void 0!==r[e].parent[0]?r[e].parent[0]:null,o=t?a.find((e=>e.section_id==t)):null;if(!o){console.warn("mint don't have public parent:",r[e]);continue}void 0===n.find((e=>e.section_id==t))&&n.push(o)}for(let r=0;r<n.length;r++)t.get_children(a,n[r],e);return e}().then((t=>{for(;n.hasChildNodes();)n.removeChild(n.lastChild);n.appendChild(t),setTimeout((function(){const e=n;page.activate_images_gallery(e,!0)}),600),e(n)})),!0}))},get_children:function(e,t,r){const a=this,n=t.children,o=common.create_dom_element({element_type:"div",class_name:"children_contanier"});if(r.appendChild(o),n)for(let t=0;t<n.length;t++)a.get_child(e,n[t],o)},get_child:function(e,t,r){const a=this,n=e.find((e=>e.section_id==t));if(n){const t=a.render_rows(n,e);r.appendChild(t),n.children&&(a.get_children(e,n,t),t.addEventListener("mouseup",(e=>{e.preventDefault();if(("SPAN"===e.target.tagName?e.target.parentNode:e.target)===t.firstChild){t.querySelector(".children_contanier").classList.toggle("hide")}}),!1))}},render_rows:function(e,t){SHOW_DEBUG,catalog_row_fields.ar_rows=t;return catalog_row_fields.draw_item(e)},get_catalog_range_years:function(){return new Promise((function(e){const t={dedalo_get:"records",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,table:"catalog",ar_fields:["id","section_id","MIN(ref_date_in + 0) AS min","MAX(ref_date_in + 0) AS max"],limit:0,count:!1,offset:0,order:"id ASC"};data_manager.request({body:t}).then((function(t){let r=0,a=0;if(t.result)for(let e=0;e<t.result.length;e++){const n=t.result[e],o=parseInt(n.min);(0===r||o<r)&&(r=o);a=parseInt(n.max)}e({min:r,max:a})}))}))}};
//# sourceMappingURL=catalog-min.js.map