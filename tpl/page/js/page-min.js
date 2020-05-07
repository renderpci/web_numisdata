"use strict";var page={trigger_url:page_globals.__WEB_ROOT_WEB__+"/web/trigger.web.php",setup:function(){var e=this;return window.ready((function(){e.hilite_lang(page_globals.WEB_CURRENT_LANG_CODE)})),!0},hilite_lang:function(e){var t=document.getElementById("page_lang_selector");if(t)for(var n=t.querySelectorAll("a"),o=0;o<n.length;o++)-1!==n[o].href.indexOf(e)&&n[o].classList.add("selected");return!0},load_more_items:function(e){var t=JSON.parse(e.dataset.template_map),n=document.getElementById(e.dataset.target),o=document.createElement("div");o.classList.add("spinner_list"),n.appendChild(o);var a={mode:"load_more_items",template_map:t};return common.get_json_data(this.trigger_url,a,!0).then((function(a){if(console.log("[page.load_more_items] response",a),null===a)console.log("[page.load_more_items] Error. Null response");else{var i=document.createElement("div");i.innerHTML=a.html;for(var s=i.children;s.length>0;)n.appendChild(s[0]);t.offset=t.offset+t.max_records,e.dataset.template_map=JSON.stringify(t),t.offset>=t.total_records&&(e.style.display="none")}o.remove()}))},adjust_image_size:function(e){e.style.opacity=0;var t=document.createElement("img");return t.src=e.style.backgroundImage.replace(/"/g,"").replace(/url\(|\)$/gi,""),t.addEventListener("load",(function(t){var n=this.width;this.height>n&&e.classList.add("vertical"),e.style.opacity=1}),!1),!0},adjust_footer_position:function(){let e=!1;const t=document.getElementById("wrapper");if(!t)return console.log("top_container not found !"),!1;t.offsetHeight>window.innerHeight&&(e=!0);!0===SHOW_DEBUG&&console.log("scrollbar:",e);const n=document.getElementById("footer");return!1===e?n.classList.add("fixed"):n.classList.remove("fixed"),e},activate_tooltips:function(e){SHOW_DEBUG,$(e).each((function(){new Tooltip($(this),{placement:"top"})}))},build_paginator_html:function(e,t,n){const o=t;o.dataset.total=e.total;const a=e.ar_nodes,i=a.length;for(let e=0;e<i;e++){const t=a[e];let n=t.label,i="page "+t.type+" "+t.id;if(!1===t.active&&(i+=" unactive"),"previous"!==t.id&&"next"!==t.id&&"last"!==t.id&&"first"!==t.id||(n=""),!0===t.selected&&(i+=" selected"),"extra"===t.type){i=t.type;common.create_dom_element({element_type:"span",class_name:i,text_content:n,parent:o})}else{common.create_dom_element({element_type:"a",class_name:i,text_content:n,dataset:{offset:t.offset_value,active:t.active},parent:o});t.active}}return o.addEventListener("click",this.paginator_click_event),o},paginator_click_event:function(e){const t=this,n=e.target;if("true"!==n.dataset.active)return!1;const o=parseInt(n.parentNode.dataset.total),a=n.dataset.offset,i=document.getElementById("search_form"),s=main_home.search(i,null,a,o);return s.then((function(e){t.result_container})),s},init_map:function(e){const t=e.map_data,n=e.div_container_id;console.log("div_container_id:",n),this.map=null,this.layer_control=!1,this.loaded_document=!1,this.icon_main=null,this.icon_finds=null,this.icon_uncertain=null,this.popupOptions=null,this.current_layer=null,this.current_group=null,this.initial_map_data={x:40.1,y:9,zoom:8,alt:16},this.option_selected=null;const o=t.lat,a=t.lon,i=t.zoom,s=new L.TileLayer("http://pelagios.org/tilesets/imperium/{z}/{x}/{y}.png",{maxZoom:11}),r=new L.tileLayer("//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"),l=new L.TileLayer("//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");this.map=new L.map(n,{layers:[l],center:new L.LatLng(o,a),zoom:i});const c={dare:s,arcgis:r,osm:l};return this.layer_control=L.control.layers(c).addTo(this.map),this.map.scrollWheelZoom.disable(),this.icon_main=L.icon({iconUrl:__WEB_TEMPLATE_WEB__+"/assets/lib/leaflet/images/naranja.png",shadowUrl:__WEB_TEMPLATE_WEB__+"/assets/lib/leaflet/images/marker-shadow.png",iconSize:[47,43],shadowSize:[41,41],iconAnchor:[10,19],shadowAnchor:[0,20],popupAnchor:[12,-20]}),this.icon_finds=L.icon({iconUrl:__WEB_TEMPLATE_WEB__+"/assets/lib/leaflet/images/verde.png",shadowUrl:__WEB_TEMPLATE_WEB__+"/assets/lib/leaflet/images/marker-shadow.png",iconSize:[47,43],shadowSize:[41,41],iconAnchor:[10,19],shadowAnchor:[0,20],popupAnchor:[12,-20]}),this.icon_uncertain=L.icon({iconUrl:__WEB_TEMPLATE_WEB__+"/assets/lib/leaflet/images/marker-uncertainty.png",iconSize:[50,50],iconAnchor:[25,25],popupAnchor:[12,-20]}),this.popupOptions={maxWidth:"758",closeButton:!0},!0}};