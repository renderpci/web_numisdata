"use strict";var mint={set_up:function(e){const t=this,n=e.section_id;return n&&t.get_row_data({section_id:n}).then((function(e){const n=e.result.find(e=>"mint"===e.id);t.draw_row({target:document.getElementById("row_detail"),ar_rows:n.result}),t.draw_map({map_data:JSON.parse(n.result[0].map),popup_data:{section_id:n.result[0].section_id,title:n.result[0].name,description:n.result[0].history.trim()}});const a=e.result.find(e=>"mint_catalog"===e.id);a.result&&t.get_types_data({section_id:a.result[0].section_id}).then((function(e){t.draw_types({target:document.getElementById("types"),ar_rows:e})}))})),!0},get_row_data:function(e){const t=e.section_id,n=[];n.push({id:"mint",options:{dedalo_get:"records",table:"mints",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","lang","name","place_data","place","history","numismatic_comments","bibliography_data","map"],sql_filter:"section_id = "+parseInt(t),count:!1,resolve_portals_custom:{bibliography_data:"bibliographic_references"}}}),n.push({id:"mint_catalog",options:{dedalo_get:"records",table:"catalog",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","term"],count:!1,limit:0,sql_filter:"term_data='[\""+parseInt(t)+"\"]'"}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:n}})},get_types_data:function(e){const t=this,n=e.section_id;return new Promise((function(e){data_manager.request({body:{dedalo_get:"records",table:"catalog",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","term_data","ref_type_denomination","term","term_table","parent","parents","children","ref_coins_image_obverse","ref_coins_image_reverse","ref_type_averages_diameter","ref_type_averages_weight","ref_mint_number"],count:!1,limit:0,order:"norder ASC",sql_filter:"(term_table='types' OR term_table='ts_numismatic_group' OR term_table='ts_period') AND parents LIKE '%\""+parseInt(n)+"\"%'",resolve_portals_custom:{parent:"catalog",children:"catalog"}}}).then((function(n){const a=[];if(n.result&&n.result.length>0)for(let e=0;e<n.result.length;e++){const t={catalog:"MIB",section_id:n.result[e].section_id,term_data:n.result[e].term_data,denomination:n.result[e].ref_type_denomination,term_table:n.result[e].term_table,term:n.result[e].term,parent:n.result[e].parent,parents:n.result[e].parents,children:n.result[e].children,ref_coins_image_obverse:n.result[e].ref_coins_image_obverse,ref_coins_image_reverse:n.result[e].ref_coins_image_reverse,ref_type_averages_diameter:n.result[e].ref_type_averages_diameter,ref_type_averages_weight:n.result[e].ref_type_averages_weight,ref_mint_number:n.result[e].ref_mint_number};a.push(t)}const o=t.parse_types_data(a);e(o)}))}))},parse_types_data:function(e){var t=[];const n=e,a=e.length;for(let e=0;e<a;e++){"ts_period"===(o=n[e]).term_table&&(o.children={},null==t.period?(t.period=[],t.period.push(o)):t.period.push(o))}for(let e=0;e<a;e++){var o=n[e],_=n[e].parent[0];if("ts_numismatic_group"===o.term_table){o.children={};const e=t.period.find(e=>e.section_id===_.section_id);null==e.groups?(e.groups=[],e.groups.push(o)):e.groups.push(o)}}for(let e=0;e<a;e++){o=n[e],_=n[e].parent[0];if("types"===o.term_table)if("ts_period"===_.term_table){const e=t.period.find(e=>e.section_id===_.section_id);null==e.types?(e.types=[],e.types.push(o)):e.types.push(o)}else if("ts_numismatic_group"===_.term_table){const e=t.period.length;for(let n=0;n<e;n++){const e=t.period[n].groups.find(e=>e.section_id===_.section_id);null==e.types?(e.types=[],e.types.push(o)):e.types.push(o)}}}return console.log(t),t},draw_row:function(e){const t=e.ar_rows[0],n=e.target;for(self.row_object=t,!0===SHOW_DEBUG&&console.log("Mint row_object:",t);n.hasChildNodes();)n.removeChild(n.lastChild);const a=new DocumentFragment,o=common.create_dom_element({element_type:"div",class_name:"",parent:a});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:t.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata6&id="+t.section_id,parent:o}).setAttribute("target","_blank")}if(t.name&&t.name.length>0){const e=common.create_dom_element({element_type:"div",class_name:"line-tittle-wrap",parent:o});common.create_dom_element({element_type:"label",class_name:"value-term",text_content:tstring.name||"Name:",parent:e});const n=t.name;common.create_dom_element({element_type:"div",class_name:"line-tittle",text_content:n,parent:e})}if(t.place&&t.place.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.place||"Place",parent:e});const n=t.place;common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:o})}if(t.history&&t.history.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.history||"History",parent:e});const n=t.history,a=common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:n,parent:o});n.length>500&&r(a,o)}if(t.numismatic_comments&&t.numismatic_comments.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.numismatic_comments||"Numismatic comments",parent:e});const n=t.numismatic_comments,a=common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:n,parent:o});n.length>500&&r(a,o)}if(t.bibliography_data&&t.bibliography_data.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.bibliographic_references||"Bibliographic references",parent:e});const n=t.bibliography_data,a=n.length,m=biblio_row_fields,s=common.create_dom_element({element_type:"div",class_name:"info_text_block",parent:o});for(var _=0;_<a;_++){const e=common.create_dom_element({element_type:"div",class_name:"bibliographic_reference",parent:s}),t=n[_];m.biblio_object=t;const a=m.row_bibliography();e.appendChild(a)}r(s,o)}return n.appendChild(a),n;function r(e,t){e.classList.add("contracted-block");const n=common.create_dom_element({element_type:"div",class_name:"text-block-separator",parent:t}),a=common.create_dom_element({element_type:"div",class_name:"separator-arrow",parent:n});n.addEventListener("click",(function(){e.classList.contains("contracted-block")?(e.classList.remove("contracted-block"),a.style.transform="rotate(-90deg)"):(e.classList.add("contracted-block"),a.style.transform="rotate(90deg)")}))}},draw_types:function(e){const t=this,n=e.target,a=e.ar_rows.period,o=a.length;for(;n.hasChildNodes();)n.removeChild(n.lastChild);const _=new DocumentFragment;common.create_dom_element({element_type:"label",text_content:tstring.tipos||"Types",parent:_});for(let e=0;e<o;e++){const n=a[e],o=common.create_dom_element({element_type:"div",class_name:"type_row",parent:_});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:n.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata3&id="+n.section_id,parent:o}).setAttribute("target","_blank")}const m=common.create_dom_element({element_type:"div",class_name:"children_container",parent:_}),s=common.create_dom_element({element_type:"div",class_name:"ts_period",text_content:n.term,parent:m});common.create_dom_element({element_type:"div",class_name:"arrow",parent:s});const l=common.create_dom_element({element_type:"div",class_name:"row_node ts_period hide",parent:m});if(null!=n.groups){const e=n.groups.length;for(let a=0;a<e;a++){const e=common.create_dom_element({element_type:"div",class_name:"children_container",parent:l}),o=common.create_dom_element({element_type:"div",class_name:"ts_numismatic_group",text_content:n.groups[a].term,parent:e});common.create_dom_element({element_type:"div",class_name:"arrow",parent:o});const _=common.create_dom_element({element_type:"div",class_name:"row_node hide",parent:e}),m=t.draw_types_block(n.groups[a].types);_.appendChild(m);const s=m.querySelectorAll(".gallery");if(s)for(let e=0;e<s.length;e++)page.activate_images_gallery(s[e]);r(o,_)}}else{const e=t.draw_types_block(n.types);l.appendChild(e);const a=e.querySelectorAll(".gallery");if(a)for(let e=0;e<a.length;e++)page.activate_images_gallery(a[e])}r(s,l)}function r(e,t){const n=e.firstElementChild;e.addEventListener("click",(function(){t.classList.contains("hide")?(t.classList.remove("hide"),n.style.transform="rotate(90deg)"):(t.classList.add("hide"),n.style.transform="rotate(0deg)")}))}n.appendChild(_)},draw_types_block:function(e){const t=e,n=t.length,a=common.create_dom_element({element_type:"div",class_name:"types_container"});for(let e=0;e<n;e++){const n=t[e];if(n.children.length>0){const e=n.children,t=e.length;for(let a=0;a<t;a++){const t=e[a];let _=!1;_=0===a,o(t,!0,_,n.term)}}else o(n,!1,!0)}function o(e,t,n,o){const _=e,r=-1==_.term.indexOf(",")?_.term:_.term.slice(0,_.term.indexOf(",")),m=_.ref_mint_number?_.ref_mint_number+"/":"";let s="",l="",i="";const c=_.term_data.replace(/[\["\]]/g,"");let p=page_globals.__WEB_ROOT_WEB__+"/type/"+c,d=p;if(t){if(l="MIB "+m+r,i="subType_number",n){p="";let e="";e=-1==o.indexOf(",")?o:o.slice(0,o.indexOf(",")),s="MIB "+e}}else s="MIB "+m+r;const g=common.create_dom_element({element_type:"div",class_name:"type_wrap",parent:a}),u=common.create_dom_element({element_type:"div",class_name:"type_number",parent:g});common.create_dom_element({element_type:"a",inner_html:s,class_name:"type_label",href:p,parent:u}),common.create_dom_element({element_type:"a",inner_html:l,class_name:"subType_label "+i,href:d,parent:u});const f=common.create_dom_element({element_type:"div",class_name:"types_img gallery",parent:g}),y=common.create_dom_element({element_type:"a",class_name:"image_link",href:common.local_to_remote_path(_.ref_coins_image_obverse),parent:f});common.create_dom_element({element_type:"img",src:common.local_to_remote_path(_.ref_coins_image_obverse),parent:y}).loading="lazy";const h=common.create_dom_element({element_type:"a",class_name:"image_link",href:common.local_to_remote_path(_.ref_coins_image_reverse),parent:f});common.create_dom_element({element_type:"img",src:common.local_to_remote_path(_.ref_coins_image_reverse),parent:h}).loading="lazy";const b=common.create_dom_element({element_type:"div",class_name:"info_wrap",parent:g}),v=_.ref_type_averages_weight+" g; "+_.ref_type_averages_diameter+"mm";common.create_dom_element({element_type:"p",class_name:"type_info",text_content:v,parent:b});page_globals.__WEB_BASE_URL__,page_globals.__WEB_ROOT_WEB__,_.section_id;const w=page_globals.__WEB_ROOT_WEB__+"/type/"+c;common.create_dom_element({element_type:"a",class_name:"type_info",text_content:"URI",href:w,parent:b})}return a},draw_map:function(e){const t=e.map_data,n=e.popup_data,a=t,o=document.getElementById("map_container");this.map=this.map||new map_factory,this.map.init({map_container:o,map_position:a,popup_builder:page.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:page.maps_config.source_maps});const _=this.map_data(t,n);return this.map.parse_data_to_map(_,null).then((function(){o.classList.remove("hide_opacity")})),!0},map_data:function(e,t){const n=Array.isArray(e)?e:[e],a=[];for(let e=0;e<n.length;e++){const o={lat:n[e].lat,lon:n[e].lon,marker_icon:page.maps_config.markers.mint,data:t};a.push(o)}return a}};