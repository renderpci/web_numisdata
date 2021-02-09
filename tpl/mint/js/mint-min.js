"use strict";var mint={set_up:function(e){const t=this,n=e.section_id;return n&&t.get_row_data({section_id:n}).then((function(e){console.log("--\x3e set_up get_row_data API response:",e.result[1]);const n=e.result.find(e=>"mint"===e.id);t.draw_row({target:document.getElementById("row_detail"),ar_rows:n.result}),t.draw_map({mint_map_data:JSON.parse(n.result[0].map),mint_popup_data:{section_id:n.result[0].section_id,title:n.result[0].name,description:n.result[0].history.trim()},place_data:n.result[0].place_data});const a=e.result.find(e=>"mint_catalog"===e.id);if(a.result){const e=a.result.find(e=>"mints"===e.term_table);console.log(e.section_id),t.get_types_data({section_id:e.section_id}).then((function(e){t.draw_types({target:document.getElementById("types"),ar_rows:e})}))}})),!0},get_row_data:function(e){const t=e.section_id,n=[];n.push({id:"mint",options:{dedalo_get:"records",table:"mints",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","lang","name","place_data","place","history","numismatic_comments","bibliography_data","map"],sql_filter:"section_id = "+parseInt(t),count:!1,resolve_portals_custom:{bibliography_data:"bibliographic_references"}}}),n.push({id:"mint_catalog",options:{dedalo_get:"records",table:"catalog",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","term","term_table"],count:!1,limit:0,sql_filter:"term_data='[\""+parseInt(t)+"\"]'"}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:n}})},get_types_data:function(e){const t=this,n=e.section_id;return new Promise((function(e){data_manager.request({body:{dedalo_get:"records",table:"catalog",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","norder","term_data","ref_type_denomination","term","term_table","parent","parents","children","ref_coins_image_obverse","ref_coins_image_reverse","ref_type_averages_diameter","ref_type_averages_weight","ref_type_material","ref_mint_number"],count:!1,limit:0,order:"norder ASC",sql_filter:"(term_table='types' OR term_table='ts_numismatic_group' OR term_table='ts_period') AND parents LIKE '%\""+parseInt(n)+"\"%'",resolve_portals_custom:{parent:"catalog"}}}).then((function(n){const a=[];if(console.log(n),n.result&&n.result.length>0)for(let e=0;e<n.result.length;e++){const t={catalog:"MIB",section_id:n.result[e].section_id,norder:n.result[e].norder,term_data:n.result[e].term_data,denomination:n.result[e].ref_type_denomination,term_table:n.result[e].term_table,term:n.result[e].term,parent:n.result[e].parent,parents:n.result[e].parents,children:n.result[e].children,ref_coins_image_obverse:n.result[e].ref_coins_image_obverse,ref_coins_image_reverse:n.result[e].ref_coins_image_reverse,ref_type_averages_diameter:n.result[e].ref_type_averages_diameter,ref_type_averages_weight:n.result[e].ref_type_averages_weight,ref_type_material:n.result[e].ref_type_material,ref_mint_number:n.result[e].ref_mint_number};a.push(t)}const r=t.parse_types_data(a);e(r)}))}))},parse_types_data:function(e){var t=[];const n=e;n.length;var a=n.filter(e=>"mints"===e.parent[0].term_table);for(let e=0;e<a.length;e++){var r=a[e];r.children={},r.groups=[],null==t.children?(t.children=[],t.children.push(r)):t.children.push(r)}var o=n.filter(e=>"ts_period"===e.parent[0].term_table);for(let e=0;e<o.length;e++){const n=o[e],a=n.parent[0].section_id,r=t.children.findIndex(e=>e.section_id==a);if(r>-1){var l=t.children[r].children;null!=l&&l.length>0||(t.children[r].children=[]),t.children[r].children.push(n)}}for(var _=n.filter(e=>"ts_numismatic_group"===e.parent[0].term_table),s=!1;_.length>0;)for(let e=0;e<_.length;e++){const n=_[e];console.log(n.norder),s=!1,i(t.children,n,t),s&&_.splice(e,1)}var m=n.filter(e=>"types"===e.parent[0].term_table);for(s=!1;m.length>0;)for(let e=0;e<m.length;e++){const n=m[e];s=!1,i(t.children,n,t),s&&m.splice(e,1)}function i(e,t,n){n.section_id==t.parent[0].section_id&&(s=!0,Array.isArray(n.children)||(n.children=[]),n.children.push(t)),Array.isArray(e)&&e.forEach((function(e,n){i(e.children,t,e)}))}return console.log("parsedData:",t),t},draw_row:function(e){const t=e.ar_rows[0],n=e.target;for(self.row_object=t,!0===SHOW_DEBUG&&console.log("Mint row_object:",t);n.hasChildNodes();)n.removeChild(n.lastChild);const a=new DocumentFragment,r=common.create_dom_element({element_type:"div",class_name:"",parent:a});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:t.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata6&id="+t.section_id,parent:r}).setAttribute("target","_blank")}if(t.name&&t.name.length>0){const e=common.create_dom_element({element_type:"div",class_name:"line-tittle-wrap",parent:r});let n=t.name;if(common.create_dom_element({element_type:"div",class_name:"line-tittle golden-color",text_content:n,parent:e}),t.place&&t.place.length>0){const n="| "+t.place;common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:e})}}const o=common.create_dom_element({element_type:"div",class_name:"block-expandable",parent:r});let l=0;if(t.history&&t.history.length>0){const e=t.history;l+=e.length;common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:e,parent:o})}if(t.numismatic_comments&&t.numismatic_comments.length>0){const e=t.numismatic_comments;l+=e.length;common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:e,parent:o})}if(l>220&&s(o,r),t.bibliography_data&&t.bibliography_data.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:r});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.bibliographic_references||"Bibliographic references",parent:e});const n=t.bibliography_data,a=n.length,o=biblio_row_fields,l=common.create_dom_element({element_type:"div",class_name:"info_text_block",parent:r});for(var _=0;_<a;_++){const e=common.create_dom_element({element_type:"div",class_name:"bibliographic_reference",parent:l}),t=n[_];o.biblio_object=t;const a=o.row_bibliography();e.appendChild(a)}s(l,r)}return n.appendChild(a),n;function s(e,t){e.classList.add("contracted-block");const n=common.create_dom_element({element_type:"div",class_name:"text-block-separator",parent:t}),a=common.create_dom_element({element_type:"div",class_name:"separator-arrow",parent:n});n.addEventListener("click",(function(){e.classList.contains("contracted-block")?(e.classList.remove("contracted-block"),a.style.transform="rotate(-90deg)"):(e.classList.add("contracted-block"),a.style.transform="rotate(90deg)")}))}},draw_types:function(e){let t=0,n=!1;if(e.ar_rows.children&&e.ar_rows.children.length>0){const o=e.target,l=e.ar_rows.children,_=l.length;for(;o.hasChildNodes();)o.removeChild(o.lastChild);const s=new DocumentFragment,m=tstring.coin_production||"Coin production",i=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:s});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:m,parent:i});for(let e=0;e<_;e++){const t=l[e];if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:t.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata3&id="+t.section_id,parent:i}).setAttribute("target","_blank")}const n=common.create_dom_element({element_type:"div",class_name:"children_container",parent:s}),o=common.create_dom_element({element_type:"div",class_name:"ts_period period_label",text_content:t.term,parent:n});common.create_dom_element({element_type:"div",class_name:"arrow",parent:o});const _=common.create_dom_element({element_type:"div",class_name:"row_node ts_period period_wrap hide",parent:n}),m=common.create_dom_element({element_type:"div",class_name:"types_container hide deep:",parent:_}),i=common.create_dom_element({element_type:"div",class_name:"type_row",parent:s});r(o,_),r(o,m),null!=t.children&&a(t.children,null,_)}function a(e,o,l){if(null!=o&&(!function(e,a){var o=a;if("ts_numismatic_group"===e.term_table){if(t>1){const e=a.getElementsByClassName("row_node deep:"+(t-1).toString());o=e[e.length-1]}const n=common.create_dom_element({element_type:"div",class_name:"children_container",parent:o}),l=common.create_dom_element({element_type:"div",class_name:"ts_numismatic_group",text_content:e.term,parent:n});common.create_dom_element({element_type:"div",class_name:"arrow",parent:l});const _=common.create_dom_element({element_type:"div",class_name:"types_container hide deep:"+t,parent:n}),s=common.create_dom_element({element_type:"div",class_name:"row_node hide deep:"+t,parent:n});r(l,s),r(l,_)}else if("types"===e.term_table)if(null!=e.children&&e.children.length>0)n=!0;else{let r=a.getElementsByClassName("types_container deep:"+(t-1).toString()),l=t;for(;0==r.length&&l>1;)l-=1,r=a.getElementsByClassName("types_container deep:"+(l-1).toString());if(null==(o=r[r.length-1])){let e=a.getElementsByClassName("types_container");o=e[e.length-1]}let _=!1;"types"===e.parent[0].term_table&&(_=!0);const s=function(e,t){const a=e.parent[0],r=e,o=-1==r.term.indexOf(",")?r.term:r.term.slice(0,r.term.indexOf(",")),l=r.ref_mint_number?r.ref_mint_number+"/":"";let _="",s="",m="",i="",c="";if(null!=r.term_data){const e=r.term_data.replace(/[\["\]]/g,"");i=page_globals.__WEB_ROOT_WEB__+"/type/"+e,c=i}else t=!0;if(t){if(s="MIB "+l+o,m="subType_number",n){i="";let e="";e=-1==a.term.indexOf(",")?a.term:a.term.slice(0,a.term.indexOf(",")),_="MIB "+e}}else _="MIB "+l+o;const d=common.create_dom_element({element_type:"div",class_name:"type_wrap"}),p=common.create_dom_element({element_type:"div",class_name:"type_number",parent:d});common.create_dom_element({element_type:"a",inner_html:_,class_name:"type_label",href:i,parent:p}),common.create_dom_element({element_type:"a",inner_html:s,class_name:"subType_label "+m,href:c,parent:p});const g=common.create_dom_element({element_type:"div",class_name:"types_img gallery",parent:d}),f=common.create_dom_element({element_type:"a",class_name:"image_link",href:common.local_to_remote_path(r.ref_coins_image_obverse),parent:g});common.create_dom_element({element_type:"img",src:common.local_to_remote_path(r.ref_coins_image_obverse),parent:f}).loading="lazy";const u=common.create_dom_element({element_type:"a",class_name:"image_link",href:common.local_to_remote_path(r.ref_coins_image_reverse),parent:g});common.create_dom_element({element_type:"img",src:common.local_to_remote_path(r.ref_coins_image_reverse),parent:u}).loading="lazy";const h=common.create_dom_element({element_type:"div",class_name:"info_wrap",parent:d}),y=[r.ref_type_material,r.denomination,r.ref_type_averages_weight+"g",r.ref_type_averages_diameter+"mm"];return common.create_dom_element({element_type:"p",class_name:"type_info",text_content:y.join(" | "),parent:h}),page.activate_images_gallery(g),d}(e,_);o.appendChild(s),n=!1}}(o,l),null!=o.children&&o.children.sort((function(e,t){return parseInt(e.norder)>parseInt(t.norder)?1:parseInt(e.norder)<parseInt(t.norder)?-1:0}))),Array.isArray(e)){t+=1;for(let n=0;n<e.length;n++)a(e[n].children,e[n],l),e.length-1==n&&(t-=1)}}function r(e,t){const n=e.firstElementChild;e.addEventListener("click",(function(){t.classList.contains("hide")?(t.classList.remove("hide"),n.style.transform="rotate(90deg)"):(t.classList.add("hide"),n.style.transform="rotate(0deg)")}))}o.appendChild(s)}else document.getElementById("types").remove()},draw_map:function(e){const t=this,n=e.mint_map_data,a=e.mint_popup_data,r=e.place_data;function o(e){return{section_id:e.section_id,title:e.name,description:""}}t.get_place_data({place_data:r}).then((function(e){console.log(a);const r=n,l=document.getElementById("map_container");t.map=t.map||new map_factory,t.map.init({map_container:l,map_position:r,popup_builder:page.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:page.maps_config.source_maps});const _=common.create_dom_element({element_type:"div",class_name:"map_legend",parent:l});common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.mint+'<img src="'+page.maps_config.markers.mint.iconUrl+'"/>',parent:_}),common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.hoard+'<img src="'+page.maps_config.markers.hoard.iconUrl+'"/>',parent:_}),common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.findspot+'<img src="'+page.maps_config.markers.findspot.iconUrl+'"/>',parent:_});var s=t.map_data(n,a);const m=e.result[0].result;if(m&&m.length>0)for(let e=0;e<m.length;e++){const n=JSON.parse(m[e].map),a=o(m[e]);a.type={},a.type="findspot";const r=t.map_data(n,a);console.log(a),s.push(r[0])}const i=e.result[1].result;if(i&&i.length>0)for(let e=0;e<i.length;e++){const n=JSON.parse(i[e].map),a=o(n[e]);a.type={},a.type="hoard";const r=t.map_data(n,a);console.log(r),s.push(r[0])}console.log(s),t.map.parse_data_to_map(s,null).then((function(){l.classList.remove("hide_opacity")}))}))},get_place_data:function(e){const t="place_data='"+e.place_data+"'";console.log(t);const n=[];n.push({id:"findspots",options:{dedalo_get:"records",table:"findspots",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["*"],count:!1,sql_filter:t}}),n.push({id:"hoards",options:{dedalo_get:"records",table:"hoards",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","place_data","name","map"],count:!1,sql_filter:t}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:n}})},map_data:function(e,t){console.log("MAP_DATA: ",t);var n=page.maps_config.markers.mint;null!=t.type&&"findspot"===t.type?n=page.maps_config.markers.findspot:null!=t.type&&"hoard"===t.type&&(n=page.maps_config.markers.hoard);const a=Array.isArray(e)?e:[e],r=[];for(let e=0;e<a.length;e++){const o={lat:a[e].lat,lon:a[e].lon,marker_icon:n,data:t};r.push(o)}return r}};