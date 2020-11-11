"use strict";var page={trigger_url:page_globals.__WEB_ROOT_WEB__+"/web/trigger.web.php",setup:function(){return this.hilite_lang(page_globals.WEB_CURRENT_LANG_CODE),!0},hilite_lang:function(e){var t=document.getElementById("page_lang_selector");if(t)for(var a=t.querySelectorAll("a"),n=0;n<a.length;n++)-1!==a[n].href.indexOf(e)&&a[n].classList.add("selected");return!0},load_more_items:function(e){var t=JSON.parse(e.dataset.template_map),a=document.getElementById(e.dataset.target),n=document.createElement("div");n.classList.add("spinner_list"),a.appendChild(n);var r={mode:"load_more_items",template_map:t};return common.get_json_data(this.trigger_url,r,!0).then((function(r){if(console.log("[page.load_more_items] response",r),null===r)console.log("[page.load_more_items] Error. Null response");else{var o=document.createElement("div");o.innerHTML=r.html;for(var _=o.children;_.length>0;)a.appendChild(_[0]);t.offset=t.offset+t.max_records,e.dataset.template_map=JSON.stringify(t),t.offset>=t.total_records&&(e.style.display="none")}n.remove()}))},adjust_image_size:function(e){e.style.opacity=0;var t=document.createElement("img");return t.src=e.style.backgroundImage.replace(/"/g,"").replace(/url\(|\)$/gi,""),t.addEventListener("load",(function(t){var a=this.width;this.height>a&&e.classList.add("vertical"),e.style.opacity=1}),!1),!0},adjust_footer_position:function(){let e=!1;const t=document.getElementById("wrapper");if(!t)return console.log("top_container not found !"),!1;t.offsetHeight>window.innerHeight&&(e=!0);!0===SHOW_DEBUG&&console.log("scrollbar:",e);const a=document.getElementById("footer");return!1===e?a.classList.add("fixed"):a.classList.remove("fixed"),e},activate_tooltips:function(e){SHOW_DEBUG,$(e).each((function(){new Tooltip($(this),{placement:"top"})}))},build_paginator_html:function(e,t,a){const n=t;n.dataset.total=e.total;const r=e.ar_nodes,o=r.length;for(let e=0;e<o;e++){const t=r[e];let a=t.label,o="page "+t.type+" "+t.id;if(!1===t.active&&(o+=" unactive"),"previous"!==t.id&&"next"!==t.id&&"last"!==t.id&&"first"!==t.id||(a=""),!0===t.selected&&(o+=" selected"),"extra"===t.type){o=t.type;common.create_dom_element({element_type:"span",class_name:o,text_content:a,parent:n})}else{common.create_dom_element({element_type:"a",class_name:o,text_content:a,dataset:{offset:t.offset_value,active:t.active},parent:n});t.active}}return n.addEventListener("click",this.paginator_click_event),n},paginator_click_event:function(e){const t=this,a=e.target;if("true"!==a.dataset.active)return!1;const n=parseInt(a.parentNode.dataset.total),r=a.dataset.offset,o=document.getElementById("search_form"),_=main_home.search(o,null,r,n);return _.then((function(e){t.result_container})),_},add_spinner:function(e){if(e){const t=common.create_dom_element({element_type:"img",class_name:"spinner_svg",src:page_globals.__WEB_ROOT_WEB__+"/tpl/assets/images/spinner.svg"});e.appendChild(t)}else console.warn("[add_spinner] Error on get target ",e);return!0},remove_spinner:function(e){const t=e.querySelector(".spinner_svg");return!!t&&(t.remove(),!0)},remote_image:function(e){if(e){let t="";return t=-1!==e.indexOf("v5/media_test")?e.replace(/\/v5\/media_test\/media_monedaiberica\//g,page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/"):e.replace(/\/dedalo\/media_test\/media_monedaiberica\//g,page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/"),t}return null},parse_legend_svg:function(e){return e.replace(/\/dedalo\/media\/svg\//g,page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/svg/")},parse_catalog_data:function(e){console.log("------------\x3e parse_catalog_data data:",e);const t=this;if(Array.isArray(e)){const a=[],n=e.length;for(let r=0;r<n;r++)a.push(t.parse_catalog_data(e[r]));return a}const a=e;return a.ref_coins_image_obverse=common.local_to_remote_path(e.ref_coins_image_obverse),a.ref_coins_image_reverse=common.local_to_remote_path(e.ref_coins_image_reverse),a.ref_type_legend_obverse=a.ref_type_legend_obverse?t.parse_legend_svg(a.ref_type_legend_obverse):null,a.ref_type_legend_reverse=a.ref_type_legend_reverse?t.parse_legend_svg(a.ref_type_legend_reverse):null,a},parse_type_data:function(e){const t=this;if(Array.isArray(e)){const a=[];for(let n=0;n<e.length;n++)a.push(t.parse_type_data(e[n]));return a}const a=e;if(a.ref_coins_image_obverse=common.local_to_remote_path(e.ref_coins_image_obverse),a.ref_coins_image_reverse=common.local_to_remote_path(e.ref_coins_image_reverse),a.ref_coins_union)for(let e=0;e<a.ref_coins_union.length;e++)a.ref_coins_union[e].image_obverse&&(a.ref_coins_union[e].image_obverse=common.local_to_remote_path(a.ref_coins_union[e].image_obverse)),a.ref_coins_union[e].image_reverse&&(a.ref_coins_union[e].image_reverse=common.local_to_remote_path(a.ref_coins_union[e].image_reverse));return a.legend_obverse=a.legend_obverse?t.parse_legend_svg(a.legend_obverse):null,a.legend_reverse=a.legend_reverse?t.parse_legend_svg(a.legend_reverse):null,a},parse_coin_data:function(e){const t=this;if(Array.isArray(e)){const a=[];for(let n=0;n<e.length;n++)a.push(t.parse_coin_data(e[n]));return a}const a=e;return a.image_obverse=common.local_to_remote_path(e.image_obverse),a.image_reverse=common.local_to_remote_path(e.image_reverse),a.type_data&&a.type_data.length>0&&(a.type_data=t.parse_type_data(a.type_data)),a.legend_obverse=a.legend_obverse?t.parse_legend_svg(a.legend_obverse):null,a.legend_reverse=a.legend_reverse?t.parse_legend_svg(a.legend_reverse):null,a.countermark_obverse=a.countermark_obverse?t.parse_legend_svg(a.countermark_obverse):null,a.countermark_reverse=a.countermark_reverse?t.parse_legend_svg(a.countermark_reverse):null,a.ref_auction_date=t.parse_date(a.ref_auction_date),a.find_date=t.parse_date(a.find_date),a.uri=page_globals.__WEB_BASE_URL__+page_globals.__WEB_ROOT_WEB__+"/coin/"+a.section_id,a.bibliography=page.parse_publication(a.bibliography_data),a.mint=void 0!==a.type_data[0]?a.type_data[0].mint:null,a.type_number=void 0!==a.type_data[0]?a.type_data[0].number:null,a},remove_gaps:function(e,t){return e.split(t).filter(Boolean).join(t)},split_data:function(e,t){return e?e.split(t):[]},is_empty:function(e){return e&&e.length>0},parse_date:function(e){if(!e||e.length<4)return null;const t=e.substring(0,4),a=e.substring(5,7),n=e.substring(8,10),r=[];n&&"00"!=n&&r.push(n),a&&"00"!=a&&r.push(a),t&&"00"!=t&&r.push(t);return r.join("-")},parse_publication:function(e){const t=[],a=e.length;for(let n=0;n<a;n++){const a=e[n];a._publications=[];const r=JSON.parse(a.publications_data),o=r.length;if(o>0){const e=page.split_data(a.ref_publications_authors," # "),n=page.split_data(a.ref_publications_date," # "),_=page.split_data(a.ref_publications_editor," # "),s=page.split_data(a.ref_publications_magazine," # "),l=page.split_data(a.ref_publications_place," # "),i=page.split_data(a.ref_publications_title," # "),p=page.split_data(a.ref_publications_url," # ");for(let c=0;c<o;c++){const o=r[c],d={reference:a.section_id,section_id:o,authors:e[c]||null,date:n[c]||null,editor:_[c]||null,magazine:s[c]||null,place:l[c]||null,title:i[c]||null,url:p[c]||null};a._publications.push(d),t.push(d)}}}return t},activate_images_gallery:function(e,t){if(!0===t){const e=document.querySelectorAll(".poptrox-overlay");if(e)for(let t=e.length-1;t>=0;t--)e[t].remove()}return $(e).poptrox({baseZIndex:2e4,fadeSpeed:1,overlayOpacity:.5,popupCloserText:"",popupHeight:150,popupLoaderText:"",popupSpeed:1,popupWidth:150,selector:"a.image_link",usePopupCaption:!1,usePopupCloser:!0,usePopupDefaultStyling:!1,usePopupForceClose:!0,usePopupLoader:!0,usePopupNav:!0,windowMargin:50})}};