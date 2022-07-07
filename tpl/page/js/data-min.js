"use strict";page.parse_type_data=function(e){const r=this;if(Array.isArray(e)){const t=[];for(let a=0;a<e.length;a++)t.push(r.parse_type_data(e[a]));return t}const t=e;if("object"!=typeof t&&(console.log("parse_type_data row:",t),console.trace()),t.parsed)return t;try{t.ref_coins_image_obverse=void 0!==e.ref_coins_image_obverse?common.local_to_remote_path(e.ref_coins_image_obverse):page.default_image,t.ref_coins_image_reverse=void 0!==e.ref_coins_image_reverse?common.local_to_remote_path(e.ref_coins_image_reverse):page.default_image,t.ref_coins_union&&Array.isArray(t.ref_coins_union)?t.ref_coins_union=page.parse_coin_data(t.ref_coins_union):t.ref_coins_union=t.ref_coins_union?JSON.parse(t.ref_coins_union):null,t.coin_references&&Array.isArray(t.coin_references)?t.coin_references=page.parse_coin_data(t.coin_references):t.coin_references=t.coin_references?JSON.parse(t.coin_references):null,t.uri=r.parse_iri_data(t.uri),t.legend_obverse=t.legend_obverse?r.parse_legend_svg(t.legend_obverse):null,t.legend_reverse=t.legend_reverse?r.parse_legend_svg(t.legend_reverse):null,t.material=t.material?page.trim_char(page.remove_gaps(t.material," | "),"|"):null,t.symbol_obverse=t.symbol_obverse?r.parse_legend_svg(t.symbol_obverse):null,t.symbol_reverse=t.symbol_reverse?r.parse_legend_svg(t.symbol_reverse):null,t.symbol_obverse_data=JSON.parse(t.symbol_obverse_data),t.symbol_reverse_data=JSON.parse(t.symbol_reverse_data),t.term_data=t.term_data?JSON.parse(t.term_data):null,t.term_section_tipo=t.term_section_tipo?JSON.parse(t.term_section_tipo):null,t.term_section_label=t.term_section_label?JSON.parse(t.term_section_label):null,t.parsed=!0}catch(e){console.error("ERROR CATCH ",e),console.warn("row:",t)}return t},page.parse_mint_data=function(e){if(Array.isArray(e)){const r=[];for(let t=0;t<e.length;t++)r.push(page.parse_mint_data(e[t]));return r}const r=e;return"object"!=typeof r&&(console.log("parse_mint_data row:",r),console.trace()),!r||r.parsed||(r.georef_geojson=r.georef_geojson?JSON.parse(r.georef_geojson):null,r.map=r.map?JSON.parse(r.map):null,r.place_data=r.place_data?JSON.parse(r.place_data):null,r.uri=this.parse_iri_data(r.uri),r.relations_coins=r.relations_coins?JSON.parse(r.relations_coins):null,r.relations_types=r.relations_types?JSON.parse(r.relations_types):null),r},page.parse_hoard_data=function(e){Array.isArray(e)||(e=[e]);const r=[];try{if(!e)return e;for(let t=0;t<e.length;t++){const a=e[t];!0!==a.parsed?(a.map=a.map?JSON.parse(a.map):null,a.coins=a.coins?JSON.parse(a.coins):null,a.types=a.types?JSON.parse(a.types):null,a.georef_geojson=a.georef_geojson?JSON.parse(a.georef_geojson):null,a.parsed=!0,r.push(a)):r.push(a)}}catch(r){console.error("ERROR CATCH ",r),console.warn("data:",e)}return r},page.parse_coin_data=function(e){const r=this;if(Array.isArray(e)){const r=[];for(let t=0;t<e.length;t++)r.push(page.parse_coin_data(e[t]));return r}const t=e;if("object"!=typeof t&&(console.log("parse_coin_data row:",t),console.trace()),!t||t.parsed)return t;try{t.image_obverse=t.image_obverse?common.local_to_remote_path(e.image_obverse):page.default_image,t.image_obverse_thumb=t.image_obverse?t.image_obverse.replace("/1.5MB/","/thumb/"):page.default_image,t.image_reverse=t.image_reverse?common.local_to_remote_path(e.image_reverse):page.default_image,t.image_reverse_thumb=t.image_reverse?t.image_reverse.replace("/1.5MB/","/thumb/"):page.default_image,t.type_data&&Array.isArray(t.type_data)?t.type_data=r.parse_type_data(t.type_data):(t.type_data=t.type_data?JSON.parse(t.type_data):null,t.type_section_id=t.type_data&&void 0!==t.type_data[0]?t.type_data[0]:null);const a=" | ";t.type=t.type?page.split_data(t.type,a):null;const _=t.mint_data?page.split_data(t.mint_data,a):[],n=[];for(let e=0;e<_.length;e++)n.push(JSON.parse(_[e]));t.mint_data=n||null;const o=t.mint_number?page.split_data(t.mint_number,a):[],i=[];for(let e=0;e<o.length;e++)i.push(JSON.parse(o[e]));t.mint_number=i||null;const s=t.mint?page.split_data(t.mint,a):[],l=[];for(let e=0;e<s.length;e++)if(s[e]){const r=0===s[e].indexOf('["')?JSON.parse(s[e]):s[e];r&&l.push(r)}if(t.mint=l||null,t.catalogue_type_mint=t.catalogue_type_mint?0===t.catalogue_type_mint.indexOf('["')?JSON.parse(t.catalogue_type_mint):t.catalogue_type_mint:null,t.legend_obverse=t.legend_obverse?r.parse_legend_svg(t.legend_obverse):null,t.legend_reverse=t.legend_reverse?r.parse_legend_svg(t.legend_reverse):null,t.countermark_obverse=t.countermark_obverse?r.parse_legend_svg(t.countermark_obverse):null,t.countermark_reverse=t.countermark_reverse?r.parse_legend_svg(t.countermark_reverse):null,t.ref_auction=t.ref_auction?JSON.parse(t.ref_auction):null,t.ref_auction_date=t.ref_auction_date?JSON.parse(t.ref_auction_date):null,t.ref_auction_number=t.ref_auction_number?JSON.parse(t.ref_auction_number):null,t.ref_auction_group=null,t.ref_auction&&t.ref_auction.length>0){t.ref_auction_group=[];for(let e=0;e<t.ref_auction.length;e++)t.ref_auction_group.push({name:t.ref_auction&&void 0!==t.ref_auction[e]?t.ref_auction[e]:"",date:t.ref_auction_date&&void 0!==t.ref_auction_date[e]?r.parse_date(t.ref_auction_date[e]):"",number:t.ref_auction_number&&void 0!==t.ref_auction_number[e]?t.ref_auction_number[e]:""})}if(t.ref_related_coin_auction=t.ref_related_coin_auction?JSON.parse(t.ref_related_coin_auction):null,t.ref_related_coin_auction_date=t.ref_related_coin_auction_date?JSON.parse(t.ref_related_coin_auction_date):null,t.ref_related_coin_auction_number=t.ref_related_coin_auction_number?JSON.parse(t.ref_related_coin_auction_number):null,t.ref_related_coin_auction_group=null,t.ref_related_coin_auction&&t.ref_related_coin_auction.length>0){t.ref_related_coin_auction_group=[];for(let e=0;e<t.ref_related_coin_auction.length;e++)t.ref_related_coin_auction_group.push({name:t.ref_related_coin_auction&&void 0!==t.ref_related_coin_auction[e]?t.ref_related_coin_auction[e]:"",date:t.ref_related_coin_auction_date&&void 0!==t.ref_related_coin_auction_date[e]?r.parse_date(t.ref_related_coin_auction_date[e]):"",number:t.ref_related_coin_auction_number&&void 0!==t.ref_related_coin_auction_number[e]?t.ref_related_coin_auction_number[e]:""})}t.find_date=r.parse_date(t.find_date),t.coin_uri=page_globals.__WEB_ROOT_WEB__+"/coin/"+t.section_id,t.uri=r.parse_iri_data(t.uri),t.bibliography_data&&Array.isArray(t.bibliography_data)&&(t.bibliography=page.parse_publication(t.bibliography_data)),t.parsed=!0}catch(e){console.error("ERROR CATCH ",e),console.warn("row:",t)}return t},page.parse_catalog_data=function(e){const r=this;if(!e)return[];Array.isArray(e)||(e=[e]);const t=[];try{const _=e.length;for(let n=0;n<_;n++){const o=e[n];function i(e){try{JSON.parse(e)}catch(e){return!1}return!0}o.parsed||(o.coins_data_union=o.coins_data_union?JSON.parse(o.coins_data_union):null,o.coin_references=o.coin_references?JSON.parse(o.coin_references):null,o.ref_coins_image_obverse=o.ref_coins_image_obverse?common.local_to_remote_path(o.ref_coins_image_obverse):page.default_image,o.ref_coins_image_reverse=o.ref_coins_image_reverse?common.local_to_remote_path(o.ref_coins_image_reverse):page.default_image,o.ref_coins_image_obverse_thumb=o.ref_coins_image_obverse?o.ref_coins_image_obverse.replace("/1.5MB/","/thumb/"):page.default_image,o.ref_coins_image_reverse_thumb=o.ref_coins_image_reverse?o.ref_coins_image_reverse.replace("/1.5MB/","/thumb/"):page.default_image,o.ref_type_legend_obverse=o.ref_type_legend_obverse?r.parse_legend_svg(o.ref_type_legend_obverse):null,o.ref_type_legend_reverse=o.ref_type_legend_reverse?r.parse_legend_svg(o.ref_type_legend_reverse):null,o.ref_type_symbol_obverse=o.ref_type_symbol_obverse?r.parse_legend_svg(o.ref_type_symbol_obverse):null,o.ref_type_symbol_reverse=o.ref_type_symbol_reverse?r.parse_legend_svg(o.ref_type_symbol_reverse):null,i(o.term_data)&&(o.term_data=JSON.parse(o.term_data)),o.term_section_id=o.term_data?o.term_data[0]:null,o.children=JSON.parse(o.children),o.parent=o.parent&&Array.isArray(o.parent)?(a=o.parent,page.parse_catalog_data(a)):JSON.parse(o.parent),o.ref_type_averages_diameter=o.ref_type_averages_diameter?parseFloat(o.ref_type_averages_diameter.replace(",",".")):null,o.ref_type_total_diameter_items=o.ref_type_total_diameter_items?parseFloat(o.ref_type_total_diameter_items.replace(",",".")):null,o.ref_type_averages_weight=o.ref_type_averages_weight?parseFloat(o.ref_type_averages_weight.replace(",",".")):null,o.ref_type_total_weight_items=o.ref_type_total_weight_items?parseFloat(o.ref_type_total_weight_items.replace(",",".")):null,o.ref_type_material=page.trim_char(o.ref_type_material,"|"),o.ref_type_design_obverse_iconography=o.ref_type_design_obverse_iconography?o.ref_type_design_obverse_iconography.replace(" - "," | "):null,o.ref_type_design_reverse_iconography=o.ref_type_design_reverse_iconography?o.ref_type_design_reverse_iconography.replace(" - "," | "):null,o.term_section_label=o.term_section_label?JSON.parse(o.term_section_label):null,o.term_section_tipo=o.term_section_tipo?JSON.parse(o.term_section_tipo):null,o.p_mint=o.p_mint?JSON.parse(o.p_mint):null,o.p_period=o.p_period?JSON.parse(o.p_period):null,o.p_territory=o.p_territory?JSON.parse(o.p_territory):null,o.parents=o.parents?JSON.parse(o.parents):null,o.parents_text=o.parents_text?JSON.parse(o.parents_text):null,o.p_culture=o.p_culture?JSON.parse(o.p_culture):null,t.push(o))}for(let s=0;s<_;s++){const l=t[s];if(!l.parsed&&"types"===l.term_table&&l.children){const p=[],c=[];for(let g=0;g<l.children.length;g++){const f=l.children[g],m=e.find((e=>e.section_id==f));if(m&&m.ref_type_averages_weight){const y=m.ref_type_total_weight_items,h=new Array(y).fill(m.ref_type_averages_weight);c.push(...h)}if(m&&m.ref_type_averages_diameter){const b=m.ref_type_total_diameter_items,v=new Array(b).fill(m.ref_type_averages_diameter);p.push(...v)}}const d=c.reduce(((e,r)=>e+r),0)/c.length,u=p.reduce(((e,r)=>e+r),0)/p.length;l.ref_type_averages_weight=d,l.ref_type_averages_diameter=u,l.ref_type_total_weight_items=c.length,l.ref_type_total_diameter_items=p.length}l.parsed=!0}}catch(O){console.error("ERROR CATCH ",O),console.warn("new_data:",t)}var a;return t},page.parse_publication=function(e){const r=[];try{if(!e)return e;const t=" # ",a=e.length;for(let _=0;_<a;_++){const a=e[_];if(a.parsed)continue;a._publications=[];const n=a.publications_data?JSON.parse(a.publications_data):[],o=n.length;if(o>0){const e=page.split_data(a.ref_publications_authors,t),_=page.split_data(a.ref_publications_date,t),i=page.split_data(a.ref_publications_editor,t),s=page.split_data(a.ref_publications_magazine,t),l=page.split_data(a.ref_publications_place,t),p=page.split_data(a.ref_publications_title,t),c=page.split_data(a.ref_publications_url,t);for(let t=0;t<o;t++){const o=n[t],d={reference:a.section_id,section_id:o,authors:e[t]||null,date:_[t]||null,editor:i[t]||null,magazine:s[t]||null,place:l[t]||null,title:p[t]||null,url:c[t]||null};a._publications.push(d),r.push(d)}}a.parsed=!0}}catch(r){console.error("ERROR CATCH ",r),console.warn("data:",e)}return r},page.parse_map_global_data=function(e){try{const r=e.length;for(let t=0;t<r;t++){const r=e[t];if(!r.parsed){if(r.georef_geojson=r.georef_geojson?JSON.parse(r.georef_geojson):null,r.coins_list=r.coins_list?JSON.parse(r.coins_list):[],r.types_list=r.types_list?JSON.parse(r.types_list):[],r.georef_geojson&&r.georef_geojson.length>0){const e=function(e){let r;switch(e){case"mints":r="mint";break;case"hoards":r="hoard";break;case"findspots":r="findspot"}return r}(r.table),t=r.coins_list?r.coins_list.length:0,a=r.types_list?r.types_list.length:0,_='<span class="note">'+(tstring[e]||e)+"</span> "+r.name,n=(tstring.coins||"Coins")+": "+t,o={section_id:r.section_id,title:_,coins_total:t,types_total:a,description:n,ref_section_id:r.ref_section_id,ref_section_tipo:r.ref_section_tipo,table:r.table,name:r.name,term_id:r.section_id},i=page.maps_config.markers[e],s={lat:null,lon:null,geojson:r.georef_geojson,marker_icon:i,data:o};r.item=s}else r.item=null;r.parsed=!0}}}catch(r){console.error("ERROR CATCH ",r),console.warn("ar_rows:",e)}return e},page.parse_iri_data=function(e){const r=[];if(!e||e.length<1)return r;const t=e.split(" | ");for(let e=0;e<t.length;e++){const a=t[e].split(", ");if(a.length>1&&void 0===a[1])continue;const _=1===a.length?a[0]:a[1];let n=1===a.length?"":a[0];if(n.length<1)try{n=new URL(_).hostname}catch(e){console.log("url:",_),console.warn(e)}r.push({label:n,value:_})}return r},page.parse_ts_web=function(e){Array.isArray(e)||(e=[e]);for(let r=0;r<e.length;r++){const t=e[r];!0!==t.parsed&&(t.cuerpo=t.cuerpo?t.cuerpo.replaceAll("../../../media",page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media"):null,t.entradilla=t.entradilla?t.entradilla.replaceAll("../../../media",page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media"):null,t.parsed=!0)}return e},page.parse_tree_data=function(e,r){const t=[],a=["parent","children","space","mib_bibliography","term_data"];function _(e){for(let t=a.length-1;t>=0;t--){const _=a[t];e[_]=(r=e[_])?JSON.parse(r):null}var r;return e}const n=e.length;for(let r=0;r<n;r++){const a=_(e[r]);if(a.children){const r=[],t=a.children.length;for(let _=0;_<t;_++){const t=a.children[_],n="object"==typeof t?t.section_tipo+"_"+t.section_id:t;e.find((e=>e.term_id===n))&&r.push(n)}a.children=r}t.push(a)}const o=[];for(let e=n-1;e>=0;e--){const r=t[e];!(!r.parent||!r.parent[0])&&r.parent[0]||(console.warn("Ignored undefined parent_term_id:",r.term_id,r),o.push(r.term_id))}o.length>0&&console.warn("term_id_to_remove:",o);const i=t.filter((e=>-1===o.indexOf(e.term_id)));for(let e=0;e<i.length;e++){const t=i[e];if(r&&(-1!==r.indexOf(t.term_id)||t.nd_term_id&&-1!==r.indexOf(t.nd_term_id))&&(t.hilite=!0),r)if(-1!==r.indexOf(t.term_id))t.hilite=!0;else if(t.nd_term_id)for(let e=0;e<t.nd_term_id.length;e++)if(-1!==r.indexOf(t.nd_term_id[e])){t.hilite=!0;break}!0===t.hilite&&s(i,t)}function s(e,r){const t=r.parent[0],a=e.find((e=>e.term_id==t));a&&(a.status="opened",s(e,a))}return i},page.parse_activity_data=function(e){Array.isArray(e)||(e=[e]);const r=[];try{if(!e)return e;for(let t=0;t<e.length;t++){const a=e[t];!0!==a.parsed?(a.activity=a.activity?JSON.parse(a.activity):null,a.parsed=!0,r.push(a)):r.push(a)}}catch(r){console.error("ERROR CATCH ",r),console.warn("data:",e)}return r};
//# sourceMappingURL=data-min.js.map