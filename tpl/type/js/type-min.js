"use strict";var type={search_options:{},map:null,export_data_container:null,section_id:null,set_up:function(e){const t=this;t.export_data_container=e.export_data_container,t.section_id=e.section_id;const a=page.render_export_data_buttons();t.export_data_container.appendChild(a),t.export_data_container.classList.add("hide");const o=page.create_suggestions_button();return t.export_data_container.appendChild(o),void 0!==t.section_id&&t.get_row_data({section_id:t.section_id}).then((function(e){const a=document.getElementById("row_detail");for(;a.hasChildNodes();)a.removeChild(a.lastChild);const o=e.result.find((e=>"type"===e.id)),n=e.result.find((e=>"catalog"===e.id));if(void 0!==o.result[0]){const e=o.result[0],i=page.parse_catalog_data(n.result)[0]||null;e.catalog=i,page.parse_type_data(e),event_manager.publish("data_request_done",{request_body:null,result:e,export_data_parser:page.export_parse_type_data}),t.list_row_builder(e).then((function(e){a.appendChild(e);const o=e.querySelectorAll("a");if(o&&o.length>0){e.querySelector(".identify_coin_wrapper").remove();Object.create(image_gallery).set_up_embedded({galleryNode:o,galleryPrimId:"embedded-gallery-id",containerId:"embedded-gallery"})}const n=e.querySelectorAll(".gallery");if(n)for(let e=0;e<n.length;e++)page.activate_images_gallery(n[e]);t.export_data_container.classList.remove("hide")}))}})),!0},get_row_data:function(e){const t=e.section_id,a=e.lang||page_globals.WEB_CURRENT_LANG_CODE,o=[];o.push({id:"type",options:{dedalo_get:"records",table:"types",ar_fields:["*"],lang:a,sql_filter:"section_id = "+parseInt(t),count:!1,resolve_portals_custom:{bibliography_data:"bibliographic_references",ref_coins_union:"coins",coin_references:"coins","coins.bibliography_data":"bibliographic_references",ref_coins_findspots_data:"findspots","findspots.bibliography_data":"bibliographic_references",ref_coins_hoard_data:"hoards","hoards.bibliography_data":"bibliographic_references",denomination_data:"denomination",material_data:"material",related_types_data:"types",mint_data:"mints"}}});o.push({id:"catalog",options:{dedalo_get:"records",table:"catalog",ar_fields:["section_id","term","term_data","term_table","term_section_tipo","parents","ref_mint_number","full_coins_reference_calculable","full_coins_reference_diameter_max","full_coins_reference_weight","full_coins_reference_axis"],lang:a,count:!1,sql_filter:"term_data='[\""+parseInt(t)+"\"]' AND term_table='types'",resolve_portals_custom:{parents:"catalog"}}});return data_manager.request({body:{dedalo_get:"combi",ar_calls:o}})},list_row_builder:function(e){const t=this;return new Promise((function(a){t.parse_publication(e.bibliography_data);const o=e.ref_coins_union.length;for(let a=0;a<o;a++){const o=e.ref_coins_union[a];t.parse_publication(o.bibliography_data)}const n=e.ref_coins_findspots_data.length;for(let a=0;a<n;a++){const o=e.ref_coins_findspots_data[a];t.parse_publication(o.bibliography_data)}const i=e.ref_coins_hoard_data.length;for(let a=0;a<i;a++){const o=e.ref_coins_hoard_data[a];t.parse_publication(o.bibliography_data)}t.parse_ordered_coins(e),type_row_fields_min.type_row_fields.caller=t;a(type_row_fields_min.type_row_fields.draw_item(e))}))},parse_publication:function(e){return page.parse_publication(e)},parse_ordered_coins:function(e){const t=[],a=" | ",o=page.split_data(e.ref_coins_typology_data,a),n=o.length,i=page.split_data(e.ref_coins_typology,a),_=page.split_data(e.ref_coins,a);for(let e=0;e<n;e++){const a=o[e]?JSON.parse(o[e])[0]:null,n=_[e]?JSON.parse(_[e]):[],r={typology_id:a,typology:i[e]||null,coins:n};t.push(r)}return e._coins_group=t,t},draw_map:function(e){const t=this,a=e.map_data,o=e.container,n=e.map_position,i=e.popup_data;t.map=t.map||new map_factory,t.map.init({map_container:o,map_position:n,popup_builder:t.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:page.maps_config.source_maps,legend:page.render_map_legend});const _=t.map_data(a,i);return t.map.parse_data_to_map(_,null).then((function(){o.classList.remove("hide_opacity")})),!0},map_data:function(e){const t=[];for(let a=0;a<e.length;a++){const o={lat:parseFloat(e[a].data.lat),lon:parseFloat(e[a].data.lon),marker_icon:e[a].marker_icon||null,data:{section_id:e[a].section_id,name:e[a].name,place:e[a].place,type:e[a].type,items:e[a].items,total_items:e[a].total_items}};t.push(o)}return t},map_popup_builder:function(e){const t=e.group[0],a=t.name,o=t.total_items,n=t.items,i=t.section_id,_=common.create_dom_element({element_type:"div",class_name:"popup_wrapper"}),r=common.create_dom_element({element_type:"div",class_name:"popup_item",title:i,parent:_});common.create_dom_element({element_type:"div",class_name:"text_title",inner_html:a,parent:r});if(o&&o>0){const e=tstring.items+": "+n+" "+(tstring.of||"of")+" "+o;common.create_dom_element({element_type:"div",class_name:"text_description",inner_html:e,parent:r})}return _}};
//# sourceMappingURL=type-min.js.map