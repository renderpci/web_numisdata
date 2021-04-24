"use strict";var mint={section_id:null,export_data_container:null,set_up:function(e){const t=this;t.export_data_container=e.export_data_container,t.section_id=e.section_id;const n=page.render_export_data_buttons();return t.export_data_container.appendChild(n),t.export_data_container.classList.add("hide"),t.section_id&&t.get_row_data({section_id:t.section_id}).then((function(e){console.log("--\x3e set_up get_row_data API response:",e.result);const n=e.result.find((e=>"mint"===e.id));if(t.draw_row({target:document.getElementById("row_detail"),ar_rows:n.result}),void 0!==n.result[0]){const e=page.parse_mint_data(n.result[0]);e.georef_geojson&&t.draw_map({mint_map_data:e.georef_geojson,mint_popup_data:{section_id:e.section_id,title:e.name,description:e.history.trim()},place_data:e.place_data})}const a=e.result.find((e=>"mint_catalog"===e.id));if(a.result){const e=a.result.find((e=>"mints"===e.term_table));e&&e.section_id?t.get_types_data2({section_id:e.section_id}).then((function(n){const a=t.draw_types2({ar_rows:n,mint_section_id:e.section_id});if(a){const e=document.getElementById("types");e.appendChild(a),page.activate_images_gallery(e)}})):(console.warn("Ignored invalid _mint_catalog:",e),console.warn("mint_catalog:",a))}event_manager.publish("data_request_done",{request_body:null,result:{mint:n.result,mint_catalog:a.result},export_data_parser:page.export_parse_mint_data}),t.export_data_container.classList.remove("hide")})),!0},get_row_data:function(e){const t=e.section_id,n=[];n.push({id:"mint",options:{dedalo_get:"records",table:"mints",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","lang","name","place_data","place","history","bibliography_data","map","georef_geojson"],sql_filter:"section_id = "+parseInt(t),count:!1,resolve_portals_custom:{bibliography_data:"bibliographic_references"}}}),n.push({id:"mint_catalog",options:{dedalo_get:"records",table:"catalog",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","term","term_table"],count:!1,limit:0,sql_filter:"term_data='[\""+parseInt(t)+"\"]'"}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:n}})},get_types_data2:function(e){const t=e.section_id;return new Promise((function(e){const n={dedalo_get:"records",table:"catalog",ar_fields:["*"],lang:page_globals.WEB_CURRENT_LANG_CODE,sql_filter:"section_id = "+parseInt(t),limit:0,group:null,count:!1,order:"norder ASC",process_result:{fn:"process_result::add_parents_and_children_recursive",columns:[{name:"parents"}]}};data_manager.request({body:n}).then((function(t){const n=t.result?page.parse_catalog_data(t.result):null;e(n)}))}))},draw_types2:function(e){const t=e.ar_rows,n=e.mint_section_id,a=new DocumentFragment,o=tstring.coin_production||"Coin production",_=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:a});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:o,parent:_});const r=[];for(let e=0;e<t.length;e++){const o=t[e];if(o.section_id==n)continue;if(!(!!o.parents&&o.parents.find((e=>e==n)))){console.log("Excluded row:",o);continue}const _=mint_row.draw_type_item(o);_&&(r.push(_),a.appendChild(_))}for(let e=0;e<r.length;e++){const t=r[e];if(t.parent){const e=r.find((function(e){return e.section_id==t.parent}));e&&e.container&&e.container.appendChild(t)}else console.log("node without parent:",t)}return a},draw_row:function(e){const t=void 0!==e.ar_rows[0]?e.ar_rows[0]:null,n=e.target;if(!t)return console.warn("Warning! draw_row row_object no found in options"),null;for(self.row_object=t,!0===SHOW_DEBUG&&console.log("Mint row_object:",t);n.hasChildNodes();)n.removeChild(n.lastChild);const a=new DocumentFragment,o=common.create_dom_element({element_type:"div",class_name:"",parent:a});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:t.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata6&id="+t.section_id,parent:o}).setAttribute("target","_blank")}if(t.name&&t.name.length>0){const e=common.create_dom_element({element_type:"div",class_name:"line-tittle-wrap",parent:o});let n=t.name;if(common.create_dom_element({element_type:"div",class_name:"line-tittle golden-color",text_content:n,parent:e}),t.place&&t.place.length>0){const n="| "+t.place;common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:e})}}const _=common.create_dom_element({element_type:"div",class_name:"block-expandable",parent:o});let r=0;if(t.history&&t.history.length>0){const e=t.history;r+=e.length;common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:e,parent:_})}if(r>220&&s(_,o),t.bibliography_data&&t.bibliography_data.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.bibliographic_references||"Bibliographic references",parent:e});const n=common.create_dom_element({element_type:"div",class_name:"info_text_block",parent:o});console.log("row_object.bibliography_data:",t.bibliography_data);const a=t.bibliography_data,_=a.length;for(let e=0;e<_;e++){const t=biblio_row_fields.render_row_bibliography(a[e]);common.create_dom_element({element_type:"div",class_name:"bibliographic_reference",parent:n}).appendChild(t)}s(n,o)}return n.appendChild(a),n;function s(e,t){e.classList.add("contracted-block");const n=common.create_dom_element({element_type:"div",class_name:"text-block-separator",parent:t}),a=common.create_dom_element({element_type:"div",class_name:"separator-arrow",parent:n});n.addEventListener("click",(function(){e.classList.contains("contracted-block")?(e.classList.remove("contracted-block"),a.style.transform="rotate(-90deg)"):(e.classList.add("contracted-block"),a.style.transform="rotate(90deg)")}))}},draw_map:function(e){const t=this,n=e.mint_map_data,a=e.mint_popup_data,o=e.place_data;function _(e){return{section_id:e.section_id,title:e.name,description:""}}return t.get_place_data({place_data:o}).then((function(e){const o=document.getElementById("map_container");t.map=t.map||new map_factory,t.map.init({map_container:o,map_position:null,popup_builder:page.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:page.maps_config.source_maps,legend:page.render_map_legend});const r=t.map_data(n,a),s=e.result[0].result;if(s&&s.length>0)for(let e=0;e<s.length;e++){const n=JSON.parse(s[e].georef_geojson),a=_(s[e]);a.type={},a.type="findspot";const o=t.map_data(n,a);console.log("--findspot_popup_data",a),r.push(o[0])}const i=e.result[1].result;if(i&&i.length>0)for(let e=0;e<i.length;e++){const n=JSON.parse(i[e].georef_geojson)||"",a=_(i[e]);a.type={},a.type="hoard";const o=t.map_data(n,a);console.log("--hoard_map_data_poitns",o),r.push(o[0])}console.log("map_data_poitns:",r),t.map.parse_data_to_map(r,null).then((function(){o.classList.remove("hide_opacity")}))})),!0},get_place_data:function(e){const t="place_data='"+JSON.stringify(e.place_data)+"'",n=[];n.push({id:"findspots",options:{dedalo_get:"records",table:"findspots",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["*"],count:!1,sql_filter:t}}),n.push({id:"hoards",options:{dedalo_get:"records",table:"hoards",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["*"],count:!1,sql_filter:t}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:n}})},map_data:function(e,t){const n=function(){switch(t.type){case"findspot":return page.maps_config.markers.findspot;case"hoard":return page.maps_config.markers.hoard;default:return page.maps_config.markers.mint}}(),a=Array.isArray(e)?e:[e],o=[];for(let e=0;e<a.length;e++){const _={lat:null,lon:null,geojson:[a[e]],marker_icon:n,data:t};o.push(_)}return o}};