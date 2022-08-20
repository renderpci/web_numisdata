"use strict";var mint={section_id:null,export_data_container:null,row_detail:null,map_container:null,set_up:function(e){const t=this;t.export_data_container=e.export_data_container,t.row_detail=e.row_detail,t.section_id=e.section_id,t.map_container=e.map_container;const n=page.render_export_data_buttons();t.export_data_container.appendChild(n),t.export_data_container.classList.add("hide");const a=page.create_suggestions_button();return t.export_data_container.appendChild(a),t.section_id?t.get_row_data({section_id:t.section_id}).then((function(e){const n=e.result.find((e=>"mint"===e.id)),a=page.parse_mint_data(n.result[0]);t.draw_row({target:t.row_detail,ar_rows:[a]}),void 0!==n.result[0]&&a.georef_geojson&&t.draw_map({mint_map_data:a.georef_geojson,mint_popup_data:{section_id:a.section_id,title:a.name,description:a.public_info.trim()},types:a.relations_types});const o=e.result.find((e=>"mint_catalog"===e.id));if(o.result){const e=o.result.find((e=>"mints"===e.term_table));e&&e.section_id?t.get_types_data2({section_id:e.section_id}).then((function(n){for(let e=0;e<n.length;e++)n[e].catalog_info=n[e].term_section_id;const a=t.draw_types2({ar_rows:n,mint_section_id:e.section_id});if(a){const e=document.getElementById("types");e.appendChild(a),page.activate_images_gallery(e)}})):(console.warn("Ignored invalid _mint_catalog:",e),console.warn("mint_catalog:",o))}event_manager.publish("data_request_done",{request_body:null,result:{mint:n.result,mint_catalog:o.result},export_data_parser:page.export_parse_mint_data}),t.export_data_container.classList.remove("hide")})):t.row_detail.innerHTML="Error. Invalid section_id",!0},get_row_data:function(e){const t=e.section_id,n=[];n.push({id:"mint",options:{dedalo_get:"records",table:"mints",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","lang","name","place_data","place","public_info","bibliography_data","map","uri","indexation","indexation_data","georef_geojson","relations_types","authorship_data","authorship_names","authorship_surnames","authorship_roles"],sql_filter:"section_id = "+parseInt(t),count:!1,resolve_portals_custom:{bibliography_data:"bibliographic_references"}}}),n.push({id:"mint_catalog",options:{dedalo_get:"records",table:"catalog",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","term","term_table"],count:!1,limit:0,sql_filter:"term_data='[\""+parseInt(t)+"\"]'"}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:n}})},get_types_data2:function(e){const t=e.section_id;return new Promise((function(e){const n={dedalo_get:"records",table:"catalog",ar_fields:["*"],lang:page_globals.WEB_CURRENT_LANG_CODE,sql_filter:"section_id = "+parseInt(t),limit:0,group:null,count:!1,order:"norder ASC",resolve_portals_custom:{term_data:"types"},process_result:{fn:"process_result::add_parents_and_children_recursive",columns:[{name:"parents"}]}};data_manager.request({body:n}).then((function(t){const n=t.result?page.parse_catalog_data(t.result):null;e(n)}))}))},draw_types2:function(e){const t=e.ar_rows,n=e.mint_section_id,a=new DocumentFragment,o=tstring.coin_production||"Coin production",i=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:a});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:o,parent:i});const r=[];for(let e=0;e<t.length;e++){const o=t[e];if(o.section_id==n)continue;if(!(!!o.parents&&o.parents.find((e=>e==n)))){console.log("Excluded row:",o);continue}const i=mint_row.draw_type_item(o);i&&(r.push(i),a.appendChild(i))}for(let e=0;e<r.length;e++){const t=r[e];if(t.parent){const e=r.find((function(e){return e.section_id==t.parent}));e&&e.container&&e.container.appendChild(t)}else console.warn("node without parent:",t)}return a},draw_row:function(e){const t=void 0!==e.ar_rows[0]?e.ar_rows[0]:null,n=e.target;if(!t)return console.warn("Warning! draw_row row_object no found in options"),null;for(self.row_object=t,SHOW_DEBUG;n.hasChildNodes();)n.removeChild(n.lastChild);const a=new DocumentFragment,o=common.create_dom_element({element_type:"div",class_name:"",parent:a});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:t.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata6&id="+t.section_id,parent:o}).setAttribute("target","_blank")}const i=document.querySelector(".golden-separator");if(common.create_dom_element({element_type:"span",class_name:"cite_this_record",text_content:tstring.cite_this_record||"cite this record",parent:i}).addEventListener("click",(async function(){const e=(await page.load_main_catalog()).result[0],n=e.publication_data[0];e.autors={authorship_data:t.authorship_data||null,authorship_names:t.authorship_names||null,authorship_surnames:t.authorship_surnames||null,authorship_roles:t.authorship_roles||null},e.catalog=null,e.title=t.name,e.publication_data=n,e.uri_location=window.location;const a=biblio_row_fields.render_cite_this(e),o=common.create_dom_element({element_type:"div",class_name:"float-cite",parent:document.body});o.addEventListener("mouseup",(function(){o.classList.add("copy"),a.classList.add("copy");const e=window.getSelection(),t=document.createRange();t.selectNodeContents(a),e.removeAllRanges(),e.addRange(t),document.execCommand("copy"),window.getSelection().removeAllRanges()}));common.create_dom_element({element_type:"div",class_name:"float-label",text_content:tstring.cite_this_record||"Cite this record",parent:o});common.create_dom_element({element_type:"div",class_name:"close-buttom",parent:o}).addEventListener("click",(function(){})),document.body.addEventListener("click",(function(e){document.body.removeEventListener("click",(function(e){})),o.remove()})),o.appendChild(a)})),t.name&&t.name.length>0){const e=common.create_dom_element({element_type:"div",class_name:"line-tittle-wrap",parent:o}),n=t.name;if(common.create_dom_element({element_type:"div",class_name:"line-tittle golden-color",text_content:n,parent:e}),t.place&&t.place.length>0){const n="| "+t.place;common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:e})}if(t.authorship_names&&t.authorship_names.length>0){const n=t.authorship_names.split("|"),a=t.authorship_surnames.split("|"),o=t.authorship_roles.split("|"),i=n.length;for(let t=0;t<i;t++){const i=n[t].trim().toUpperCase()+" "+a[t].trim().toUpperCase()+" | "+o[t].trim();common.create_dom_element({element_type:"div",class_name:"authorship",text_content:i,parent:e})}}}const r=common.create_dom_element({element_type:"div",class_name:"block-expandable",parent:o});let s=0;if(t.public_info&&t.public_info.length>0){const e=t.public_info;s+=e.length;common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:e,parent:r})}if(s>220&&page.create_expandable_block(r,o),t.bibliography_data&&t.bibliography_data.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.bibliographic_references||"Bibliographic references",parent:e});const n=common.create_dom_element({element_type:"div",class_name:"info_text_block",parent:o}),a=t.bibliography_data,i=a.length;for(let e=0;e<i;e++){const t=biblio_row_fields.render_row_bibliography(a[e]);common.create_dom_element({element_type:"div",class_name:"bibliographic_reference",parent:n}).appendChild(t)}page.create_expandable_block(n,o)}if(t.uri&&t.uri.length>0)for(let e=0;e<t.uri.length;e++){const n=t.uri[e],a=(n.label,'<a class="icon_link info_value" href="'+n.value+'" target="_blank"> '+n.label+"</a>");common.create_dom_element({element_type:"span",inner_html:a,parent:o})}return n.appendChild(a),n},draw_map:function(e){const t=this,n=e.mint_map_data,a=e.mint_popup_data,o=e.types;function i(e){return{section_id:e.section_id,title:e.name,description:""}}return t.get_findspot_hoards({types:o}).then((function(e){const o=t.map_container;e&&e.result&&o.classList.remove("hide"),t.map=t.map||new map_factory,t.map.init({map_container:o,map_position:null,popup_builder:page.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:page.maps_config.source_maps,legend:page.render_map_legend});const r=t.map_data(n,a),s=e.result[0].result;if(s&&s.length>0)for(let e=0;e<s.length;e++){if(!s[e].georef_geojson)continue;const n=JSON.parse(s[e].georef_geojson),a=i(s[e]);a.type={},a.type="findspot";const o=t.map_data(n,a);r.push(o[0])}const _=e.result[1].result;if(_&&_.length>0)for(let e=0;e<_.length;e++){if(!_[e].georef_geojson)continue;const n=JSON.parse(_[e].georef_geojson),a=i(_[e]);a.type={},a.type="hoard";const o=t.map_data(n,a);r.push(o[0])}t.map.parse_data_to_map(r,null).then((function(){o.classList.remove("hide_opacity")}))})),!0},get_findspot_hoards:function(e){const t=e.types,n=[];for(let e=t.length-1;e>=0;e--){const a=t[e];n.push("types like '%\""+a+"\"%'")}const a="("+n.join(" OR ")+")",o=[];o.push({id:"findspots",options:{dedalo_get:"records",table:"findspots",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["*"],count:!1,sql_filter:a}}),o.push({id:"hoards",options:{dedalo_get:"records",table:"hoards",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["*"],count:!1,sql_filter:a}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:o}})},map_data:function(e,t){const n=function(){switch(t.type){case"findspot":return page.maps_config.markers.findspot;case"hoard":return page.maps_config.markers.hoard;default:return page.maps_config.markers.mint}}(),a=Array.isArray(e)?e:[e],o=[];for(let e=0;e<a.length;e++){const i={lat:null,lon:null,geojson:[a[e]],marker_icon:n,data:t};o.push(i)}return o}};
//# sourceMappingURL=mint-min.js.map