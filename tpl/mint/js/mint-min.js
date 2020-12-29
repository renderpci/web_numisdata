"use strict";var mint={set_up:function(e){const t=this,n=e.section_id;return n&&t.get_row_data({section_id:n}).then((function(e){console.log("--\x3e set_up get_row_data API response:",e.result[1]);const n=e.result.find(e=>"mint"===e.id);t.draw_row({target:document.getElementById("row_detail"),ar_rows:n.result}),t.draw_map({map_data:JSON.parse(n.result[0].map),popup_data:{section_id:n.result[0].section_id,title:n.result[0].name,description:n.result[0].history.trim()}});const a=e.result.find(e=>"mint_catalog"===e.id);a.result&&t.get_types_data({section_id:a.result[0].section_id}).then((function(e){t.draw_types({target:document.getElementById("types"),ar_rows:e})}));var o=e.result[0].result[0].bibliography_data;if(console.log(o),o.length>0){var l=[];for(let e=0;e<o.length;e++)l.push(o[e].publications_data);console.log("BB",l)}})),!0},get_row_data:function(e){const t=e.section_id,n=[];n.push({id:"mint",options:{dedalo_get:"records",table:"mints",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","lang","name","place_data","place","history","numismatic_comments","bibliography_data","map"],sql_filter:"section_id = "+parseInt(t),count:!1,resolve_portals_custom:{bibliography_data:"bibliographic_references"}}}),n.push({id:"mint_catalog",options:{dedalo_get:"records",table:"catalog",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["section_id","term"],count:!1,limit:0,sql_filter:"term_data='[\""+parseInt(t)+"\"]'"}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:n}})},get_types_data:function(e){const t=e.section_id;return new Promise((function(e){data_manager.request({body:{dedalo_get:"records",table:"catalog",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,ar_fields:["term_data","ref_type_denomination","term","parent","parents","children"],count:!1,limit:0,order:"norder ASC",sql_filter:"term_table='types' AND parents LIKE '%\""+parseInt(t)+"\"%'"}}).then((function(t){const n=[];if(t.result&&t.result.length>0)for(let e=0;e<t.result.length;e++){const a={catalog:"MIB",section_id:t.result[e].term_data.replace(/[\["\]]/g,""),denomination:t.result[e].ref_type_denomination,number:t.result[e].term,parent:JSON.parse(t.result[e].parent)[0],parents:JSON.parse(t.result[e].parents),children:JSON.parse(t.result[e].children)};n.push(a)}console.log("--\x3e get_types_data types_data:",n),e(n)}))}))},draw_row:function(e){const t=e.ar_rows[0],n=e.target;for(self.row_object=t,!0===SHOW_DEBUG&&console.log("Mint row_object:",t);n.hasChildNodes();)n.removeChild(n.lastChild);const a=new DocumentFragment,o=common.create_dom_element({element_type:"div",class_name:"",parent:a});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:t.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata6&id="+t.section_id,parent:o}).setAttribute("target","_blank")}if(t.name&&t.name.length>0){const e=common.create_dom_element({element_type:"div",class_name:"line-tittle-wrap",parent:o});common.create_dom_element({element_type:"label",class_name:"value-term",text_content:tstring.name||"Name:",parent:e});const n=t.name;common.create_dom_element({element_type:"div",class_name:"line-tittle",text_content:n,parent:e})}if(t.place&&t.place.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.place||"Place",parent:e});const n=t.place;common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:o})}if(t.history&&t.history.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.history||"History",parent:e});_(t.history,o)}if(t.numismatic_comments&&t.numismatic_comments.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.numismatic_comments||"Numismatic comments",parent:e});_(t.numismatic_comments,o)}if(t.bibliography_data&&t.bibliography_data.length>0){const e=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:o});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.bibliographic_references||"Bibliographic references",parent:e});for(var l=0;l<t.bibliography_data.length;l++){const e=t.bibliography_data[l];!0===SHOW_DEBUG&&console.log("bibliographic_reference:",e);const n=e.description;n.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.description||"Description",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",inner_html:n,parent:o}));const a=common.clean_gaps(e.items," | ",", ");a.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.info||"Info",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",inner_html:a,parent:o}));const _=e.pages;_.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.pages||"Pages",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:_,parent:o}));const m=common.clean_gaps(e.ref_publications_authors," | ",", ");m.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.authors||"Authors",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:m,parent:o}));const c=common.clean_gaps(e.ref_publications_date," | ",", ");c.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.date||"Date",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:c,parent:o}));const r=common.clean_gaps(e.ref_publications_editor," | ",", ");r.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.editor||"Editor",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:r,parent:o}));const s=common.clean_gaps(e.ref_publications_magazine," | ",", ");r.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.magazine||"Magazine",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:s,parent:o}));const i=common.clean_gaps(e.ref_publications_place," | ",", ");i.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.place||"Place",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:i,parent:o}));const p=common.clean_gaps(e.ref_publications_title," | ",", ");p.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.title||"Place",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:p,parent:o}));const d=common.clean_gaps(e.ref_publications_url," | ",", ");d.length>0&&(common.create_dom_element({element_type:"label",text_content:tstring.url||"Url",parent:o}),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:d,parent:o}))}}return n.appendChild(a),n;function _(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:e,parent:t});if(e.length>500){n.classList.add("contracted-block");const e=common.create_dom_element({element_type:"div",class_name:"text-block-separator",parent:t}),a=common.create_dom_element({element_type:"div",class_name:"separator-arrow",parent:e});e.addEventListener("click",(function(){n.classList.contains("contracted-block")?(n.classList.remove("contracted-block"),a.style.transform="rotate(-90deg)"):(n.classList.add("contracted-block"),a.style.transform="rotate(90deg)")}))}}},draw_types:function(e){const t=e.target,n=e.ar_rows,a=n.length;let o=new Intl.Collator("es",{sensitivity:"base",ignorePunctuation:!0});for(n.sort((e,t)=>{let n=e.catalogue+" "+e.number,a=t.catalogue+" "+t.number;return o.compare(n,a)});t.hasChildNodes();)t.removeChild(t.lastChild);const l=new DocumentFragment;common.create_dom_element({element_type:"label",text_content:tstring.tipos||"Types",parent:l}),console.groupCollapsed("Types info");for(let e=0;e<a;e++){const t=n[e];!0===SHOW_DEBUG&&console.log("type row_object:",t);const a=common.create_dom_element({element_type:"div",class_name:"type_row",parent:l});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:t.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata3&id="+t.section_id,parent:a}).setAttribute("target","_blank")}common.create_dom_element({element_type:"span",text_content:t.catalogue+" "+t.number,parent:a});const o=common.clean_gaps(t.denomination," | ",", ");if(o.length>0){common.create_dom_element({element_type:"span",text_content:" ("+o+")",parent:a})}}return console.groupEnd(),t.appendChild(l),t},draw_map:function(e){const t=e.map_data,n=e.popup_data,a=t,o=document.getElementById("map_container");this.map=this.map||new map_factory,this.map.init({map_container:o,map_position:a,popup_builder:page.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:page.maps_config.source_maps});const l=this.map_data(t,n);return this.map.parse_data_to_map(l,null).then((function(){o.classList.remove("hide_opacity")})),!0},map_data:function(e,t){const n=Array.isArray(e)?e:[e],a=[];for(let e=0;e<n.length;e++){const o={lat:n[e].lat,lon:n[e].lon,marker_icon:page.maps_config.markers.mint,data:t};a.push(o)}return a}};