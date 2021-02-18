"use strict";var hoard={search_options:{},map:null,set_up:function(o){const t=this,a=document.getElementById("row_detail");if(void 0!==o.section_id&&o.section_id>0){t.get_row_data({section_id:o.section_id}).then((function(e){console.log("[set_up->get_row_data] response:",e),e.result&&e.result.length>0?t.draw_row({target:a,ar_rows:e.result}).then((function(){const o=JSON.parse(e.result[0].map);t.draw_map({map_data:o})})):a.innerHTML="Sorry. Empty result for section_id: "+o.section_id}))}else a.innerHTML="Error. Invalid section_id";return!0},get_row_data:function(o){const t=o.section_id,a="section_id="+parseInt(t);return data_manager.request({body:{dedalo_get:"records",db_name:page_globals.WEB_DB,lang:page_globals.WEB_CURRENT_LANG_CODE,table:"hoards",ar_fields:["*"],sql_filter:a,limit:1,count:!1,offset:0,resolve_portals_custom:{coins_data:"coins"}}})},draw_row:function(o){const t=this;return new Promise((function(a){const e=o.ar_rows[0],n=o.target;for(console.log("draw_row row_object:",e),t.row_object=e,!0===SHOW_DEBUG&&console.log("coin row_object:",e);n.hasChildNodes();)n.removeChild(n.lastChild);const r=new DocumentFragment,s=hoard_row.draw_hoard(e);r.appendChild(s),n.appendChild(r),a(n)}))},draw_map:function(o){const t=o.map_data,a=t,e=document.getElementById("map_container");this.map=this.map||new map_factory,this.map.init({map_container:e,map_position:a,popup_builder:page.map_popup_builder,popup_options:page.maps_config.popup_options,source_maps:page.maps_config.source_maps});const n=this.map_data(t);return this.map.parse_data_to_map(n,null).then((function(){e.classList.remove("hide_opacity")})),!0},map_data:function(o){console.log("--map_data data:",o);const t=Array.isArray(o)?o:[o],a=[];for(let o=0;o<t.length;o++){const e={lat:t[o].lat,lon:t[o].lon,marker_icon:page.maps_config.markers.hoard,data:{section_id:null,title:"",description:""}};a.push(e)}return console.log("--map_data data_clean:",a),a}};