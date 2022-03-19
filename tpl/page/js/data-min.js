"use strict";page.parse_type_data=function(e){const r=this;if(Array.isArray(e)){const t=[];for(let a=0;a<e.length;a++)t.push(r.parse_type_data(e[a]));return t}const t=e;if("object"!=typeof t&&(console.log("parse_type_data row:",t),console.trace()),t.parsed)return t;try{t.ref_coins_image_obverse=void 0!==e.ref_coins_image_obverse?common.local_to_remote_path(e.ref_coins_image_obverse):page.default_image,t.ref_coins_image_reverse=void 0!==e.ref_coins_image_reverse?common.local_to_remote_path(e.ref_coins_image_reverse):page.default_image,t.ref_coins_union&&Array.isArray(t.ref_coins_union)?t.ref_coins_union=page.parse_coin_data(t.ref_coins_union):t.ref_coins_union=t.ref_coins_union?JSON.parse(t.ref_coins_union):null,t.coin_references&&Array.isArray(t.coin_references)?t.coin_references=page.parse_coin_data(t.coin_references):t.coin_references=t.coin_references?JSON.parse(t.coin_references):null,t.uri=r.parse_iri_data(t.uri),t.legend_obverse=t.legend_obverse?r.parse_legend_svg(t.legend_obverse):null,t.legend_reverse=t.legend_reverse?r.parse_legend_svg(t.legend_reverse):null,t.material=t.material?page.trim_char(page.remove_gaps(t.material," | "),"|"):null,t.symbol_obverse=t.symbol_obverse?r.parse_legend_svg(t.symbol_obverse):null,t.symbol_reverse=t.symbol_reverse?r.parse_legend_svg(t.symbol_reverse):null,t.symbol_obverse_data=JSON.parse(t.symbol_obverse_data),t.symbol_reverse_data=JSON.parse(t.symbol_reverse_data),t.term_data=t.term_data?JSON.parse(t.term_data):null,t.term_section_tipo=t.term_section_tipo?JSON.parse(t.term_section_tipo):null,t.term_section_label=t.term_section_label?JSON.parse(t.term_section_label):null,t.parsed=!0}catch(e){console.error("ERROR CATCH ",e),console.warn("row:",t)}return t},page.parse_mint_data=function(e){if(Array.isArray(e)){const r=[];for(let t=0;t<e.length;t++)r.push(page.parse_mint_data(e[t]));return r}const r=e;return"object"!=typeof r&&(console.log("parse_mint_data row:",r),console.trace()),!r||r.parsed||(r.georef_geojson=r.georef_geojson?JSON.parse(r.georef_geojson):null,r.map=r.map?JSON.parse(r.map):null,r.place_data=r.place_data?JSON.parse(r.place_data):null,r.uri=this.parse_iri_data(r.uri),r.relations_coins=r.relations_coins?JSON.parse(r.relations_coins):null,r.relations_types=r.relations_types?JSON.parse(r.relations_types):null),r},page.parse_hoard_data=function(e){if(Array.isArray(e)){const r=[];for(let t=0;t<e.length;t++)r.push(page.parse_hoard_data(e[t]));return r}const r=e;return"object"!=typeof r&&(console.log("parse_hoard_data row:",r),console.trace()),!r||r.parsed,r},page.parse_coin_data=function(e){const r=this;if(Array.isArray(e)){const r=[];for(let t=0;t<e.length;t++)r.push(page.parse_coin_data(e[t]));return r}const t=e;if("object"!=typeof t&&(console.log("parse_coin_data row:",t),console.trace()),!t||t.parsed)return t;try{t.image_obverse=t.image_obverse?common.local_to_remote_path(e.image_obverse):page.default_image,t.image_obverse_thumb=t.image_obverse?t.image_obverse.replace("/1.5MB/","/thumb/"):page.default_image,t.image_reverse=t.image_reverse?common.local_to_remote_path(e.image_reverse):page.default_image,t.image_reverse_thumb=t.image_reverse?t.image_reverse.replace("/1.5MB/","/thumb/"):page.default_image,t.type_data&&Array.isArray(t.type_data)?t.type_data=r.parse_type_data(t.type_data):(t.type_data=t.type_data?JSON.parse(t.type_data):null,t.type_section_id=t.type_data&&void 0!==t.type_data[0]?t.type_data[0]:null);const a=" | ";t.type=t.type?page.split_data(t.type,a):null;const _=t.mint_data?page.split_data(t.mint_data,a):[],n=[];for(let e=0;e<_.length;e++)n.push(JSON.parse(_[e]));t.mint_data=n||null;const o=t.mint_number?page.split_data(t.mint_number,a):[],s=[];for(let e=0;e<o.length;e++)s.push(JSON.parse(o[e]));t.mint_number=s||null;const i=t.mint?page.split_data(t.mint,a):[],l=[];for(let e=0;e<i.length;e++)if(i[e]){const r=0===i[e].indexOf('["')?JSON.parse(i[e]):i[e];r&&l.push(r)}if(t.mint=l||null,t.catalogue_type_mint=t.catalogue_type_mint?0===t.catalogue_type_mint.indexOf('["')?JSON.parse(t.catalogue_type_mint):t.catalogue_type_mint:null,t.legend_obverse=t.legend_obverse?r.parse_legend_svg(t.legend_obverse):null,t.legend_reverse=t.legend_reverse?r.parse_legend_svg(t.legend_reverse):null,t.countermark_obverse=t.countermark_obverse?r.parse_legend_svg(t.countermark_obverse):null,t.countermark_reverse=t.countermark_reverse?r.parse_legend_svg(t.countermark_reverse):null,t.ref_auction=t.ref_auction?JSON.parse(t.ref_auction):null,t.ref_auction_date=t.ref_auction_date?JSON.parse(t.ref_auction_date):null,t.ref_auction_number=t.ref_auction_number?JSON.parse(t.ref_auction_number):null,t.ref_auction_group=null,t.ref_auction&&t.ref_auction.length>0){t.ref_auction_group=[];for(let e=0;e<t.ref_auction.length;e++)t.ref_auction_group.push({name:t.ref_auction[e],date:void 0!==t.ref_auction_date[e]?r.parse_date(t.ref_auction_date[e]):"",number:void 0!==t.ref_auction_number[e]?t.ref_auction_number[e]:""})}if(t.ref_related_coin_auction=t.ref_related_coin_auction?JSON.parse(t.ref_related_coin_auction):null,t.ref_related_coin_auction_date=t.ref_related_coin_auction_date?JSON.parse(t.ref_related_coin_auction_date):null,t.ref_related_coin_auction_number=t.ref_related_coin_auction_number?JSON.parse(t.ref_related_coin_auction_number):null,t.ref_related_coin_auction_group=null,t.ref_related_coin_auction&&t.ref_related_coin_auction.length>0){t.ref_related_coin_auction_group=[];for(let e=0;e<t.ref_related_coin_auction.length;e++)t.ref_related_coin_auction_group.push({name:t.ref_related_coin_auction[e],date:void 0!==t.ref_related_coin_auction_date[e]?r.parse_date(t.ref_related_coin_auction_date[e]):"",number:void 0!==t.ref_related_coin_auction_number[e]?t.ref_related_coin_auction_number[e]:""})}t.find_date=r.parse_date(t.find_date),t.mib_uri=page_globals.__WEB_BASE_URL__+page_globals.__WEB_ROOT_WEB__+"/coin/"+t.section_id,t.uri=r.parse_iri_data(t.uri),t.bibliography_data&&Array.isArray(t.bibliography_data)&&(t.bibliography=page.parse_publication(t.bibliography_data)),t.parsed=!0}catch(e){console.error("ERROR CATCH ",e),console.warn("row:",t)}return t},page.parse_catalog_data=function(e){const r=this;if(!e)return[];Array.isArray(e)||(e=[e]);const t=[];try{const _=e.length;for(let n=0;n<_;n++){const _=e[n];function o(e){try{JSON.parse(e)}catch(e){return!1}return!0}_.parsed||(_.coins_data_union=_.coins_data_union?JSON.parse(_.coins_data_union):null,_.coin_references=_.coin_references?JSON.parse(_.coin_references):null,_.ref_coins_image_obverse=_.ref_coins_image_obverse?common.local_to_remote_path(_.ref_coins_image_obverse):page.default_image,_.ref_coins_image_reverse=_.ref_coins_image_reverse?common.local_to_remote_path(_.ref_coins_image_reverse):page.default_image,_.ref_coins_image_obverse_thumb=_.ref_coins_image_obverse?_.ref_coins_image_obverse.replace("/1.5MB/","/thumb/"):page.default_image,_.ref_coins_image_reverse_thumb=_.ref_coins_image_reverse?_.ref_coins_image_reverse.replace("/1.5MB/","/thumb/"):page.default_image,_.ref_type_legend_obverse=_.ref_type_legend_obverse?r.parse_legend_svg(_.ref_type_legend_obverse):null,_.ref_type_legend_reverse=_.ref_type_legend_reverse?r.parse_legend_svg(_.ref_type_legend_reverse):null,_.ref_type_symbol_obverse=_.ref_type_symbol_obverse?r.parse_legend_svg(_.ref_type_symbol_obverse):null,_.ref_type_symbol_reverse=_.ref_type_symbol_reverse?r.parse_legend_svg(_.ref_type_symbol_reverse):null,o(_.term_data)&&(_.term_data=JSON.parse(_.term_data)),_.term_section_id=_.term_data?_.term_data[0]:null,_.children=JSON.parse(_.children),_.parent=_.parent&&Array.isArray(_.parent)?(a=_.parent,page.parse_catalog_data(a)):JSON.parse(_.parent),_.ref_type_averages_diameter=_.ref_type_averages_diameter?parseFloat(_.ref_type_averages_diameter.replace(",",".")):null,_.ref_type_total_diameter_items=_.ref_type_total_diameter_items?parseFloat(_.ref_type_total_diameter_items.replace(",",".")):null,_.ref_type_averages_weight=_.ref_type_averages_weight?parseFloat(_.ref_type_averages_weight.replace(",",".")):null,_.ref_type_total_weight_items=_.ref_type_total_weight_items?parseFloat(_.ref_type_total_weight_items.replace(",",".")):null,_.ref_type_material=page.trim_char(_.ref_type_material,"|"),_.term_section_label=_.term_section_label?JSON.parse(_.term_section_label):null,_.term_section_tipo=_.term_section_tipo?JSON.parse(_.term_section_tipo):null,_.p_mint=_.p_mint?JSON.parse(_.p_mint):null,_.p_period=_.p_period?JSON.parse(_.p_period):null,_.p_territory=_.p_territory?JSON.parse(_.p_territory):null,_.parents=_.parents?JSON.parse(_.parents):null,_.parents_text=_.parents_text?JSON.parse(_.parents_text):null,_.p_culture=_.p_culture?JSON.parse(_.p_culture):null,t.push(_))}for(let r=0;r<_;r++){const a=t[r];if(!a.parsed&&"types"===a.term_table&&a.children){const r=[],t=[];for(let _=0;_<a.children.length;_++){const n=a.children[_],o=e.find((e=>e.section_id==n));if(o&&o.ref_type_averages_weight){const e=o.ref_type_total_weight_items,r=new Array(e).fill(o.ref_type_averages_weight);t.push(...r)}if(o&&o.ref_type_averages_diameter){const e=o.ref_type_total_diameter_items,t=new Array(e).fill(o.ref_type_averages_diameter);r.push(...t)}}const _=t.reduce(((e,r)=>e+r),0)/t.length,n=r.reduce(((e,r)=>e+r),0)/r.length;a.ref_type_averages_weight=_,a.ref_type_averages_diameter=n,a.ref_type_total_weight_items=t.length,a.ref_type_total_diameter_items=r.length}a.parsed=!0}}catch(e){console.error("ERROR CATCH ",e),console.warn("new_data:",t)}var a;return t},page.parse_publication=function(e){const r=[];try{if(!e)return e;const t=" # ",a=e.length;for(let _=0;_<a;_++){const a=e[_];if(a.parsed)continue;a._publications=[];const n=a.publications_data?JSON.parse(a.publications_data):[],o=n.length;if(o>0){const e=page.split_data(a.ref_publications_authors,t),_=page.split_data(a.ref_publications_date,t),s=page.split_data(a.ref_publications_editor,t),i=page.split_data(a.ref_publications_magazine,t),l=page.split_data(a.ref_publications_place,t),p=page.split_data(a.ref_publications_title,t),c=page.split_data(a.ref_publications_url,t);for(let t=0;t<o;t++){const o=n[t],d={reference:a.section_id,section_id:o,authors:e[t]||null,date:_[t]||null,editor:s[t]||null,magazine:i[t]||null,place:l[t]||null,title:p[t]||null,url:c[t]||null};a._publications.push(d),r.push(d)}}a.parsed=!0}}catch(r){console.error("ERROR CATCH ",r),console.warn("data:",e)}return r},page.parse_map_global_data=function(e){try{const r=e.length;for(let t=0;t<r;t++){const r=e[t];if(!r.parsed){if(r.georef_geojson=r.georef_geojson?JSON.parse(r.georef_geojson):null,r.coins_list=r.coins_list?JSON.parse(r.coins_list):[],r.types_list=r.types_list?JSON.parse(r.types_list):[],r.georef_geojson&&r.georef_geojson.length>0){const e=function(e){let r;switch(e){case"mints":r="mint";break;case"hoards":r="hoard";break;case"findspots":r="findspot"}return r}(r.table),t=r.coins_list?r.coins_list.length:0,a=r.types_list?r.types_list.length:0,_='<span class="note">'+(tstring[e]||e)+"</span> "+r.name,n=(tstring.coins||"Coins")+": "+t+"<br>"+(tstring.types||"Types")+": "+a,o={section_id:r.section_id,title:_,coins_total:t,types_total:a,description:n,ref_section_id:r.ref_section_id,ref_section_tipo:r.ref_section_tipo,table:r.table,name:r.name,term_id:r.section_id},s=page.maps_config.markers[e],i={lat:null,lon:null,geojson:r.georef_geojson,marker_icon:s,data:o};r.item=i}else r.item=null;r.parsed=!0}}}catch(r){console.error("ERROR CATCH ",r),console.warn("ar_rows:",e)}return e},page.parse_iri_data=function(e){const r=[];if(!e||e.length<1)return r;const t=e.split(" | ");for(let e=0;e<t.length;e++){const a=t[e].split(", ");if(a.length>1&&void 0===a[1])continue;const _=1===a.length?a[0]:a[1];let n=1===a.length?"":a[0];if(n.length<1)try{n=new URL(_).hostname}catch(e){console.warn(e)}r.push({label:n,value:_})}return r},page.parse_ts_web=function(e){Array.isArray(e)||(e=[e]);for(let r=0;r<e.length;r++){const t=e[r];!0!==t.parsed&&(t.cuerpo=t.cuerpo?t.cuerpo.replaceAll("../../../media",page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media"):null,t.entradilla=t.entradilla?t.entradilla.replaceAll("../../../media",page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media"):null,t.parsed=!0)}return e},page.parse_tree_data=function(e,r,t){const a=[],_=["parent","children","space","mib_bibliography","term_data"];function n(e){for(let t=_.length-1;t>=0;t--){const a=_[t];e[a]=(r=e[a])?JSON.parse(r):null}var r;return e}const o=e.length;for(let r=0;r<o;r++){const t=n(e[r]);if(t.children){const r=[],a=t.children.length;for(let _=0;_<a;_++){const a=t.children[_],n="object"==typeof a?a.section_tipo+"_"+a.section_id:a;e.find((e=>e.term_id===n))&&r.push(n)}t.children=r}a.push(t)}const s=[];for(let e=o-1;e>=0;e--){const r=a[e];!(!r.parent||!r.parent[0])&&r.parent[0]||(console.warn("Ignored undefined parent_term_id:",r.term_id,r),s.push(r.term_id))}s.length>0&&console.warn("term_id_to_remove:",s);const i=a.filter((e=>-1===s.indexOf(e.term_id)));for(let e=0;e<i.length;e++){const t=i[e];if(r&&(-1!==r.indexOf(t.term_id)||t.nd_term_id&&-1!==r.indexOf(t.nd_term_id))&&(t.hilite=!0),r)if(-1!==r.indexOf(t.term_id))t.hilite=!0;else if(t.nd_term_id)for(let e=0;e<t.nd_term_id.length;e++)if(-1!==r.indexOf(t.nd_term_id[e])){t.hilite=!0;break}!0===t.hilite&&l(i,t,!1)}function l(e,r,t){const a=r.parent[0],_=e.find((e=>e.term_id==a));_&&(_.status="opened",l(e,_,!0))}return i},page.parse_activity_data=function(e){Array.isArray(e)||(e=[e]);const r=[];try{if(!e)return e;for(let t=0;t<e.length;t++){const a=e[t];!0!==a.parsed?(a.activity=a.activity?JSON.parse(a.activity):null,a.parsed=!0,r.push(a)):r.push(a)}}catch(r){console.error("ERROR CATCH ",r),console.warn("data:",e)}return r};
