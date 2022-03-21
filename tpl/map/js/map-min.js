"use strict";var map={form_container:null,rows_container:null,map_container:null,export_data_container:null,map_factory_instance:null,master_map_global_data:null,current_map_global_data:null,global_data:null,map_global_data:null,form:null,forn_node:null,map_config:null,set_up:function(e){SHOW_DEBUG;const t=this;t.form_container=e.form_container,t.map_container=e.map_container,t.rows_container=e.rows_container,t.export_data_container=e.export_data_container;const n=page.render_export_data_buttons();t.export_data_container.appendChild(n),t.export_data_container.classList.add("hide"),t.source_maps=[{name:"DARE",url:"//dh.gu.se/tiles/imperium/{z}/{x}/{y}.png",options:{maxZoom:11}},{name:"OSM",url:"//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",options:{maxZoom:19}},{name:"Map Tiles",url:"https://api.maptiler.com/maps/basic/256/{z}/{x}/{y}@2x.png?key=udlBrEEE2SPm1In5dCNb",options:{maxZoom:20},default:!0},{name:"ARCGIS",url:"//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",options:{}}],t.map_factory_instance=new map_factory,t.map_factory_instance.init({map_container:t.map_container,map_position:null,popup_builder:page.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:t.source_maps,legend:page.render_map_legend});const a={dedalo_get:"records",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,table:"map_global",ar_fields:"*",sql_filter:"coins_list IS NOT NULL AND types_list IS NOT NULL AND georef_geojson IS NOT NULL",limit:0,count:!1,offset:0,order:null};data_manager.request({body:a}).then((e=>{if(e.result){t.master_map_global_data=page.parse_map_global_data(e.result),t.current_map_global_data=t.master_map_global_data;const n=t.current_map_global_data.filter((function(e){return null!==e.item})).map((function(e){return e.item}));t.map_factory_instance.parse_data_to_map(n).then((function(){t.map_container.classList.remove("hide_opacity")}))}event_manager.publish("initial_map_loaded")})),t.form=new form_factory;const o=t.render_form();t.form_container.appendChild(o),t.set_config();return document.getElementById("search_icon").addEventListener("mousedown",(function(){let e;!0===t.map_config.showing_search?(o.classList.add("hide"),e=!1):(o.classList.remove("hide"),e=!0),t.set_config({showing_search:e})})),!0===t.map_config.showing_search?o.classList.remove("hide"):o.classList.add("hide"),event_manager.subscribe("map_selected_marker",(function(e){const n=void 0!==e.item.group[0]?e.item.group[0]:null;if(n){for(;t.rows_container.hasChildNodes();)t.rows_container.removeChild(t.rows_container.lastChild);const e=common.create_dom_element({element_type:"div",class_name:"spinner",parent:t.rows_container});t.load_map_selection_info(n).then((function(n){if(n){const a=t.render_types_list({global_data_item:n.global_data_item,types_rows:n.types_rows,coins_rows:n.coins_rows,info:n.info});t.rows_container.appendChild(a),e.remove(),setTimeout((function(){const e=t.rows_container;page.activate_images_gallery(e,!0)}),600)}else e.remove();t.map_container.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"}),t.export_data_container.classList.remove("hide")}))}})),!0},set_config:function(e){const t=this,n=localStorage.getItem("map_config");if(n)t.map_config=JSON.parse(n);else{const e={showing_search:!1};localStorage.setItem("map_config",JSON.stringify(e)),t.map_config=e}if(e){for(const n in e)t.map_config[n]=e[n];localStorage.setItem("map_config",JSON.stringify(t.map_config))}return t.map_config},render_form:function(){const e=this,t=new DocumentFragment,n=common.create_dom_element({element_type:"div",class_name:"form-row fields",parent:t});common.create_dom_element({element_type:"div",class_name:"golden-separator",parent:n}),e.form.item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"mint",eq:"LIKE",eq_in:"%",eq_out:"%",q_selected_eq:"LIKE",parent:n,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"collection",name:"collection",label:tstring.collection||"collection",q_column:"collection",eq:"LIKE",eq_in:"%",eq_out:"%",parent:n,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"findspot",name:"findspot",label:tstring.findspot||"findspot",q_column:"findspot",eq:"LIKE",eq_in:"%",eq_out:"%",parent:n,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"hoard",name:"hoard",label:tstring.hoard||"hoard",q_column:"hoard",eq:"LIKE",eq_in:"%",eq_out:"%",parent:n,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"material",name:"material",label:tstring.material||"Material",q_column:"material",eq:"LIKE",eq_in:"%",eq_out:"%",parent:n,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"denomination",name:"denomination",label:tstring.denomination||"Denomination",q_column:"denomination",eq:"LIKE",eq_in:"%",eq_out:"%",parent:n,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"range_slider",name:"range_slider",input_type:"range_slider",label:tstring.dating||"Dating",class_name:"range_slider",q_column:"date_in,dating_end",sql_filter:null,parent:n,callback:function(t){const n=t.node_input,a=n.parentNode.querySelector("#range_slider_in"),o=n.parentNode.querySelector("#range_slider_out");event_manager.subscribe("initial_map_loaded",(function(){e.get_range_years().then((function(e){$(n).slider("instance")&&$(n).slider("destroy"),t.sql_filter=null,a.value=e.min,a.addEventListener("change",(function(t){const a=t.target.value>=e.min?t.target.value:e.min;$(n).slider("values",0,a),t.target.value=a})),o.value=e.max,o.addEventListener("change",(function(t){const a=t.target.value<=e.max?t.target.value:e.max;$(n).slider("values",1,t.target.value),t.target.value=a})),$(n).slider({range:!0,min:e.min,max:e.max,step:1,values:[e.min,e.max],slide:function(e,t){a.value=t.values[0],o.value=t.values[1]},change:function(e,n){t.sql_filter="(date_in >= "+n.values[0]+" AND date_in <= "+n.values[1]+")",t.q=n.value}})}))}))}});const a=common.create_dom_element({element_type:"div",class_name:"form-group field button_submit",parent:t});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.search||"Search",class_name:"btn btn-light btn-block primary",parent:a}).addEventListener("click",(function(t){t.preventDefault(),e.form_submit()}));const o=e.form.build_operators_node();return t.appendChild(o),e.form.node=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline form_factory"}),e.form.node.appendChild(t),e.form.node},form_submit:function(){const e=this,t=e.form.node;if(!t)return new Promise((function(e){console.error("Error on submit. Invalid form_node.",t),e(!1)}));for(;e.rows_container.hasChildNodes();)e.rows_container.removeChild(e.rows_container.lastChild);return e.map_container.classList.add("loading"),new Promise((function(t){const n=e.form.build_filter(),a=e.form.parse_sql_filter(n,[]),o=a?"("+a+")":null;SHOW_DEBUG,data_manager.request({body:{dedalo_get:"records",table:"coins",ar_fields:["section_id","mint_data","hoard_data","findspot_data","type_data"],sql_filter:o+" AND type_data IS NOT NULL",limit:0,count:!1,offset:0,order:"section_id ASC",process_result:null}}).then((function(n){if(n.result){e.current_map_global_data=e.distribute_coins(n.result);const t=e.current_map_global_data.map((function(e){return e.item}));e.map_factory_instance.init({map_container:e.map_container,map_position:null,popup_builder:page.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:e.source_maps,legend:page.render_map_legend}),e.map_factory_instance.parse_data_to_map(t,null)}e.map_container.classList.remove("loading"),t(!0)}))}))},distribute_coins:function(e){const t=this;if(!e)return!1;const n=[],a=t.master_map_global_data.length;for(let o=0;o<a;o++){const a=t.master_map_global_data[o];let i=[];switch(a.table){case"mints":i=e.filter((function(e){return e.mint_data&&-1!==e.mint_data.indexOf('"'+a.ref_section_id+'"')}));break;case"hoards":i=e.filter((function(e){return'["'+a.ref_section_id+'"]'==e.hoard_data}));break;case"findspots":i=e.filter((function(e){return'["'+a.ref_section_id+'"]'==e.findspot_data}))}if(i.length<1)continue;const r=i.map((function(e){return e.section_id})),s=[];for(let e=0;e<i.length;e++){const t=i[e].type_data?JSON.parse(i[e].type_data):null;t&&-1===s.indexOf(t[0])&&s.push(t[0])}const l=JSON.parse(JSON.stringify(a));l.coins_list=r,l.types_list=s;const _=l.coins_list?l.coins_list.length:0,c=l.types_list?l.types_list.length:0,m=(tstring.coins||"Coins")+": "+_+"<br>"+(tstring.types||"Types")+": "+c;l.item.data.coins_total=_,l.item.data.types_total=c,l.item.data.description=m,n.push(l)}return n},load_map_selection_info:function(e){const t=this;return new Promise((function(n){const a=t.current_map_global_data.find((function(t){return t.section_id==e.term_id}));if(!a||!a.types_list||a.types_list.length<1)return console.warn("Ignored invalid item. Not found item or item.types_list in global_data! ",e.name,e),n(!1),!1;const o=a.coins_list,i=a.types_list,r=[],s=i.map((function(e){return"'[\""+e+"\"]'"})),l="term_table='types' AND term_data IN("+s.join(",")+") AND coin_references IS NOT NULL",_={dedalo_get:"records",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,table:"catalog",ar_fields:["*"],sql_filter:l,limit:0,count:!1,offset:0,order:"term ASC"};r.push({id:"catalog_request",options:_});const c={dedalo_get:"records",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,table:"coins",ar_fields:["*"],sql_filter:"section_id IN("+o.join(",")+")",limit:0,count:!1,offset:0,order:null,resolve_portals_custom:{bibliography_data:"bibliographic_references"}};r.push({id:"coins_request",options:c}),data_manager.request({body:{dedalo_get:"combi",ar_calls:r}}).then((e=>{const t=e.result.find((function(e){return"catalog_request"===e.id})),r=page.parse_catalog_data(t.result),s=e.result.find((function(e){return"coins_request"===e.id})),l=page.parse_coin_data(s.result);event_manager.publish("data_request_done",{request_body:null,result:{catalog:r,coins:l,map_item:{coins_list:o,types_list:i}},export_data_parser:page.export_parse_map_data}),n({global_data_item:a,types_rows:r,coins_rows:l,info:{coins_list:o,types_list:i}})}))}))},render_types_list:function(e){const t=e.global_data_item,n=e.types_rows,a=e.coins_rows,o=new DocumentFragment,i=common.create_dom_element({element_type:"div",class_name:"types_list_wrapper",parent:o}),r=common.create_dom_element({element_type:"div",class_name:"line-tittle-wrap",parent:i});let s;switch(t.table){case"mints":s="mint";break;case"hoards":s="hoard";break;case"findspots":s="findspot"}const l='<span class="note">'+tstring[s]+": </span>"+t.name;if(common.create_dom_element({element_type:"div",class_name:"line-tittle golden-color",inner_html:l,parent:r}),common.create_dom_element({element_type:"div",class_name:"golden-separator",parent:o}),n&&n.length>0){const e=common.create_dom_element({element_type:"div",class_name:"types_wrap",parent:o}),t=function(e,t){const n=[];for(let a=t.length-1;a>=0;a--){const o=t[a],i=e.find((function(e){return e.section_id==o}));i&&n.push(i)}return n};let i=null;n.sort(((e,t)=>e.p_mint>t.p_mint?1:-1));for(let o=n.length-1;o>=0;o--){const r=n[o],l=r.coin_references?t(a,r.coin_references):[];if("mint"!==s){const t=r.p_mint&&Array.isArray(r.p_mint)?r.p_mint.join(" - "):null;t&&t!==i&&(common.create_dom_element({element_type:"div",class_name:"mint_line line-tittle golden-color",inner_html:t,parent:e}),i=t)}const _=catalog_row_fields.draw_item(r);e.appendChild(_);const c=l.length;if(c>0){const t=common.create_dom_element({element_type:"div",class_name:"coins_wrap",parent:e});common.create_dom_element({element_type:"div",class_name:"button_show_coins",inner_html:(tstring.coins||"Coins")+" ("+c+")",parent:t}).addEventListener("click",(function(){n.classList.toggle("hide"),this.classList.toggle("opened")}));const n=common.create_dom_element({element_type:"div",class_name:"coins_list gallery",parent:t});for(let e=0;e<l.length;e++){const t=l[e],a=type_row_fields.draw_coin(t);n.appendChild(a)}}}}else if(!0===SHOW_DEBUG){let e="found types "+JSON.stringify(n,null,2);e+="<br>found coins "+JSON.stringify(a.map((e=>e.section_id)),null,2),e+="<br>map_global <pre>"+JSON.stringify(t,null,3)+"</pre>",common.create_dom_element({element_type:"div",class_name:"debug_info ",inner_html:e,parent:o})}return o},get_range_years:function(){return new Promise((function(e){const t={dedalo_get:"records",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,table:"coins",ar_fields:["id","section_id","MIN(date_in + 0) AS min","MAX(date_in + 0) AS max"],limit:0,count:!1,offset:0,order:"id ASC"};data_manager.request({body:t}).then((function(t){let n=0,a=0;if(t.result)for(let e=0;e<t.result.length;e++){const o=t.result[e],i=parseInt(o.min);(0===n||i<n)&&(n=i);a=parseInt(o.max)}e({min:n,max:a})}))}))}};