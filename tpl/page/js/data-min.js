"use strict";page.parse_type_data=function(e){const r=this;if(Array.isArray(e)){const _=[];for(let t=0;t<e.length;t++)_.push(r.parse_type_data(e[t]));return _}const _=e;if("object"!=typeof _&&(console.log("parse_type_data row:",_),console.trace()),_.parsed)return _;try{_.ref_coins_image_obverse=void 0!==e.ref_coins_image_obverse?common.local_to_remote_path(e.ref_coins_image_obverse):null,_.ref_coins_image_reverse=void 0!==e.ref_coins_image_reverse?common.local_to_remote_path(e.ref_coins_image_reverse):null,_.ref_coins_union&&Array.isArray(_.ref_coins_union)&&_.ref_coins_union.length>0&&(_.ref_coins_union=page.parse_coin_data(_.ref_coins_union)),_.uri=r.parse_iri_data(_.uri),_.legend_obverse=_.legend_obverse?r.parse_legend_svg(_.legend_obverse):null,_.legend_reverse=_.legend_reverse?r.parse_legend_svg(_.legend_reverse):null,_.material=_.material?page.trim_char(page.remove_gaps(_.material," | "),"|"):null,_.symbol_obverse=_.symbol_obverse?page.trim_char(page.remove_gaps(_.symbol_obverse," | "),"|"):null,_.symbol_reverse=_.symbol_reverse?page.trim_char(page.remove_gaps(_.symbol_reverse," | "),"|"):null,_.symbol_obverse_data=JSON.parse(_.symbol_obverse_data),_.symbol_reverse_data=JSON.parse(_.symbol_reverse_data),_.parsed=!0}catch(e){console.error("ERROR CATCH ",e),console.warn("row:",_)}return _},page.parse_coin_data=function(e){const r=this;if(Array.isArray(e)){const r=[];for(let _=0;_<e.length;_++)r.push(page.parse_coin_data(e[_]));return r}const _=e;if("object"!=typeof _&&(console.log("parse_coin_data row:",_),console.trace()),_.parsed)return _;try{if(_.image_obverse=common.local_to_remote_path(e.image_obverse),_.image_obverse_thumb=_.image_obverse?_.image_obverse.replace("/1.5MB/","/thumb/"):null,_.image_reverse=common.local_to_remote_path(e.image_reverse),_.image_reverse_thumb=_.image_reverse?_.image_reverse.replace("/1.5MB/","/thumb/"):null,_.type_data&&Array.isArray(_.type_data)&&_.type_data.length>0&&(_.type_data=r.parse_type_data(_.type_data)),_.type=_.type?page.remove_gaps(_.type," | "):null,_.legend_obverse=_.legend_obverse?r.parse_legend_svg(_.legend_obverse):null,_.legend_reverse=_.legend_reverse?r.parse_legend_svg(_.legend_reverse):null,_.countermark_obverse=_.countermark_obverse?r.parse_legend_svg(_.countermark_obverse):null,_.countermark_reverse=_.countermark_reverse?r.parse_legend_svg(_.countermark_reverse):null,_.ref_auction=_.ref_auction?JSON.parse(_.ref_auction):null,_.ref_auction_date=_.ref_auction_date?JSON.parse(_.ref_auction_date):null,_.ref_auction_number=_.ref_auction_number?JSON.parse(_.ref_auction_number):null,_.ref_auction_group=null,_.ref_auction&&_.ref_auction.length>0){_.ref_auction_group=[];for(let e=0;e<_.ref_auction.length;e++)_.ref_auction_group.push({name:_.ref_auction[e],date:void 0!==_.ref_auction_date[e]?r.parse_date(_.ref_auction_date[e]):"",number:void 0!==_.ref_auction_number[e]?_.ref_auction_number[e]:""})}if(_.ref_related_coin_auction=_.ref_related_coin_auction?JSON.parse(_.ref_related_coin_auction):null,_.ref_related_coin_auction_date=_.ref_related_coin_auction_date?JSON.parse(_.ref_related_coin_auction_date):null,_.ref_related_coin_auction_number=_.ref_related_coin_auction_number?JSON.parse(_.ref_related_coin_auction_number):null,_.ref_related_coin_auction_group=null,_.ref_related_coin_auction&&_.ref_related_coin_auction.length>0){_.ref_related_coin_auction_group=[];for(let e=0;e<_.ref_related_coin_auction.length;e++)_.ref_related_coin_auction_group.push({name:_.ref_related_coin_auction[e],date:void 0!==_.ref_related_coin_auction_date[e]?r.parse_date(_.ref_related_coin_auction_date[e]):"",number:void 0!==_.ref_related_coin_auction_number[e]?_.ref_related_coin_auction_number[e]:""})}_.find_date=r.parse_date(_.find_date),_.mib_uri=page_globals.__WEB_BASE_URL__+page_globals.__WEB_ROOT_WEB__+"/coin/"+_.section_id,_.uri=r.parse_iri_data(_.uri),_.bibliography_data&&Array.isArray(_.bibliography_data)&&(_.bibliography=page.parse_publication(_.bibliography_data)),_.mint=_.type_dat&&void 0!==_.type_data[0]?_.type_data[0].mint:null,_.type_number=_.type_data&&void 0!==_.type_data[0]?_.type_data[0].number:null,_.parsed=!0}catch(e){console.error("ERROR CATCH ",e),console.warn("row:",_)}return _},page.parse_catalog_data=function(e){const r=this;if(!e)return[];Array.isArray(e)||(e=[e]);const _=[];try{const a=e.length;for(let n=0;n<a;n++){const a=e[n];a.parsed||(a.coins_data_union=a.coins_data_union?JSON.parse(a.coins_data_union):null,a.coin_references=a.coin_references?JSON.parse(a.coin_references):null,a.ref_coins_image_obverse=common.local_to_remote_path(a.ref_coins_image_obverse),a.ref_coins_image_reverse=common.local_to_remote_path(a.ref_coins_image_reverse),a.ref_coins_image_obverse_thumb=a.ref_coins_image_obverse?a.ref_coins_image_obverse.replace("/1.5MB/","/thumb/"):null,a.ref_coins_image_reverse_thumb=a.ref_coins_image_reverse?a.ref_coins_image_reverse.replace("/1.5MB/","/thumb/"):null,a.ref_type_legend_obverse=a.ref_type_legend_obverse?r.parse_legend_svg(a.ref_type_legend_obverse):null,a.ref_type_legend_reverse=a.ref_type_legend_reverse?r.parse_legend_svg(a.ref_type_legend_reverse):null,a.ref_type_symbol_obverse=a.ref_type_symbol_obverse?r.parse_legend_svg(a.ref_type_symbol_obverse):null,a.ref_type_symbol_reverse=a.ref_type_symbol_reverse?r.parse_legend_svg(a.ref_type_symbol_reverse):null,a.term_data=JSON.parse(a.term_data),a.term_section_id=a.term_data?a.term_data[0]:null,a.children=JSON.parse(a.children),a.parent=a.parent&&Array.isArray(a.parent)?(t=a.parent,page.parse_catalog_data(t)):JSON.parse(a.parent),a.ref_type_averages_diameter=a.ref_type_averages_diameter?parseFloat(a.ref_type_averages_diameter.replace(",",".")):null,a.ref_type_total_diameter_items=a.ref_type_total_diameter_items?parseFloat(a.ref_type_total_diameter_items.replace(",",".")):null,a.ref_type_averages_weight=a.ref_type_averages_weight?parseFloat(a.ref_type_averages_weight.replace(",",".")):null,a.ref_type_total_weight_items=a.ref_type_total_weight_items?parseFloat(a.ref_type_total_weight_items.replace(",",".")):null,a.ref_type_material=page.trim_char(a.ref_type_material,"|"),_.push(a))}for(let r=0;r<a;r++){const t=_[r];if(!t.parsed&&"types"===t.term_table&&t.children){const r=[],_=[];for(let a=0;a<t.children.length;a++){const n=t.children[a],o=e.find(e=>e.section_id==n);if(o&&o.ref_type_averages_weight){const e=o.ref_type_total_weight_items,r=new Array(e).fill(o.ref_type_averages_weight);_.push(...r)}if(o&&o.ref_type_averages_diameter){const e=o.ref_type_total_diameter_items,_=new Array(e).fill(o.ref_type_averages_diameter);r.push(..._)}}const a=_.reduce((e,r)=>e+r,0)/_.length,n=r.reduce((e,r)=>e+r,0)/r.length;t.ref_type_averages_weight=a,t.ref_type_averages_diameter=n,t.ref_type_total_weight_items=_.length,t.ref_type_total_diameter_items=r.length}t.parsed=!0}}catch(e){console.error("ERROR CATCH ",e),console.warn("new_data:",_)}var t;return _},page.parse_publication=function(e){const r=[];try{const _=" # ",t=e.length;for(let a=0;a<t;a++){const t=e[a];if(t.parsed)continue;t._publications=[];const n=JSON.parse(t.publications_data),o=n.length;if(o>0){const e=page.split_data(t.ref_publications_authors,_),a=page.split_data(t.ref_publications_date,_),s=page.split_data(t.ref_publications_editor,_),i=page.split_data(t.ref_publications_magazine,_),l=page.split_data(t.ref_publications_place,_),c=page.split_data(t.ref_publications_title,_),p=page.split_data(t.ref_publications_url,_);for(let _=0;_<o;_++){const o=n[_],u={reference:t.section_id,section_id:o,authors:e[_]||null,date:a[_]||null,editor:s[_]||null,magazine:i[_]||null,place:l[_]||null,title:c[_]||null,url:p[_]||null};t._publications.push(u),r.push(u)}}t.parsed=!0}}catch(e){console.error("ERROR CATCH ",e),console.warn("row:",row)}return r},page.parse_map_global_data=function(e){try{const r=e.length;for(let _=0;_<r;_++){const r=e[_];if(!r.parsed){if(r.georef_geojson=r.georef_geojson?JSON.parse(r.georef_geojson):null,r.coins_list=r.coins_list?JSON.parse(r.coins_list):[],r.types_list=r.types_list?JSON.parse(r.types_list):[],r.georef_geojson&&r.georef_geojson.length>0){const e=function(e){let r;switch(e){case"mints":r="mint";break;case"hoards":r="hoard";break;case"findspots":r="findspot"}return r}(r.table),_=r.coins_list?r.coins_list.length:0,t=r.types_list?r.types_list.length:0,a='<span class="note">'+(tstring[e]||e)+"</span> "+r.name,n=(tstring.coins||"Coins")+" "+_+"<br>"+(tstring.types||"Types")+" "+t,o={section_id:r.section_id,title:a,coins_total:_,types_total:t,description:n,ref_section_id:r.ref_section_id,ref_section_tipo:r.ref_section_tipo,table:r.table,name:r.name,term_id:r.section_id},s=page.maps_config.markers[e],i={lat:null,lon:null,geojson:r.georef_geojson,marker_icon:s,data:o};r.item=i}else r.item=null;r.parsed=!0}}}catch(r){console.error("ERROR CATCH ",r),console.warn("ar_rows:",e)}return e},page.parse_iri_data=function(e){const r=[];if(!e||e.length<1)return r;const _=e.split(" | ");for(let e=0;e<_.length;e++){const t=_[e].split(", ");if(t.length>1&&void 0===t[1])continue;const a=1===t.length?t[0]:t[1];let n=1===t.length?"":t[0];if(n.length<1)try{n=new URL(a).hostname}catch(e){console.error(e)}r.push({label:n,value:a})}return r};