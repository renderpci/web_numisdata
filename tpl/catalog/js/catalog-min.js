"use strict";var catalog={trigger_url:page_globals.__WEB_TEMPLATE_WEB__+"/catalog/trigger.catalog.php",search_options:{},selected_term_table:null,filters:{},filter_op:"AND",draw_delay:1,form:null,set_up:function(e){const t=this,n=document.getElementById("items_container"),o=t.render_form();if(n.appendChild(o),e.global_search&&e.global_search.length>1){const n=document.getElementById("global_search");n&&(n.value=e.global_search,event_manager.fire_event(n,"change"),t.form_submit(o))}else e.item_type.length>1&&(console.log(e.item_type),console.log(e.label),console.log(e.value),t.add_selected_value(t.form.form_items[e.item_type],e.label,e.value),t.form_submit(o));return!0},render_form:function(){const e=this,t=new DocumentFragment;e.form=e.form||new form_factory;const n=common.create_dom_element({element_type:"div",class_name:"form-row fields",parent:t});e.form.item_factory({id:"global_search",name:"global_search",label:tstring.global_search||"global_search",q_column:"global_search",eq:"MATCH",eq_in:"",eq_out:"",class_name:"global_search",parent:n,callback:function(t){let n;common.create_dom_element({element_type:"div",class_name:"search_operators_info",parent:t.parentNode}).addEventListener("click",(function(o){if(o.stopPropagation(),n)return n.remove(),void(n=null);n=e.form.full_text_search_operators_info(),t.parentNode.appendChild(n)})),window.addEventListener("click",(function(e){n&&!t.contains(e.target)&&(n.remove(),n=null)}))}});e.form.item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"p_mint",eq:"LIKE",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"period",name:"period",label:tstring.period||"period",q_column:"p_period",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"culture",name:"culture",label:tstring.culture||"culture",q_column:"p_culture",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"creator",name:"creator",label:tstring.creator||"creator",q_column:"p_creator",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"design_obverse",name:"design_obverse",label:tstring.design_obverse||"design obverse",q_column:"ref_type_design_obverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"design_reverse",name:"design_reverse",label:tstring.design_reverse||"design reverse",q_column:"ref_type_design_reverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"symbol_obverse",name:"symbol_obverse",label:tstring.symbol_obverse||"symbol obverse",q_column:"ref_type_symbol_obverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"symbol_reverse",name:"symbol_reverse",label:tstring.symbol_reverse||"symbol reverse",q_column:"ref_type_symbol_reverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"legend_obverse",name:"legend_obverse",label:tstring.legend_obverse||"legend obverse",q_column:"ref_type_legend_obverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"legend_reverse",name:"legend_reverse",label:tstring.legend_reverse||"legend reverse",q_column:"ref_type_legend_reverse",eq_in:"%",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"territory",name:"territory",label:tstring.territory||"territory",q_column:"p_territory",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"group",name:"group",label:tstring.group||"group",q_column:"p_group",eq_in:"%",is_term:!0,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"material",name:"material",q_column:"ref_type_material",q_table:"any",label:tstring.material||"material",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"collection",name:"collection",q_column:"ref_coins_collection",q_table:"any",label:tstring.collection||"collection",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"denomination",name:"denomination",q_column:"ref_type_denomination",q_table:"any",label:tstring.denomination||"denomination",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"number",name:"number",q_column:"term",q_table:"types",label:tstring.number||"number",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"company",name:"company",q_column:"ref_coins_auction_company",q_table:"types",label:tstring.company||"company",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"technique",name:"technique",q_column:"ref_type_technique",q_table:"types",label:tstring.technique||"technique",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}}),e.form.item_factory({id:"equivalents",name:"equivalents",q_column:"ref_type_equivalents",q_table:"types",eq_in:"%",eq_out:"%",label:tstring.equivalents||"equivalents",is_term:!1,parent:n,callback:function(t){e.activate_autocomplete(t)}});const o=common.create_dom_element({element_type:"div",class_name:"form-group field button_submit",parent:t});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.search||"Search",class_name:"btn btn-light btn-block primary",parent:o}).addEventListener("click",(function(t){t.preventDefault(),e.form_submit(l)}));const r=e.form.build_operators_node();t.appendChild(r);const l=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline"});return l.appendChild(t),l},add_selected_value:function(e,t,n){const o=e.node_values,r=o.querySelectorAll(".input_values");for(let e=r.length-1;e>=0;e--)if(n===r[e].value)return!1;const l=common.create_dom_element({element_type:"div",class_name:"line_value",parent:o});common.create_dom_element({element_type:"i",class_name:"icon fa-trash",parent:l}).addEventListener("click",(function(){const t=e.q_selected.indexOf(n);t>-1&&(e.q_selected.splice(t,1),this.parentNode.remove(),!0===SHOW_DEBUG&&console.log("form_item.q_selected removed value:",n,e.q_selected))}));common.create_dom_element({element_type:"span",class_name:"value_label",inner_html:t,parent:l});return common.create_dom_element({element_type:"input",class_name:"input_values",parent:l}).value=n,e.q_selected.push(n),e.node_input.value="",e.q="",!0},activate_autocomplete:function(e){const t=this;let n;!function(e){var t=e.ui.autocomplete.prototype,n=t._initSource;e.extend(t,{_initSource:function(){this.options.html&&e.isArray(this.options.source)?this.source=function(t,n){var o,r,l;n((o=this.options.source,r=t.term,l=new RegExp(e.ui.autocomplete.escapeRegex(r),"i"),e.grep(o,(function(t){return l.test(e("<div>").html(t.label||t.value||t).text())}))))}:n.call(this)},_renderItem:function(t,n){for(var o=n.label,r=o.split(" | "),l=[],a=0;a<r.length;a++){var i=r[a];i.length>1&&"<i>.</i>"!==i&&l.push(i)}return o=l.join(" | "),e("<li></li>").data("item.autocomplete",n).append(e("<div></div>")[this.options.html?"html":"text"](o)).appendTo(t)}})}(jQuery);const o={};return $(e).autocomplete({delay:150,minLength:0,html:!0,source:function(r,l){const a=r.term;n=t.form.form_items[e.id];n.q_name;const i=n.q_column,c={AND:[]},s=(n.eq_in||"")+a+(n.eq_out||"%");c.AND.push({field:i,value:`'${s}'`,op:n.eq,group:i});const _={OR:[]};for(let[e,o]of Object.entries(t.form.form_items))if(o.id!==n.id){if(o.q.length>0){const e=o.q;_.OR.push({field:o.q_column,value:`'%${e}%'`,op:"LIKE"})}if(o.q_selected.length>0)for(let e=0;e<o.q_selected.length;e++){const t=o.q_selected[e];_.OR.push({field:o.q_column,value:!0===o.is_term?`'%"${t}"%'`:`'${t}'`,op:!0===o.is_term?"LIKE":"="})}}if(_.OR.length>0&&c.AND.push(_),1===c.AND.length&&a in o)return!0===SHOW_DEBUG&&console.warn("Returning values from cache:",o[a]),void l(o[a]);t.search_rows({filter:c,ar_fields:[i+" AS name"],limit:30,order:"name ASC"}).then(e=>{const t=[],n=e.result.length;for(let o=0;o<n;o++){const n=e.result[o],r=0===n.name.indexOf('["')?JSON.parse(n.name):[n.name];for(let e=0;e<r.length;e++){const n=r[e];t.find(e=>e.value===n)||t.push({label:n,value:n})}}const r=function(e,t){return e.map((function(e){return e.label=e.label.replace(/<br>/g," "),e.label=page.parse_legend_svg(e.label),e}))}(t);1===c.AND.length&&(o[a]=r),SHOW_DEBUG,l(r)})},select:function(e,o){return e.preventDefault(),t.add_selected_value(n,o.item.label,o.item.value),this.value="",!1},focus:function(){return!1},close:function(e,t){},change:function(e,t){},response:function(e,t){}}).on("keydown",(function(e){e.keyCode===$.ui.keyCode.ENTER&&$(this).autocomplete("close")})).focus((function(){$(this).autocomplete("search",null)})),!0},form_submit:function(e){const t=this,n=t.form.form_items,o=document.querySelector(".result"),r=o.querySelector("#rows_list");page.add_spinner(o);const l=[];for(let[e,t]of Object.entries(n))!0===t.is_term&&l.push(t);const a=[];for(let[e,t]of Object.entries(n)){const e=!0===t.is_term?"OR":"AND",n={};if(n[e]=[],t.q.length>0){const o="AND",r={};r[o]=[];const l={field:t.q_column,value:`'%${t.q}%'`,op:t.eq};r[o].push(l),n[e].push(r)}if(t.q_selected.length>0)for(let o=0;o<t.q_selected.length;o++){const r=t.q_selected[o].replace(/(')/g,"''"),l="AND",a={};a[l]=[];const i={field:t.q_column,value:!0===t.is_term?`'%"${r}"%'`:`'${r}'`,op:!0===t.is_term?"LIKE":"="};a[l].push(i),n[e].push(a)}n[e].length>0&&a.push(n)}if(SHOW_DEBUG,a.length<1)return page.remove_spinner(o),!1;r.classList.add("loading"),o&&o.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"});const i={};i[e.querySelector('input[name="operators"]:checked').value]=a;return t.search_rows({filter:i,limit:0,process_result:{fn:"process_result::add_parents_and_children_recursive",columns:[{name:"parents"}]}}).then(e=>{console.log("--- form_submit response:",e);const n=page.parse_catalog_data(e.result);setTimeout(()=>{for(;r.hasChildNodes();)r.removeChild(r.lastChild);r.classList.remove("loading"),page.remove_spinner(o),t.draw_rows({target:"rows_list",ar_rows:n}).then((function(){}))},t.draw_delay)})},search_rows:function(e){const t=e.filter||null,n=e.ar_fields||["*"],o=e.order||"norder ASC",r=page_globals.WEB_CURRENT_LANG_CODE,l=e.process_result||null,a=null!=e.limit?e.limit:30,i=[],c=function(e){if(e){const t=Object.keys(e)[0],n=e[t],o=[],r=n.length;for(let e=0;e<r;e++){const t=n[e],r=Object.keys(t)[0];if("AND"===r||"OR"===r){const e=""+c(t);o.push(e);continue}let l;l="MATCH"===t.op?"MATCH ("+t.field+") AGAINST ("+t.value+" IN BOOLEAN MODE)":-1!==t.field.indexOf("AS")?t.field+" "+t.op+" "+t.value:"`"+t.field+"` "+t.op+" "+t.value,o.push(l),t.group&&i.push(t.group)}return o.join(" "+t+" ")}return null},s=c(t);!0===SHOW_DEBUG&&(console.log("--- search_rows parsed sql_filter:"),console.log(s));return data_manager.request({body:{dedalo_get:"records",table:"catalog",ar_fields:n,lang:r,sql_filter:s,limit:a,group:i.length>0?i.join(","):null,count:!1,order:o,process_result:l}})},draw_rows:function(e){const t=this;return new Promise((function(n){const o=e.target,r=e.ar_rows||[],l=(r.length,t.search_options.total,t.search_options.limit,t.search_options.offset,document.getElementById(o));return async function(){const e=new DocumentFragment,n=r.filter(e=>"mints"===e.term_table),o=[];for(let e=0;e<n.length;e++){const t=void 0!==n[e].parent[0]?n[e].parent[0]:null,l=t?r.find(e=>e.section_id===t):null;if(!l){console.warn("mint don't have public parent:",n[e]);continue}void 0===o.find(e=>e.section_id===t)&&o.push(l)}for(let n=0;n<o.length;n++){t.get_children(r,o[n],e)}return e}().then(e=>{for(;l.hasChildNodes();)l.removeChild(l.lastChild);l.appendChild(e);const t=l;page.activate_images_gallery(t,!0),n(l)}),!0}))},get_children:function(e,t,n){const o=this,r=t.children,l=common.create_dom_element({element_type:"div",class_name:"children_contanier"});if(n.appendChild(l),r)for(let t=0;t<r.length;t++)o.get_child(e,r[t],l)},get_child:function(e,t,n){const o=this,r=e.find(e=>e.section_id===t);if(r){const t=o.render_rows(r,e);n.appendChild(t),r.children&&(o.get_children(e,r,t),t.addEventListener("mouseup",e=>{e.preventDefault();if(("SPAN"===e.target.tagName?e.target.parentNode:e.target)===t.firstChild){t.querySelector(".children_contanier").classList.toggle("hide")}},!1))}},render_rows:function(e,t){SHOW_DEBUG,catalog_row_fields.ar_rows=t;return catalog_row_fields.draw_item(e)}};