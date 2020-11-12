"use strict";var mint={set_up:function(e){const t=this,n=e.section_id;return n&&t.get_row_data({section_id:n}).then((function(e){console.log("set_up get_row_data response:",e);const n=e.result.find(e=>"mint"===e.id);t.draw_row({target:document.getElementById("row_detail"),ar_rows:n.result}),t.draw_map({map_data:JSON.parse(n.result[0].map),popup_data:{section_id:n.result[0].section_id,title:n.result[0].name,description:n.result[0].history.trim()}});const a=e.result.find(e=>"types"===e.id);t.draw_types({target:document.getElementById("types"),ar_rows:a.result})})),!0},get_row_data:function(e){const t=e.section_id,n=[];n.push({id:"mint",options:{dedalo_get:"records",table:"mints",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","lang","name","place_data","place","history","numismatic_comments","bibliography_data","map"],sql_filter:"section_id = "+parseInt(t),count:!1,resolve_portals_custom:{bibliography_data:"bibliographic_references"}}}),n.push({id:"types",options:{dedalo_get:"records",table:"types",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["*"],count:!1,limit:2e3,sql_filter:"mint_data LIKE '[\""+parseInt(t)+"\"]'",resolve_portals_custom:{parents:"catalog"}}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:n}})},draw_row:function(e){const t=e.ar_rows[0],n=e.target;for(self.row_object=t,!0===SHOW_DEBUG&&console.log("Mint row_object:",t);n.hasChildNodes();)n.removeChild(n.lastChild);const a=new DocumentFragment,o=common.create_dom_element({element_type:"div",class_name:"",parent:a});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:t.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata6&id="+t.section_id,parent:o}).setAttribute("target","_blank")}if(t.name&&t.name.length>0){common.create_dom_element({element_type:"label",class_name:"",text_content:tstring.name||"Name",parent:o});const e=t.name;common.create_dom_element({element_type:"span",class_name:"info_value",text_content:e,parent:o})}if(t.place&&t.place.length>0){common.create_dom_element({element_type:"label",text_content:tstring.place||"Place",parent:o});const e=t.place;common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e,parent:o})}if(t.history&&t.history.length>0){common.create_dom_element({element_type:"label",text_content:tstring.history||"History",parent:o});const e=t.history;common.create_dom_element({element_type:"div",class_name:"info_value",inner_html:e,parent:o})}if(t.numismatic_comments&&t.numismatic_comments.length>0){common.create_dom_element({element_type:"label",text_content:tstring.numismatic_comments||"Numismatic comments",parent:o});const e=t.numismatic_comments;common.create_dom_element({element_type:"div",class_name:"info_value",inner_html:e,parent:o})}if(t.bibliography_data&&t.bibliography_data.length>0){common.create_dom_element({element_type:"label",text_content:tstring.bibliographic_references||"Bibliographic references",parent:o});for(var m=0;m<t.bibliography_data.length;m++){const e=t.bibliography_data[m];!0===SHOW_DEBUG&&console.log("bibliographic_reference:",e);const n=e.description;n.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.description||"Description",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",inner_html:n,parent:o}));const a=common.clean_gaps(e.items," | ",", ");a.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.info||"Info",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",inner_html:a,parent:o}));const _=e.pages;_.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.pages||"Pages",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:_,parent:o}))}}return n.appendChild(a),n},draw_types:function(e){const t=e.target,n=e.ar_rows,a=n.length;let o=new Intl.Collator("es",{sensitivity:"base",ignorePunctuation:!0});for(n.sort((e,t)=>{let n=e.catalogue+" "+e.number,a=t.catalogue+" "+t.number;return o.compare(n,a)});t.hasChildNodes();)t.removeChild(t.lastChild);const m=new DocumentFragment;common.create_dom_element({element_type:"label",text_content:tstring.types||"Types",parent:m}),console.groupCollapsed("Types info");for(let e=0;e<a;e++){const t=n[e];!0===SHOW_DEBUG&&console.log("type row_object:",t);const a=common.create_dom_element({element_type:"div",class_name:"type_row",parent:m});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:t.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata3&id="+t.section_id,parent:a}).setAttribute("target","_blank")}common.create_dom_element({element_type:"span",text_content:t.catalogue+" "+t.number,parent:a});const o=common.clean_gaps(t.material," | ",", ");if(o.length>0){common.create_dom_element({element_type:"span",text_content:" ("+o+")",parent:a})}}return console.groupEnd(),t.appendChild(m),t},draw_map:function(e){const t=e.map_data,n=e.popup_data,a=t,o=document.getElementById("map_container");this.map=this.map||new map_factory,this.map.init({map_container:o,map_position:a,popup_builder:page.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:page.maps_config.source_maps});const m=this.map_data(t,n);return this.map.parse_data_to_map(m,null).then((function(){o.classList.remove("hide_opacity")})),!0},map_data:function(e,t){const n=Array.isArray(e)?e:[e],a=[];for(let e=0;e<n.length;e++){const o={lat:n[e].lat,lon:n[e].lon,marker_icon:page.maps_config.markers.mint,data:t};a.push(o)}return a}};