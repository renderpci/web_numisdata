"use strict";var page={trigger_url:page_globals.__WEB_ROOT_WEB__+"/web/trigger.web.php",default_image:page_globals.__WEB_ROOT_WEB__+"/tpl/assets/images/default.jpg",image_galleries:[],maps_config:{source_maps:[{name:"DARE",url:"//dh.gu.se/tiles/imperium/{z}/{x}/{y}.png",options:{maxZoom:11},default:!0},{name:"OSM",url:"//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",options:{maxZoom:19}},{name:"Map Tiles",url:"https://api.maptiler.com/maps/basic/256/{z}/{x}/{y}@2x.png?key=udlBrEEE2SPm1In5dCNb",options:{maxZoom:20},default:!1},{name:"ARCGIS",url:"//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",options:{}}],popup_options:{maxWidth:420,closeButton:!1,className:"map_popup"},markers:{mint:{iconUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/purple.png?3",shadowUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/marker-shadow.png",iconSize:[30,30],shadowSize:[41,41],iconAnchor:[10,19],shadowAnchor:[0,20],popupAnchor:[12,-20],path:{weight:3,opacity:1,color:"#fe1500",lineJoin:"bevel",fill:!1,fillColor:"#fe1500",fillOpacity:.7,dashArray:"5"}},findspot:{iconUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/orange.png?3",shadowUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/marker-shadow.png",iconSize:[30,30],shadowSize:[41,41],iconAnchor:[10,19],shadowAnchor:[0,20],popupAnchor:[12,-20],path:{weight:3,opacity:1,color:"#fdb314",lineJoin:"bevel",fill:!1,fillColor:"#fdb314",fillOpacity:.7,dashArray:"5"}},hoard:{iconUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/green.png?3",shadowUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/marker-shadow.png",iconSize:[30,30],shadowSize:[41,41],iconAnchor:[10,19],shadowAnchor:[0,20],popupAnchor:[12,-20],path:{weight:3,opacity:1,color:"#fdb314",lineJoin:"bevel",fill:!1,fillColor:"#fdb314",fillOpacity:.7,dashArray:"5"}}}},setup:function(){this.hilite_lang(page_globals.WEB_CURRENT_LANG_CODE);const e=document.getElementById("footer");let t;return e&&setTimeout((function(){e.classList.remove("hidded")}),500),document.addEventListener("keydown",(function(e){if(!0===e.ctrlKey&&"d"===e.key){const e=document.querySelectorAll(".debug_info");if(e)if(!0===t){for(let t=e.length-1;t>=0;t--)e[t].classList.add("hide");t=!1}else{for(let t=e.length-1;t>=0;t--)e[t].classList.remove("hide");t=!0}}})),!0},hilite_lang:function(e){const t=document.getElementById("page_lang_selector");if(t){const n=t.querySelectorAll("a");for(let t=0;t<n.length;t++)-1!==n[t].href.indexOf(e)&&n[t].classList.add("selected");document.getElementById("lang_globe").addEventListener("click",(function(){t.classList.toggle("hide")}))}return!0},load_more_items:function(e){var t=JSON.parse(e.dataset.template_map),n=document.getElementById(e.dataset.target),o=document.createElement("div");o.classList.add("spinner_list"),n.appendChild(o);var a={mode:"load_more_items",template_map:t};return common.get_json_data(this.trigger_url,a,!0).then((function(a){if(null===a)console.warn("[page.load_more_items] Error. Null response");else{var i=document.createElement("div");i.innerHTML=a.html;for(var r=i.children;r.length>0;)n.appendChild(r[0]);t.offset=t.offset+t.max_records,e.dataset.template_map=JSON.stringify(t),t.offset>=t.total_records&&(e.style.display="none")}o.remove()}))},adjust_image_size:function(e){e.style.opacity=0;var t=document.createElement("img");return t.src=e.style.backgroundImage.replace(/"/g,"").replace(/url\(|\)$/gi,""),t.addEventListener("load",(function(){var t=this.width;this.height>t&&e.classList.add("vertical"),e.style.opacity=1}),!1),!0},adjust_footer_position:function(){let e=!1;const t=document.getElementById("wrapper");if(!t)return console.log("top_container not found !"),!1;t.offsetHeight>window.innerHeight&&(e=!0);const n=document.getElementById("footer");return!1===e?n.classList.add("fixed"):n.classList.remove("fixed"),e},activate_tooltips:function(e){SHOW_DEBUG,$(e).each((function(){new Tooltip($(this),{placement:"top"})}))},build_paginator_html:function(e,t){const n=t;n.dataset.total=e.total;const o=e.ar_nodes,a=o.length;for(let e=0;e<a;e++){const t=o[e];let a=t.label,i="page "+t.type+" "+t.id;!1===t.active&&(i+=" unactive"),"previous"!==t.id&&"next"!==t.id&&"last"!==t.id&&"first"!==t.id||(a=""),!0===t.selected&&(i+=" selected"),"extra"===t.type?(i=t.type,common.create_dom_element({element_type:"span",class_name:i,text_content:a,parent:n})):(common.create_dom_element({element_type:"a",class_name:i,text_content:a,dataset:{offset:t.offset_value,active:t.active},parent:n}),t.active)}return n.addEventListener("click",this.paginator_click_event),n},paginator_click_event:function(e){const t=this,n=e.target;if("true"!==n.dataset.active)return!1;const o=parseInt(n.parentNode.dataset.total),a=n.dataset.offset,i=document.getElementById("search_form"),r=main_home.search(i,null,a,o);return r.then((function(e){t.result_container})),r},add_spinner:function(e){if(e){const t=common.create_dom_element({element_type:"img",class_name:"spinner_svg",src:page_globals.__WEB_ROOT_WEB__+"/tpl/assets/images/spinner.svg"});e.appendChild(t)}else console.warn("[add_spinner] Error on get target ",e);return!0},remove_spinner:function(e){const t=e.querySelector(".spinner_svg");return!!t&&(t.remove(),!0)},remote_image:function(e){if(e){let t="";return t=-1!==e.indexOf("v5/media_test")?e.replace(/\/v5\/media_test\/media_monedaiberica\//g,page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/"):e.replace(/\/dedalo\/media_test\/media_monedaiberica\//g,page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/"),t}return null},parse_legend_svg:function(e){return-1!==e.indexOf("http")?e:e.replace(/\/dedalo\/media\/svg\//g,page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/svg/")},remove_gaps:function(e,t){return e.split(t).filter(Boolean).join(t)},split_data:function(e,t){return e?e.split(t):[]},is_empty:function(e){return e&&e.length>0},trim_char:function(e,t){if(!e)return e;for(;e.charAt(0)==t;)e=e.substring(1);for(;e.charAt(e.length-1)==t;)e=e.substring(0,e.length-1);return e},parse_date:function(e){if(!e||e.length<4)return null;const t=e.substring(0,4),n=e.substring(5,7),o=e.substring(8,10),a=[];o&&"00"!=o&&a.push(o),n&&"00"!=n&&a.push(n),t&&"00"!=t&&a.push(t);return a.join("-")},activate_images_gallery:function(e,t){const n=this;if(!0===t&&n.image_galleries.length>0){const e=n.image_galleries.length;for(let t=0;t<e;t++)n.image_galleries[t].removeGallery(),n.image_galleries.splice(t,1)}const o=Object.create(image_gallery);o.set_up({galleryNode:e}),n.image_galleries.push(o)},map_popup_builder:function(e){const t=common.create_dom_element({element_type:"div",class_name:"popup_wrapper"}),n=e.group,o=new Intl.Collator("es",{sensitivity:"base",ignorePunctuation:!0});n.sort(((e,t)=>o.compare(e.title,t.title)));const a=function(e){const n=e.section_id,o=e.title||"Undefined title "+n,a=e.description,i=common.create_dom_element({element_type:"div",class_name:"popup_item",parent:t});common.create_dom_element({element_type:"div",class_name:"text_title",inner_html:o,parent:i}),a&&a.length>0&&common.create_dom_element({element_type:"div",class_name:"text_description",inner_html:a,parent:i})},i=n.length;let r=100;return function e(o,s){for(let e=o;e<s;e++)a(n[e]);if(s<i-1){const n=common.create_dom_element({element_type:"input",type:"button",value:tstring.load_more||"Load more..",class_name:"more_node btn btn-light btn-block primary",parent:t});n.addEventListener("click",(function(){const t=this.offset+1;e(t,t+r<i?t+r:i),this.remove()})),n.offset=s}}(0,r<i?r:i),t},load_hires:function e(){this.removeEventListener("load",e,!1);const t=this,n=this.hires;setTimeout((function(){t.src=n}),100)},sort_array_by_property:function(e,t){return e.sort((function(e,n){return e[t].localeCompare(n[t])}))},filter_drop_down_list:function(e,t){return e.filter((function(e){const n=e.value.normalize("NFD").replace(/[\u0300-\u036f]/g,"");return e.value.toLowerCase().indexOf(t.toLowerCase())>-1||n.toLowerCase().indexOf(t.toLowerCase())>-1}))}};
//# sourceMappingURL=page-min.js.map