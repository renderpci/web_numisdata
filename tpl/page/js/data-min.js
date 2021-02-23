"use strict";page.parse_type_data=function(e){const r=this;if(Array.isArray(e)){const _=[];for(let t=0;t<e.length;t++)_.push(r.parse_type_data(e[t]));return _}const _=e;return"object"!=typeof _&&(console.log("parse_type_data row:",_),console.trace()),_.parsed||(_.ref_coins_image_obverse=void 0!==e.ref_coins_image_obverse?common.local_to_remote_path(e.ref_coins_image_obverse):null,_.ref_coins_image_reverse=void 0!==e.ref_coins_image_reverse?common.local_to_remote_path(e.ref_coins_image_reverse):null,_.ref_coins_union&&Array.isArray(_.ref_coins_union)&&_.ref_coins_union.length>0&&(_.ref_coins_union=page.parse_coin_data(_.ref_coins_union)),_.uri=r.parse_iri_data(_.uri),_.legend_obverse=_.legend_obverse?r.parse_legend_svg(_.legend_obverse):null,_.legend_reverse=_.legend_reverse?r.parse_legend_svg(_.legend_reverse):null,_.material=_.material?page.trim_char(page.remove_gaps(_.material," | "),"|"):null,_.symbol_obverse=_.symbol_obverse?page.trim_char(page.remove_gaps(_.symbol_obverse," | "),"|"):null,_.symbol_reverse=_.symbol_reverse?page.trim_char(page.remove_gaps(_.symbol_reverse," | "),"|"):null,_.symbol_obverse_data=JSON.parse(_.symbol_obverse_data),_.symbol_reverse_data=JSON.parse(_.symbol_reverse_data),_.parsed=!0),_},page.parse_coin_data=function(e){const r=this;if(Array.isArray(e)){const r=[];for(let _=0;_<e.length;_++)r.push(page.parse_coin_data(e[_]));return r}const _=e;if("object"!=typeof _&&(console.log("parse_coin_data row:",_),console.trace()),_.parsed)return _;if(_.image_obverse=common.local_to_remote_path(e.image_obverse),_.image_obverse_thumb=_.image_obverse?_.image_obverse.replace("/1.5MB/","/thumb/"):null,_.image_reverse=common.local_to_remote_path(e.image_reverse),_.image_reverse_thumb=_.image_reverse?_.image_reverse.replace("/1.5MB/","/thumb/"):null,_.type_data&&Array.isArray(_.type_data)&&_.type_data.length>0&&(_.type_data=r.parse_type_data(_.type_data)),_.type=_.type?page.remove_gaps(_.type," | "):null,_.legend_obverse=_.legend_obverse?r.parse_legend_svg(_.legend_obverse):null,_.legend_reverse=_.legend_reverse?r.parse_legend_svg(_.legend_reverse):null,_.countermark_obverse=_.countermark_obverse?r.parse_legend_svg(_.countermark_obverse):null,_.countermark_reverse=_.countermark_reverse?r.parse_legend_svg(_.countermark_reverse):null,_.ref_auction=_.ref_auction?JSON.parse(_.ref_auction):null,_.ref_auction_date=_.ref_auction_date?JSON.parse(_.ref_auction_date):null,_.ref_auction_number=_.ref_auction_number?JSON.parse(_.ref_auction_number):null,_.ref_auction_group=null,_.ref_auction&&_.ref_auction.length>0){_.ref_auction_group=[];for(let e=0;e<_.ref_auction.length;e++)_.ref_auction_group.push({name:_.ref_auction[e],date:void 0!==_.ref_auction_date[e]?r.parse_date(_.ref_auction_date[e]):"",number:void 0!==_.ref_auction_number[e]?_.ref_auction_number[e]:""})}if(_.ref_related_coin_auction=_.ref_related_coin_auction?JSON.parse(_.ref_related_coin_auction):null,_.ref_related_coin_auction_date=_.ref_related_coin_auction_date?JSON.parse(_.ref_related_coin_auction_date):null,_.ref_related_coin_auction_number=_.ref_related_coin_auction_number?JSON.parse(_.ref_related_coin_auction_number):null,_.ref_related_coin_auction_group=null,_.ref_related_coin_auction&&_.ref_related_coin_auction.length>0){_.ref_related_coin_auction_group=[];for(let e=0;e<_.ref_related_coin_auction.length;e++)_.ref_related_coin_auction_group.push({name:_.ref_related_coin_auction[e],date:void 0!==_.ref_related_coin_auction_date[e]?r.parse_date(_.ref_related_coin_auction_date[e]):"",number:void 0!==_.ref_related_coin_auction_number[e]?_.ref_related_coin_auction_number[e]:""})}return _.find_date=r.parse_date(_.find_date),_.mib_uri=page_globals.__WEB_BASE_URL__+page_globals.__WEB_ROOT_WEB__+"/coin/"+_.section_id,_.uri=r.parse_iri_data(_.uri),_.bibliography_data&&Array.isArray(_.bibliography_data)&&(_.bibliography=page.parse_publication(_.bibliography_data)),_.mint=_.type_dat&&void 0!==_.type_data[0]?_.type_data[0].mint:null,_.type_number=_.type_data&&void 0!==_.type_data[0]?_.type_data[0].number:null,_.parsed=!0,_},page.parse_catalog_data=function(e){const r=this;if(!e)return[];Array.isArray(e)||(e=[e]);const _=[],t=e.length;for(let n=0;n<t;n++){const t=e[n];t.parsed||(t.ref_coins_image_obverse=common.local_to_remote_path(t.ref_coins_image_obverse),t.ref_coins_image_reverse=common.local_to_remote_path(t.ref_coins_image_reverse),t.ref_coins_image_obverse_thumb=t.ref_coins_image_obverse?t.ref_coins_image_obverse.replace("/1.5MB/","/thumb/"):null,t.ref_coins_image_reverse_thumb=t.ref_coins_image_reverse?t.ref_coins_image_reverse.replace("/1.5MB/","/thumb/"):null,t.ref_type_legend_obverse=t.ref_type_legend_obverse?r.parse_legend_svg(t.ref_type_legend_obverse):null,t.ref_type_legend_reverse=t.ref_type_legend_reverse?r.parse_legend_svg(t.ref_type_legend_reverse):null,t.ref_type_symbol_obverse=t.ref_type_symbol_obverse?r.parse_legend_svg(t.ref_type_symbol_obverse):null,t.ref_type_symbol_reverse=t.ref_type_symbol_reverse?r.parse_legend_svg(t.ref_type_symbol_reverse):null,t.term_data=JSON.parse(t.term_data),t.term_section_id=t.term_data?t.term_data[0]:null,t.children=JSON.parse(t.children),t.parent=t.parent&&Array.isArray(t.parent)?(a=t.parent,page.parse_catalog_data(a)):JSON.parse(t.parent),t.ref_type_averages_diameter=t.ref_type_averages_diameter?parseFloat(t.ref_type_averages_diameter.replace(",",".")):null,t.ref_type_total_diameter_items=t.ref_type_total_diameter_items?parseFloat(t.ref_type_total_diameter_items.replace(",",".")):null,t.ref_type_averages_weight=t.ref_type_averages_weight?parseFloat(t.ref_type_averages_weight.replace(",",".")):null,t.ref_type_total_weight_items=t.ref_type_total_weight_items?parseFloat(t.ref_type_total_weight_items.replace(",",".")):null,t.ref_type_material=page.trim_char(t.ref_type_material,"|"),_.push(t))}var a;for(let r=0;r<t;r++){const t=_[r];if(!t.parsed&&"types"===t.term_table&&t.children){const r=[],_=[];for(let a=0;a<t.children.length;a++){const n=t.children[a],o=e.find(e=>e.section_id==n);if(o&&o.ref_type_averages_weight){const e=o.ref_type_total_weight_items,r=new Array(e).fill(o.ref_type_averages_weight);_.push(...r)}if(o&&o.ref_type_averages_diameter){const e=o.ref_type_total_diameter_items,_=new Array(e).fill(o.ref_type_averages_diameter);r.push(..._)}}const a=_.reduce((e,r)=>e+r,0)/_.length,n=r.reduce((e,r)=>e+r,0)/r.length;t.ref_type_averages_weight=a,t.ref_type_averages_diameter=n,t.ref_type_total_weight_items=_.length,t.ref_type_total_diameter_items=r.length}t.parsed=!0}return _},page.parse_publication=function(e){const r=[],_=e.length;for(let t=0;t<_;t++){const _=e[t];if(_.parsed)continue;_._publications=[];const a=JSON.parse(_.publications_data),n=a.length;if(n>0){const e=page.split_data(_.ref_publications_authors," # "),t=page.split_data(_.ref_publications_date," # "),o=page.split_data(_.ref_publications_editor," # "),s=page.split_data(_.ref_publications_magazine," # "),i=page.split_data(_.ref_publications_place," # "),l=page.split_data(_.ref_publications_title," # "),p=page.split_data(_.ref_publications_url," # ");for(let c=0;c<n;c++){const n=a[c],g={reference:_.section_id,section_id:n,authors:e[c]||null,date:t[c]||null,editor:o[c]||null,magazine:s[c]||null,place:i[c]||null,title:l[c]||null,url:p[c]||null};_._publications.push(g),r.push(g)}}_.parsed=!0}return r},page.parse_map_global_data=function(e){const r=e.length;for(let _=0;_<r;_++){const r=e[_];if(!r.parsed){if(r.georef_geojson=r.georef_geojson?JSON.parse(r.georef_geojson):null,r.coins_list=r.coins_list?JSON.parse(r.coins_list):[],r.types_list=r.types_list?JSON.parse(r.types_list):[],r.georef_geojson&&r.georef_geojson.length>0){const e=function(e){let r;switch(e){case"mints":r="mint";break;case"hoards":r="hoard";break;case"findspots":r="findspot"}return r}(r.table),_='<span class="note">'+(tstring[e]||e)+"</span> "+r.name,t=(tstring.coins||"Coins")+" "+r.coins_list.length+"<br>"+(tstring.types||"Types")+" "+r.types_list.length,a={section_id:r.section_id,title:_,coins_total:r.coins_list.length,types_total:r.types_list.length,description:t,ref_section_id:r.ref_section_id,ref_section_tipo:r.ref_section_tipo,table:r.table,name:r.name,term_id:r.section_id},n=page.maps_config.markers[e],o={lat:null,lon:null,geojson:r.georef_geojson,marker_icon:n,data:a};r.item=o}else r.item=null;r.parsed=!0}}return e},page.parse_iri_data=function(e){const r=[];if(!e||e.length<1)return r;const _=e.split(" | ");for(let e=0;e<_.length;e++){const t=_[e].split(", ");if(t.length>1&&void 0===t[1])continue;const a=1===t.length?t[0]:t[1];let n=1===t.length?"":t[0];if(n.length<1)try{n=new URL(a).hostname}catch(e){console.error(e)}r.push({label:n,value:a})}return r};