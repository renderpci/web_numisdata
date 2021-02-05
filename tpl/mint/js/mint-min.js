"use strict";var mint={set_up:function(e){const t=this,n=e.section_id;return n&&t.get_row_data({section_id:n}).then((function(e){console.log("--\x3e set_up get_row_data API response:",e.result[1]);const n=e.result.find(e=>"mint"===e.id);t.draw_row({target:document.getElementById("row_detail"),ar_rows:n.result}),t.draw_map({mint_map_data:JSON.parse(n.result[0].map),mint_popup_data:{section_id:n.result[0].section_id,title:n.result[0].name,description:n.result[0].history.trim()},place_data:n.result[0].place_data});const a=e.result.find(e=>"mint_catalog"===e.id);if(a.result){const e=a.result.find(e=>"mints"===e.term_table);console.log(e.section_id),t.get_types_data({section_id:e.section_id}).then((function(e){t.draw_types({target:document.getElementById("types"),ar_rows:e})}))}})),!0},get_row_data:function(e){const t=e.section_id,n=[];n.push({id:"mint",options:{dedalo_get:"records",table:"mints",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","lang","name","place_data","place","history","numismatic_comments","bibliography_data","map"],sql_filter:"section_id = "+parseInt(t),count:!1,resolve_portals_custom:{bibliography_data:"bibliographic_references"}}}),n.push({id:"mint_catalog",options:{dedalo_get:"records",table:"catalog",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","term","term_table"],count:!1,limit:0,sql_filter:"term_data='[\""+parseInt(t)+"\"]'"}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:n}})},get_types_data:function(e){const t=this,n=e.section_id;return new Promise((function(e){data_manager.request({body:{dedalo_get:"records",table:"catalog",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","term_data","ref_type_denomination","term","term_table","parent","parents","children","ref_coins_image_obverse","ref_coins_image_reverse","ref_type_averages_diameter","ref_type_averages_weight","ref_mint_number"],count:!1,limit:0,order:"term_table DESC, norder ASC",sql_filter:"(term_table='types' OR term_table='ts_numismatic_group' OR term_table='ts_period') AND parents LIKE '%\""+parseInt(n)+"\"%'",resolve_portals_custom:{parent:"catalog"}}}).then((function(n){const a=[];if(console.log(n),n.result&&n.result.length>0)for(let e=0;e<n.result.length;e++){const t={catalog:"MIB",section_id:n.result[e].section_id,term_data:n.result[e].term_data,denomination:n.result[e].ref_type_denomination,term_table:n.result[e].term_table,term:n.result[e].term,parent:n.result[e].parent,parents:n.result[e].parents,children:n.result[e].children,ref_coins_image_obverse:n.result[e].ref_coins_image_obverse,ref_coins_image_reverse:n.result[e].ref_coins_image_reverse,ref_type_averages_diameter:n.result[e].ref_type_averages_diameter,ref_type_averages_weight:n.result[e].ref_type_averages_weight,ref_mint_number:n.result[e].ref_mint_number};a.push(t)}const o=t.parse_types_data(a);e(o)}))}))},parse_types_data:function(e){var t=[];const n=e;n.length;var a=n.filter(e=>"mints"===e.parent[0].term_table);for(let e=0;e<a.length;e++){var o=a[e];o.children={},o.groups=[],null==t.children?(t.children=[],t.children.push(o)):t.children.push(o)}var _=n.filter(e=>"ts_period"===e.parent[0].term_table);for(let e=0;e<_.length;e++){const n=_[e],a=n.parent[0].section_id,o=t.children.findIndex(e=>e.section_id==a);if(o>-1){var r=t.children[o].children;null!=r&&r.length>0||(t.children[o].children=[]),t.children[o].children.push(n)}}console.log(t);for(var l=n.filter(e=>"ts_numismatic_group"===e.parent[0].term_table),s=!1;l.length>0;)for(let e=0;e<l.length;e++){const n=l[e];s=!1,c(t.children,n,t),s&&l.splice(e,1)}var m=n.filter(e=>"types"===e.parent[0].term_table);for(s=!1;m.length>0;)for(let e=0;e<m.length;e++){const n=m[e];s=!1,c(t.children,n,t),s&&m.splice(e,1)}function c(e,t,n){n.section_id==t.parent[0].section_id&&(s=!0,Array.isArray(n.children)||(n.children=[]),n.children.push(t)),Array.isArray(e)&&e.forEach((function(e,n){c(e.children,t,e)}))}return console.log("parsedData:",t),t},draw_row:function(e){const t=e.ar_rows[0],n=e.target;for(self.row_object=t,!0===SHOW_DEBUG&&console.log("Mint row_object:",t);n.hasChildNodes();)n.removeChild(n.lastChild);const a=new DocumentFragment,o=common.create_dom_element({element_type:"div",class_name:"",parent:a});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:t.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata6&id="+t.section_id,parent:o}).setAttribute("target","_blank")}if(t.name&&t.name.length>0){const e=common.create_dom_element({element_type:"div",class_name:"line-tittle-wrap",parent:o});let n=t.name;if(common.create_dom_element({element_type:"div",class_name:"line-tittle golden-color",text_content:n,parent:e}),t.place&&t.place.length>0){const n="| "+t.place;common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:e})}}const _=common.create_dom_element({element_type:"div",class_name:"block-expandable",parent:o});let r=0;if(t.history&&t.history.length>0){const e=t.history;r+=e.length;common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:e,parent:_})}if(t.numismatic_comments&&t.numismatic_comments.length>0){const e=t.numismatic_comments;r+=e.length;common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:e,parent:_})}if(r>220&&s(_,o),t.bibliography_data&&t.bibliography_data.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.bibliographic_references||"Bibliographic references",parent:e});const n=t.bibliography_data,a=n.length,_=biblio_row_fields,r=common.create_dom_element({element_type:"div",class_name:"info_text_block",parent:o});for(var l=0;l<a;l++){const e=common.create_dom_element({element_type:"div",class_name:"bibliographic_reference",parent:r}),t=n[l];_.biblio_object=t;const a=_.row_bibliography();e.appendChild(a)}s(r,o)}return n.appendChild(a),n;function s(e,t){e.classList.add("contracted-block");const n=common.create_dom_element({element_type:"div",class_name:"text-block-separator",parent:t}),a=common.create_dom_element({element_type:"div",class_name:"separator-arrow",parent:n});n.addEventListener("click",(function(){e.classList.contains("contracted-block")?(e.classList.remove("contracted-block"),a.style.transform="rotate(-90deg)"):(e.classList.add("contracted-block"),a.style.transform="rotate(90deg)")}))}},draw_types:function(e){if(e.ar_rows.children&&e.ar_rows.children.length>0){const a=e.target,o=e.ar_rows.children;console.log("Types parsed rows: ",o);const _=o.length;for(;a.hasChildNodes();)a.removeChild(a.lastChild);const r=new DocumentFragment;common.create_dom_element({element_type:"label",text_content:tstring.tipos||"Types",parent:r});for(let e=0;e<_;e++){const a=o[e],_=common.create_dom_element({element_type:"div",class_name:"type_row",parent:r});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:a.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata3&id="+a.section_id,parent:_}).setAttribute("target","_blank")}const l=common.create_dom_element({element_type:"div",class_name:"children_container",parent:r}),s=common.create_dom_element({element_type:"div",class_name:"ts_period",text_content:a.term,parent:l});common.create_dom_element({element_type:"div",class_name:"arrow",parent:s});const m=common.create_dom_element({element_type:"div",class_name:"row_node ts_period hide",parent:l});n(s,m),null!=a.children&&(console.log("row_object_children:",a.children),t(a.children,null,m))}function t(e,n,a){null!=n&&function(e,t){const n=t;if("ts_numismatic_group"===e.term_table){console.log(e.term);const t=common.create_dom_element({element_type:"div",class_name:"children_container",parent:n}),a=common.create_dom_element({element_type:"div",class_name:"ts_numismatic_group",text_content:e.term,parent:t});common.create_dom_element({element_type:"div",class_name:"arrow",parent:a});common.create_dom_element({element_type:"div",class_name:"row_node hide",parent:t})}else e.term_table}(n,a),Array.isArray(e)&&e.forEach((function(e,n){t(e.children,e,a)}))}function n(e,t){const n=e.firstElementChild;e.addEventListener("click",(function(){t.classList.contains("hide")?(t.classList.remove("hide"),n.style.transform="rotate(90deg)"):(t.classList.add("hide"),n.style.transform="rotate(0deg)")}))}a.appendChild(r)}else document.getElementById("types").remove()},draw_types_block:function(e){const t=e,n=t.length,a=common.create_dom_element({element_type:"div",class_name:"types_container"});for(let e=0;e<n;e++){const n=t[e];if(n.children.length>0){const e=n.children,t=e.length;for(let a=0;a<t;a++){const t=e[a];let _=!1;_=0===a,o(t,!0,_,n.term)}}else o(n,!1,!0)}function o(e,t,n,o){const _=e,r=-1==_.term.indexOf(",")?_.term:_.term.slice(0,_.term.indexOf(",")),l=_.ref_mint_number?_.ref_mint_number+"/":"";let s="",m="",c="";const i=_.term_data.replace(/[\["\]]/g,"");let d=page_globals.__WEB_ROOT_WEB__+"/type/"+i,p=d;if(t){if(m="MIB "+l+r,c="subType_number",n){d="";let e="";e=-1==o.indexOf(",")?o:o.slice(0,o.indexOf(",")),s="MIB "+e}}else s="MIB "+l+r;const g=common.create_dom_element({element_type:"div",class_name:"type_wrap",parent:a}),f=common.create_dom_element({element_type:"div",class_name:"type_number",parent:g});common.create_dom_element({element_type:"a",inner_html:s,class_name:"type_label",href:d,parent:f}),common.create_dom_element({element_type:"a",inner_html:m,class_name:"subType_label "+c,href:p,parent:f});const u=common.create_dom_element({element_type:"div",class_name:"types_img gallery",parent:g}),h=common.create_dom_element({element_type:"a",class_name:"image_link",href:common.local_to_remote_path(_.ref_coins_image_obverse),parent:u});common.create_dom_element({element_type:"img",src:common.local_to_remote_path(_.ref_coins_image_obverse),parent:h}).loading="lazy";const b=common.create_dom_element({element_type:"a",class_name:"image_link",href:common.local_to_remote_path(_.ref_coins_image_reverse),parent:u});common.create_dom_element({element_type:"img",src:common.local_to_remote_path(_.ref_coins_image_reverse),parent:b}).loading="lazy";const y=common.create_dom_element({element_type:"div",class_name:"info_wrap",parent:g}),v=_.ref_type_averages_weight+" g; "+_.ref_type_averages_diameter+"mm";common.create_dom_element({element_type:"p",class_name:"type_info",text_content:v,parent:y});page_globals.__WEB_BASE_URL__,page_globals.__WEB_ROOT_WEB__,_.section_id;const w=page_globals.__WEB_ROOT_WEB__+"/type/"+i;common.create_dom_element({element_type:"a",class_name:"type_info",text_content:"URI",href:w,parent:y})}return a},draw_map:function(e){const t=this,n=e.mint_map_data,a=e.mint_popup_data,o=e.place_data;function _(e){return{section_id:e.section_id,title:e.name,description:""}}t.get_place_data({place_data:o}).then((function(e){console.log(e);const o=n,r=document.getElementById("map_container");t.map=t.map||new map_factory,t.map.init({map_container:r,map_position:o,popup_builder:page.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:page.maps_config.source_maps});var l=t.map_data(n,a);const s=e.result[0].result;if(s&&s.length>0)for(let e=0;e<s.length;e++){const n=JSON.parse(s[e].map),a=_(s[e]),o=t.map_data(n,a);console.log(a),l.push(o[0])}const m=e.result[1].result;if(m&&m.length>0)for(let e=0;e<m.length;e++){const n=JSON.parse(m[e].map),a=_(n[e]),o=t.map_data(n,a);console.log(o),l.push(o[0])}console.log(l),t.map.parse_data_to_map(l,null).then((function(){r.classList.remove("hide_opacity")}))}))},get_place_data:function(e){const t="place_data='"+e.place_data+"'";console.log(t);const n=[];n.push({id:"findspots",options:{dedalo_get:"records",table:"findspots",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["*"],count:!1,sql_filter:t}}),n.push({id:"hoards",options:{dedalo_get:"records",table:"hoards",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","place_data","name","map"],count:!1,sql_filter:t}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:n}})},map_data:function(e,t){const n=Array.isArray(e)?e:[e],a=[];for(let e=0;e<n.length;e++){const o={lat:n[e].lat,lon:n[e].lon,marker_icon:page.maps_config.markers.mint,data:t};a.push(o)}return a}};