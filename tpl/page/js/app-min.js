"use strict";var common={get_json_data:function(e,t,n){const o=e+"?d="+Date.now(),r=JSON.stringify(t);var a=-1!=navigator.userAgent.indexOf("MSIE"),s=/rv:11.0/i.test(navigator.userAgent);if(a||s){var i=tstring.incompatible_browser||"Warning: Internet explorer is not supported. Please use a modern browser like Chrome, Firefox, Safari, Opera, Edje..";return alert(i),!1}return void 0===n&&(n=!0),new Promise((function(e,t){var a=new XMLHttpRequest;a.open("POST",o,n),a.setRequestHeader("Content-type","application/json"),a.responseType="json",a.onload=function(n){200===a.status?e(a.response):t(Error("Reject error. Data don't load. error code: "+a.statusText+" - url: "+o))},a.onerror=function(e){t(Error("There was a network error. data_send: "+o+"?"+r+"statusText: "+a.statusText))},a.send(r)}))},create_dom_element:function(e){const t=e.element_type,n=e.parent,o=e.class_name,r=e.style,a=e.data_set||e.dataset,s=e.custom_function_events,i=e.title_label||e.title,l=e.text_node,_=e.text_content,c=e.inner_html,m=e.href,p=e.id,d=e.draggable,u=e.value,g=e.download,f=e.src,h=e.placeholder,v=e.type,y=e.target,b=document.createElement(t);if(p&&(b.id=p),"a"===t&&(b.href=m||"javascript:;",y&&(b.target=y)),o&&(b.className=o),r)for(w in r)b.style[w]=r[w];if(i&&(b.title=i),a)for(var w in a)b.dataset[w]=a[w];if(u&&(b.value=u),v&&b.setAttribute("type",v),s){const e=s.length;for(let t=0;t<e;t++){const e=s[t].name,n=s[t].type,o=s[t].function_arguments;this.create_custom_events(b,n,e,o)}}if(l)if("span"===t)b.textContent=l;else{const e=document.createElement("span");e.insertAdjacentHTML("afterbegin"," "+l),b.appendChild(e)}else _?b.textContent=_:c&&b.insertAdjacentHTML("afterbegin",c);return n&&n.appendChild(b),d&&(b.draggable=d),g&&b.setAttribute("download",g),f&&(b.src=f),h&&(b.placeholder=h),b},build_player:function(e){!0===SHOW_DEBUG&&console.log("[common.build_player] options",e);const t=this;var n=e.type||["video/mp4"],o=e.src||[""];Array.isArray(o)||(o=[o]);const r=document.createElement("video");r.id=e.id||"video_player",r.controls=e.controls||!0,r.poster=e.poster||common.get_posterframe_from_video(o),r.className=e.class||"video-js video_hidden hide",r.preload=e.preload||"auto",r.dataset.setup="{}",e.height&&(r.height=e.height),e.width&&(r.width=e.width);for(let e=0;e<o.length;e++){const t=document.createElement("source");t.src=o[e],t.type=n[e],r.appendChild(t)}const a=e.ar_subtitles||null;if(a)for(let t=0;t<a.length;t++){const n=a[t],o=document.createElement("track");o.kind="subtitles",o.src=n.src,o.srclang=n.srclang,o.label=n.label,n.srclang===e.default&&(o.default=!0),r.appendChild(o)}const s=document.createElement("p");s.className="vjs-no-js";const i=document.createTextNode("To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video");return s.appendChild(i),r.appendChild(s),setTimeout((function(){window.ready((function(n){const a=videojs(r);a.ready((function(){if(this.addClass("video_show"),this.removeClass("hide"),void 0!==e.ar_restricted_fragments&&e.ar_restricted_fragments.length>0){const n=o[0],r=parseInt(t.get_query_variable(n,"vbegin"));this.on("timeupdate",(function(n){t.skip_restricted(this,e.ar_restricted_fragments,r)}))}})),!0===e.play&&a.play()}))}),1),r},skip_restricted:function(e,t,n){const o=parseInt(e.currentTime()),r=o+parseInt(n);SHOW_DEBUG;const a=t.length;for(let s=0;s<a;s++){const a=t[s],i=a.tcin_secs,l=a.tcout_secs;if(r>i&&r<l){const t=l-n;e.currentTime(t),!0===SHOW_DEBUG&&(console.log("+++ Jumped to end time :",r,l),console.log("item:",a,"tcin_secs",n,"player_current_time",o,"time_to_jump_secs",t))}}return!0},timestamp_to_fecha:function(e){if(!e||e.length<4)return null;if(10===e.length){var t=e.substring(0,4),n=e.substring(5,7);const a=[];(r=e.substring(8,10))&&"00"!=r&&a.push(r),n&&"00"!=n&&a.push(n),t&&"00"!=t&&a.push(t);var o=a.join("-")}else{var r,a=new Date(e);t=a.getFullYear(),n=a.getMonth();function s(e){return e<10?"0"+e:e}o=s(r=a.getDate())+"-"+s(n+1)+"-"+t}return o},local_to_remote_path:function(e){if(!e)return null;if(-1===e.indexOf("http://")&&-1===e.indexOf("https://")){const t=page_globals.WEB_ENTITY;"/"!==(e=(e=e.replace("/dedalo4/","/dedalo/")).replace("/media_test/media_"+t,"/media")).charAt(0)&&(e="/"+e),e=page_globals.__WEB_MEDIA_BASE_URL__+e}return e},get_posterframe_from_video:function(e){let t=e;t=t.replace(/\/404\//g,"/posterframe/"),t=t.replace(/\.mp4/g,".jpg");const n=t.split("?");return void 0!==n[0]&&(t=n[0]),t},get_media_engine_url:function(e,t,n,o){if(!e)return console.warn("Error on get_media_engine_url. Invalid file_name :",e),null;const r=o?e:/^.{3,}_.{3,}_(\d{1,})\.[\S]{3,4}$/.exec(e)[1];return __WEB_MEDIA_ENGINE_URL__+"/"+t+"/"+r+(n?"/"+n:"")},open_note:function(e,t){for(var n=t.length-1;n>=0;n--){var o=t[n];if(e.dataset.tag_id===o.id)return $.colorbox({html:o.label,transition:"none"}),!0}return!1},set_background_color:function(e,t){e.setAttribute("crossOrigin","");const n=(new BackgroundColorTheif).getBackGroundColor(e);return t.style.backgroundColor="rgb("+n[0]+","+n[1]+","+n[2]+")",n},build_slider:function(e){const t=e.container;return new Promise((function(n){var o=common.create_dom_element({element_type:"ul",class_name:"slides",parent:t});const r=e.ar_elements.length;for(let t=0;t<r;t++){const r=e.ar_elements[t],_=r.image,c=r.title||null,m=r.text||null;if(!(_.length<4)){var a=common.create_dom_element({element_type:"li",class_name:"row_image",parent:o});common.create_dom_element({element_type:"div",class_name:"image_bg",parent:a}).style.backgroundImage="url("+_+")";var s=common.create_dom_element({element_type:"div",class_name:"image_text",parent:a}),i=common.create_dom_element({element_type:"h1",text_content:c,parent:s});common.create_dom_element({element_type:"a",parent:i}),common.create_dom_element({element_type:"span",text_content:m,parent:s});if(0===t){var l=new Image;l.addEventListener("load",(function(){n(o)}),!1),l.src=_}}}}))},get_scrollbar_width:function(){var e=document.createElement("div");e.style.visibility="hidden",e.style.width="100px",e.style.msOverflowStyle="scrollbar",document.body.appendChild(e);var t=e.offsetWidth;e.style.overflow="scroll";var n=document.createElement("div");n.style.width="100%",e.appendChild(n);var o=n.offsetWidth;return e.parentNode.removeChild(e),t-o},has_scrollbar:function(){if("number"==typeof window.innerWidth){return window.innerWidth>=document.documentElement.clientWidth}const e=document.documentElement||document.body;var t,n;void 0!==e.currentStyle&&(t=e.currentStyle.overflow),t=t||window.getComputedStyle(e,"").overflow,void 0!==e.currentStyle&&(n=e.currentStyle.overflowY),n=n||window.getComputedStyle(e,"").overflowY;var o=e.scrollHeight>e.clientHeight,r=/^(visible|auto)$/.test(t)||/^(visible|auto)$/.test(n);return o&&r||("scroll"===t||"scroll"===n)},clone_deep:function(e){const t=this;let n,o;if("object"!=typeof e)return e;if(!e)return e;if("[object Array]"===Object.prototype.toString.apply(e)){for(n=[],o=0;o<e.length;o+=1)n[o]=t.clone_deep(e[o]);return n}for(o in n={},e)e.hasOwnProperty(o)&&(n[o]=t.clone_deep(e[o]));return n},get_query_variable:function(e,t){const n=e.split("?")[1].split("&");for(var o=0;o<n.length;o++){const e=n[o].split("=");if(e[0]==t)return e[1]}return!1},register_events:function(e,t){for(let n in t){const o=t[n];e.addEventListener(n,(function(e){for(let t in o)o[t](e)}))}return!0},clean_gaps:function(e,t=" | ",n=", "){if(!e)return"";return(e=(e=(e=e.trim()).replace(/^\| |\| {1,2}\|| \|+$/g,"")).trim()).split(t).filter(e=>e.length>0).join(n)},when_in_dom:function(e,t){if(document.contains(e))return t();const n=new MutationObserver((function(o){document.contains(e)&&(n.disconnect(),t())}));return n.observe(document,{attributes:!1,childList:!0,characterData:!1,subtree:!0}),n},remove_gaps:function(e,t){if(!e)return null;return e.split(t).filter(Boolean).join(t)},split_data:function(e,t){return e&&("string"==typeof e||e instanceof String)?e.split(t):Array.isArray(e)?e:[]},clean_date:function(e,t){const n=e?e.split(t):[],o=[];for(let e=0;e<n.length;e++){const t=n[e].split("-"),r=[];if(t[2]&&"00 00:00:00"!==t[2]){const e=t[2].split(" ")[0];r.push(e)}t[1]&&"00"!==t[1]&&r.push(t[1]),t[0]&&"0000"!==t[0]&&r.push(t[0]);const a=r.join("-");o.push(a)}return o},download_item:function(e,t){return fetch(e).then((function(e){return e.blob()})).then((function(e){const n=URL.createObjectURL(e),o=common.create_dom_element({element_type:"a",href:n,download:t||"image.jpg"});o.click(),o.remove()})),!0},is_node:function(e){return!(void 0===e||!(e instanceof HTMLElement||e.nodeType))},is_element_in_viewport:function(e){const t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&t.right<=(window.innerWidth||document.documentElement.clientWidth)},is_element_top_in_viewport:function(e){return e.getBoundingClientRect().top<=(window.innerHeight||document.documentElement.clientHeight)},lang_code_to_tld2:function(e){let t;switch(e){case"lg-spa":t="es";break;case"lg-eng":t="en";break;case"lg-cat":t="ca";break;case"lg-fra":t="fr";break;case"lg-ell":t="el";break;case"lg-deu":t="de";break;case"lg-por":t="pt";break;case"lg-eus":t="eu";break;case"lg-ara":t="ar";break;default:t="lang_code",console.warn("Impossible to convert lang_code to tld2 ISO 639-1 :",e)}return t}};function ready(e){"loading"!==document.readyState?e():document.addEventListener("DOMContentLoaded",e)}!function(e,t,n){n=n||window;var o=!1;n.addEventListener(e,(function(){o||(o=!0,requestAnimationFrame((function(){n.dispatchEvent(new CustomEvent(t)),o=!1})))}))}("resize","optimizedResize");var page={trigger_url:page_globals.__WEB_ROOT_WEB__+"/web/trigger.web.php",maps_config:{source_maps:[{name:"DARE",url:"//dh.gu.se/tiles/imperium/{z}/{x}/{y}.png",options:{maxZoom:11},default:!0},{name:"OSM",url:"//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",options:{maxZoom:19}},{name:"Map Tiles",url:"https://api.maptiler.com/maps/basic/256/{z}/{x}/{y}@2x.png?key=udlBrEEE2SPm1In5dCNb",options:{maxZoom:20}},{name:"ARCGIS",url:"//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",options:{}}],popup_options:{maxWidth:420,closeButton:!1,className:"map_popup"},markers:{mint:{iconUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/purple.png",shadowUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/marker-shadow.png",iconSize:[47,43],shadowSize:[41,41],iconAnchor:[10,19],shadowAnchor:[0,20],popupAnchor:[12,-20]},findspot:{iconUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/orange.png",shadowUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/marker-shadow.png",iconSize:[47,43],shadowSize:[41,41],iconAnchor:[10,19],shadowAnchor:[0,20],popupAnchor:[12,-20]},hoard:{iconUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/green.png",shadowUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/images/map/marker-shadow.png",iconSize:[47,43],shadowSize:[41,41],iconAnchor:[10,19],shadowAnchor:[0,20],popupAnchor:[12,-20]}}},setup:function(){var e=this;return window.ready((function(){e.hilite_lang(page_globals.WEB_CURRENT_LANG_CODE);const t=document.getElementById("footer");t&&setTimeout((function(){t.classList.remove("hidded")}),500)})),!0},hilite_lang:function(e){const t=document.getElementById("page_lang_selector");if(t){const n=t.querySelectorAll("a");for(let t=0;t<n.length;t++)-1!==n[t].href.indexOf(e)&&n[t].classList.add("selected")}return!0},load_more_items:function(e){var t=JSON.parse(e.dataset.template_map),n=document.getElementById(e.dataset.target),o=document.createElement("div");o.classList.add("spinner_list"),n.appendChild(o);var r={mode:"load_more_items",template_map:t};return common.get_json_data(this.trigger_url,r,!0).then((function(r){if(console.log("[page.load_more_items] response",r),null===r)console.log("[page.load_more_items] Error. Null response");else{var a=document.createElement("div");a.innerHTML=r.html;for(var s=a.children;s.length>0;)n.appendChild(s[0]);t.offset=t.offset+t.max_records,e.dataset.template_map=JSON.stringify(t),t.offset>=t.total_records&&(e.style.display="none")}o.remove()}))},adjust_image_size:function(e){e.style.opacity=0;var t=document.createElement("img");return t.src=e.style.backgroundImage.replace(/"/g,"").replace(/url\(|\)$/gi,""),t.addEventListener("load",(function(t){var n=this.width;this.height>n&&e.classList.add("vertical"),e.style.opacity=1}),!1),!0},adjust_footer_position:function(){let e=!1;const t=document.getElementById("wrapper");if(!t)return console.log("top_container not found !"),!1;t.offsetHeight>window.innerHeight&&(e=!0);!0===SHOW_DEBUG&&console.log("scrollbar:",e);const n=document.getElementById("footer");return!1===e?n.classList.add("fixed"):n.classList.remove("fixed"),e},activate_tooltips:function(e){SHOW_DEBUG,$(e).each((function(){new Tooltip($(this),{placement:"top"})}))},build_paginator_html:function(e,t,n){const o=t;o.dataset.total=e.total;const r=e.ar_nodes,a=r.length;for(let e=0;e<a;e++){const t=r[e];let n=t.label,a="page "+t.type+" "+t.id;if(!1===t.active&&(a+=" unactive"),"previous"!==t.id&&"next"!==t.id&&"last"!==t.id&&"first"!==t.id||(n=""),!0===t.selected&&(a+=" selected"),"extra"===t.type){a=t.type;common.create_dom_element({element_type:"span",class_name:a,text_content:n,parent:o})}else{common.create_dom_element({element_type:"a",class_name:a,text_content:n,dataset:{offset:t.offset_value,active:t.active},parent:o});t.active}}return o.addEventListener("click",this.paginator_click_event),o},paginator_click_event:function(e){const t=this,n=e.target;if("true"!==n.dataset.active)return!1;const o=parseInt(n.parentNode.dataset.total),r=n.dataset.offset,a=document.getElementById("search_form"),s=main_home.search(a,null,r,o);return s.then((function(e){t.result_container})),s},add_spinner:function(e){if(e){const t=common.create_dom_element({element_type:"img",class_name:"spinner_svg",src:page_globals.__WEB_ROOT_WEB__+"/tpl/assets/images/spinner.svg"});e.appendChild(t)}else console.warn("[add_spinner] Error on get target ",e);return!0},remove_spinner:function(e){const t=e.querySelector(".spinner_svg");return!!t&&(t.remove(),!0)},remote_image:function(e){if(e){let t="";return t=-1!==e.indexOf("v5/media_test")?e.replace(/\/v5\/media_test\/media_monedaiberica\//g,page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/"):e.replace(/\/dedalo\/media_test\/media_monedaiberica\//g,page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/"),t}return null},parse_legend_svg:function(e){if(-1!==e.indexOf("http"))return e;e=e.replace(/\/dedalo\/media\/svg\//g,page_globals.__WEB_MEDIA_BASE_URL__+"/dedalo/media/svg/");return page.remove_gaps(page.trim_char(e,"|")," | ")},parse_iri_data:function(e){const t=[];if(!e||e.length<1)return t;const n=e.split(" | ");for(let e=0;e<n.length;e++){const o=n[e].split(", ");if(o.length>1&&void 0===o[1])continue;const r=1===o.length?o[0]:o[1];let a=1===o.length?"":o[0];if(a.length<1)try{a=new URL(r).hostname}catch(e){console.error(e)}t.push({label:a,value:r})}return t},remove_gaps:function(e,t){return e.split(t).filter(Boolean).join(t)},trim_char:function(e,t){if(!e)return e;for(;e.charAt(0)==t;)e=e.substring(1);for(;e.charAt(e.length-1)==t;)e=e.substring(0,e.length-1);return e},split_data:function(e,t){return e?e.split(t):[]},is_empty:function(e){return e&&e.length>0},parse_date:function(e){if(!e||e.length<4)return null;const t=e.substring(0,4),n=e.substring(5,7),o=e.substring(8,10),r=[];o&&"00"!=o&&r.push(o),n&&"00"!=n&&r.push(n),t&&"00"!=t&&r.push(t);return r.join("-")},activate_images_gallery:function(e,t){if(!0===t){const e=document.querySelectorAll(".poptrox-overlay");if(e)for(let t=e.length-1;t>=0;t--)e[t].remove()}return $(e).poptrox({baseZIndex:2e4,fadeSpeed:1,overlayOpacity:.5,popupCloserText:"",popupHeight:150,popupWidth:150,popupLoaderText:"",popupSpeed:1,selector:"a.image_link",usePopupCaption:!1,usePopupCloser:!0,usePopupDefaultStyling:!1,usePopupForceClose:!0,usePopupLoader:!0,usePopupNav:!0,windowMargin:50})},map_popup_builder:function(e){const t=common.create_dom_element({element_type:"div",class_name:"popup_wrapper"}),n=e.group,o=new Intl.Collator("es",{sensitivity:"base",ignorePunctuation:!0});n.sort((e,t)=>o.compare(e.title,t.title));const r=function(e){const n=e.section_id,o=e.title||"Undefined title "+n,r=e.description,a=common.create_dom_element({element_type:"div",class_name:"popup_item",parent:t});common.create_dom_element({element_type:"div",class_name:"text_title",inner_html:o,parent:a});if(r&&r.length>3){common.create_dom_element({element_type:"div",class_name:"text_description",inner_html:r,parent:a})}},a=n.length;return function e(o,s){for(let e=o;e<s;e++)r(n[e]);if(s<a-1){const n=common.create_dom_element({element_type:"input",type:"button",value:tstring.load_more||"Load more..",class_name:"more_node btn btn-light btn-block primary",parent:t});n.addEventListener("click",(function(){const t=this.offset+1;e(t,t+100<a?t+100:a),this.remove()})),n.offset=s}}(0,100<a?100:a),t},parse_type_data:function(e){const t=this;if(Array.isArray(e)){const n=[];for(let o=0;o<e.length;o++)n.push(t.parse_type_data(e[o]));return n}const n=e;if(n.ref_coins_image_obverse=common.local_to_remote_path(e.ref_coins_image_obverse),n.ref_coins_image_reverse=common.local_to_remote_path(e.ref_coins_image_reverse),n.ref_coins_union)for(let e=0;e<n.ref_coins_union.length;e++)n.ref_coins_union[e].image_obverse&&(n.ref_coins_union[e].image_obverse=common.local_to_remote_path(n.ref_coins_union[e].image_obverse)),n.ref_coins_union[e].image_reverse&&(n.ref_coins_union[e].image_reverse=common.local_to_remote_path(n.ref_coins_union[e].image_reverse));return n.uri=t.parse_iri_data(n.uri),n.legend_obverse=n.legend_obverse?t.parse_legend_svg(n.legend_obverse):null,n.legend_reverse=n.legend_reverse?t.parse_legend_svg(n.legend_reverse):null,n.material=n.material?page.trim_char(page.remove_gaps(n.material," | "),"|"):null,n.symbol_obverse=n.symbol_obverse?page.trim_char(page.remove_gaps(n.symbol_obverse," | "),"|"):null,n.symbol_reverse=n.symbol_reverse?page.trim_char(page.remove_gaps(n.symbol_reverse," | "),"|"):null,n.symbol_obverse_data=JSON.parse(n.symbol_obverse_data),n.symbol_reverse_data=JSON.parse(n.symbol_reverse_data),n},parse_coin_data:function(e){const t=this;if(Array.isArray(e)){const n=[];for(let o=0;o<e.length;o++)n.push(t.parse_coin_data(e[o]));return n}const n=e;return n.image_obverse=common.local_to_remote_path(e.image_obverse),n.image_reverse=common.local_to_remote_path(e.image_reverse),n.type_data&&n.type_data.length>0&&(n.type_data=t.parse_type_data(n.type_data)),n.type=n.type?page.remove_gaps(n.type," | "):null,n.legend_obverse=n.legend_obverse?t.parse_legend_svg(n.legend_obverse):null,n.legend_reverse=n.legend_reverse?t.parse_legend_svg(n.legend_reverse):null,n.countermark_obverse=n.countermark_obverse?t.parse_legend_svg(n.countermark_obverse):null,n.countermark_reverse=n.countermark_reverse?t.parse_legend_svg(n.countermark_reverse):null,n.ref_auction_date=t.parse_date(n.ref_auction_date),n.find_date=t.parse_date(n.find_date),n.mib_uri=page_globals.__WEB_BASE_URL__+page_globals.__WEB_ROOT_WEB__+"/coin/"+n.section_id,n.uri=t.parse_iri_data(n.uri),n.bibliography=page.parse_publication(n.bibliography_data),n.mint=void 0!==n.type_data[0]?n.type_data[0].mint:null,n.type_number=void 0!==n.type_data[0]?n.type_data[0].number:null,n},parse_catalog_data:function(e){const t=this;Array.isArray(e)||(e=[e]);const n=[],o=e.length;for(let r=0;r<o;r++){const o=e[r];o.ref_coins_image_obverse=common.local_to_remote_path(o.ref_coins_image_obverse),o.ref_coins_image_reverse=common.local_to_remote_path(o.ref_coins_image_reverse),o.ref_coins_image_obverse_thumb=o.ref_coins_image_obverse?o.ref_coins_image_obverse.replace("/1.5MB/","/thumb/"):null,o.ref_coins_image_reverse_thumb=o.ref_coins_image_reverse?o.ref_coins_image_reverse.replace("/1.5MB/","/thumb/"):null,o.ref_type_legend_obverse=o.ref_type_legend_obverse?t.parse_legend_svg(o.ref_type_legend_obverse):null,o.ref_type_legend_reverse=o.ref_type_legend_reverse?t.parse_legend_svg(o.ref_type_legend_reverse):null,o.ref_type_symbol_obverse=o.ref_type_symbol_obverse?t.parse_legend_svg(o.ref_type_symbol_obverse):null,o.ref_type_symbol_reverse=o.ref_type_symbol_reverse?t.parse_legend_svg(o.ref_type_symbol_reverse):null,o.term_data=JSON.parse(o.term_data),o.term_section_id=o.term_data?o.term_data[0]:null,o.children=JSON.parse(o.children),o.parent=JSON.parse(o.parent),o.ref_type_averages_diameter=o.ref_type_averages_diameter?parseFloat(o.ref_type_averages_diameter.replace(",",".")):null,o.ref_type_total_diameter_items=o.ref_type_total_diameter_items?parseFloat(o.ref_type_total_diameter_items.replace(",",".")):null,o.ref_type_averages_weight=o.ref_type_averages_weight?parseFloat(o.ref_type_averages_weight.replace(",",".")):null,o.ref_type_total_weight_items=o.ref_type_total_weight_items?parseFloat(o.ref_type_total_weight_items.replace(",",".")):null,o.ref_type_material=o.ref_type_material?page.remove_gaps(page.trim_char(o.ref_type_material,"|")," | "):null,n.push(o)}for(let t=0;t<o;t++){const o=n[t];if("types"===o.term_table&&o.children){const t=[],n=[];for(let r=0;r<o.children.length;r++){const a=o.children[r],s=e.find(e=>e.section_id==a);if(s&&s.ref_type_averages_weight){const e=s.ref_type_total_weight_items,t=new Array(e).fill(s.ref_type_averages_weight);n.push(...t)}if(s&&s.ref_type_averages_diameter){const e=s.ref_type_total_diameter_items,n=new Array(e).fill(s.ref_type_averages_diameter);t.push(...n)}}const r=n.reduce((e,t)=>e+t,0)/n.length,a=t.reduce((e,t)=>e+t,0)/t.length;o.ref_type_averages_weight=r,o.ref_type_averages_diameter=a,o.ref_type_total_weight_items=n.length,o.ref_type_total_diameter_items=t.length}}return n},parse_publication:function(e){const t=[],n=e.length;for(let o=0;o<n;o++){const n=e[o];n._publications=[];const r=JSON.parse(n.publications_data),a=r.length;if(a>0){const e=page.split_data(n.ref_publications_authors," # "),o=page.split_data(n.ref_publications_date," # "),s=page.split_data(n.ref_publications_editor," # "),i=page.split_data(n.ref_publications_magazine," # "),l=page.split_data(n.ref_publications_place," # "),_=page.split_data(n.ref_publications_title," # "),c=page.split_data(n.ref_publications_url," # ");for(let m=0;m<a;m++){const a=r[m],p={reference:n.section_id,section_id:a,authors:e[m]||null,date:o[m]||null,editor:s[m]||null,magazine:i[m]||null,place:l[m]||null,title:_[m]||null,url:c[m]||null};n._publications.push(p),t.push(p)}}}return t}},paginator={build_page_nodes:function(e,t,n,o){SHOW_DEBUG,e=parseInt(e),t=parseInt(t),n=parseInt(n),o=parseInt(o);const r=[];if(e<1)return r;void 0===o&&(o=6),r.push({label:tstring.first||"<<",offset_value:0,type:"navigator",active:n>=t,id:"first"}),r.push({label:tstring.prev||"Prev",offset_value:n-t>0?n-t:0,type:"navigator",active:n>=t,id:"previous"});const a=Math.ceil(e/t),s=Math.ceil(n/t)+1;let i=Math.ceil(o/2);s<=i&&(i=2*i-s+1),SHOW_DEBUG;for(var l=1;l<=a;l++){const e=l-1==n/t,o=!e,a=(l-1)*t;(l>=s-i&&l<=s||l>=s-i&&l<=s+i)&&r.push({label:l,offset_value:a,type:"page",selected:e,active:o,id:l})}r.push({label:tstring.next||"Next",offset_value:n+t,type:"navigator",active:n<e-t,id:"next"}),r.push({label:tstring.last||">>",offset_value:(a-1)*t,type:"navigator",active:n<e-t,id:"last"});return SHOW_DEBUG,{total:e,limit:t,offset:n,nodes:o,n_pages:a,n_pages_group:i,current_page:s,ar_nodes:r}},build_paginator_html:function(e,t,n){const o=this,r=new DocumentFragment,a=e.ar_nodes||[],s=a.length;for(let t=0;t<s;t++){const s=a[t];let i="",l=s.label;switch(s.type){case"navigator":i=s.type+" "+s.id;break;case"page":i=s.type+""}!0===s.selected&&(i+=" selected");const _=common.create_dom_element({element_type:"a",class_name:i+(s.active?"":" unactive"),text_content:l,parent:r});!0===s.active&&_.addEventListener("click",(function(t){const r="function"==typeof n?n:o.goto_url;return"function"==typeof r&&r({offset:s.offset_value,total:e.total})}))}const i=common.create_dom_element({element_type:"div",class_name:"paginator_wrapper navigator"});return i.appendChild(r),t&&t.appendChild(i),i},goto_url:function(e){const t="../?total="+e.total+"&offset="+e.offset;return window.location.href=t,!0},get_full_paginator:function(e){const t=e.total,n=e.limit,o=e.offset,r=e.n_nodes,a=e.callback||null,s=this.build_page_nodes(t,n,o,r);return this.build_paginator_html(s,!1,a)},get_totals_node:function(e){const t=e.total,n=(e.limit,e.offset),o=e.count,r=0==t?0:Math.ceil(1*n)||1,a=n+o,s=0===t?tstring.showed+" "+t:tstring.showed+" "+r+" "+tstring.to+" "+a+" "+tstring.of+" "+t;return common.create_dom_element({element_type:"div",class_name:"totals",text_content:s})}};!function(){const e=function(){};e.prototype.request=async function(e){console.log("++++ request options:",e);const t=e.url||page_globals.JSON_TRIGGER_URL,n=e.method||"POST",o=e.mode||"cors",r=e.cache||"no-cache",a=e.credentials||"same-origin",s=e.headers||{"Content-Type":"application/json"},i=e.redirect||"follow",l=e.referrer||"no-referrer",_=e.body;return _.code||(_.code=page_globals.API_WEB_USER_CODE),_.lang||(_.lang=page_globals.WEB_CURRENT_LANG_CODE),fetch(t,{method:n,mode:o,cache:r,credentials:a,headers:s,redirect:i,referrer:l,body:JSON.stringify(_)}).then((function(e){if(!e.ok)throw console.warn("-> handle_errors response:",e),Error(e.statusText);return e})).then(e=>e.json().then(e=>e)).catch(e=>(console.error("!!!!! [page data_manager.request] ERROR:",e),{result:!1,msg:e.message,error:e}))},window.data_manager=new e,window.event_manager=new function(){this.events=[],this.last_token=-1,this.subscribe=function(e,t){const n="event_"+String(++this.last_token),o={event_name:e,token:n,callback:t};return this.events.push(o),n},this.unsubscribe=function(e){return this.events.map((t,n,o)=>{t.token===e&&o.splice(n,1)})},this.publish=function(e,t={}){const n=this.events.filter(t=>t.event_name===e);return!!n&&n.map(e=>e.callback(t))},this.get_events=function(){return this.events},this.fire_event=function(e,t){var n;if(e.ownerDocument)n=e.ownerDocument;else{if(9!=e.nodeType)throw new Error("Invalid node passed to fireEvent: "+e.id);n=e}if(e.dispatchEvent){var o="";switch(t){case"click":case"mousedown":case"mouseup":o="MouseEvents";break;case"focus":case"change":case"blur":case"select":o="HTMLEvents";break;default:throw"fireEvent: Couldn't find an event class for event '"+t+"'."}var r="change"!=t;(a=n.createEvent(o)).initEvent(t,r,!0),a.synthetic=!0,e.dispatchEvent(a,!0)}else if(e.fireEvent){var a;(a=n.createEventObject()).synthetic=!0,e.fireEvent("on"+t,a)}},this.when_in_dom=function(e,t){const n=new MutationObserver((function(o){document.contains(e)&&(n.disconnect(),t(this))}));return n.observe(document,{attributes:!1,childList:!0,characterData:!1,subtree:!0}),n}},setTimeout((function(){console.log("Activated app_utils !"),console.log("Avilable data_manager:",data_manager),console.log("Avilable event_manager:",event_manager)}),10)}();var biblio_row_fields={biblio_object:null,caller:null,get_typology:function(){const e=this.biblio_object.typology||"[]",t=JSON.parse(e);return"1"==(void 0!==t[0]?t[0]:0)?"book":"article"},author:function(){const e=this.biblio_object,t=common.create_dom_element({element_type:"div",class_name:"info_line author"});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:e.section_id+" "+this.get_typology(),href:"/dedalo/lib/dedalo/main/?t=rsc205&id="+e.section_id,parent:t}).setAttribute("target","_blank")}if(e.authors&&e.authors.length>0){const o=e.authors_data,r=o.length,a=[];for(var n=0;n<r;n++){const e=[];o[n].surname&&e.push(o[n].surname),o[n].name&&e.push(o[n].name);const t=e.join(", ");a.push(t)}const s=a.join("; ");common.create_dom_element({element_type:"div",class_name:"info_value",text_content:s,parent:t})}else common.create_dom_element({element_type:"div",class_name:"info_value",text_content:"Undefined author",parent:t});return t},publication_date:function(){const e=this.biblio_object,t=common.create_dom_element({element_type:"div",class_name:"info_line publication_date hide"});if(e.publication_date){const n=e.publication_date.split("-");let o=parseInt(n[0]);n[1],parseInt(n[1])>0&&(o=o+"-"+parseInt(n[1])),n[2],parseInt(n[2])>0&&(o=o+"-"+parseInt(n[2])),common.create_dom_element({element_type:"div",class_name:"info_value",text_content:o,parent:t}),t.classList.remove("hide")}return t},row_title:function(){const e=this.biblio_object,t=this.get_typology(),n=e.pdf||"[]",o=JSON.parse(n),r=o.length,a=common.create_dom_element({element_type:"div",class_name:"info_line row_title"}),s=e.title||"",i="book"===t?" italic":"";common.create_dom_element({element_type:"div",class_name:"title"+i+(r>0?" blue":""),text_content:s,parent:a});for(let e=0;e<r;e++){const t=o[e];common.create_dom_element({element_type:"div",class_name:"pdf",title:t.title,parent:a}).addEventListener("click",e=>{window.open(t.iri,"PDF","menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes")})}return a},row_body:function(){const e=this.biblio_object,t=this.get_typology(),n=common.create_dom_element({element_type:"div",class_name:"info_line row_body "+t});switch(t){case"book":e.place&&common.create_dom_element({element_type:"div",class_name:"info_value place grey",text_content:e.place,parent:n}),e.editor&&common.create_dom_element({element_type:"div",class_name:"info_value editor grey",text_content:": "+e.editor,parent:n});break;default:if(e.magazine&&common.create_dom_element({element_type:"div",class_name:"info_value magazine grey italic",text_content:e.magazine,parent:n}),e.serie&&common.create_dom_element({element_type:"div",class_name:"info_value serie grey",text_content:": "+e.serie,parent:n}),e.volume){const t=e.serie.length>0?", "+e.volume:e.volume;common.create_dom_element({element_type:"div",class_name:"info_value volume grey italic",text_content:t,parent:n})}if(e.other_people_name&&e.other_people_name.length>0){const t=e.other_people_name.split(" | "),o=e.other_people_role.split(" | ");for(let r=0;r<t.length;r++){const a=t[r],s=void 0!==o[r]?" ("+o[r]+")":"",i=e.serie.length>0||e.volume&&e.volume.length>0?", "+a+s:a+s;common.create_dom_element({element_type:"div",class_name:"info_value other_people_name grey",text_content:i,parent:n})}}if(e.physical_description){const t=e.serie.length>0||e.volume&&e.volume.length>0?", "+e.physical_description:e.physical_description;common.create_dom_element({element_type:"div",class_name:"info_value physical_description grey",text_content:t,parent:n})}}return n},row_url:function(){const e=this.biblio_object,t=common.create_dom_element({element_type:"div",class_name:"info_line row_url"}),n=e.url_data;if(n&&n.length>0){const e=JSON.parse(n),o=e.length;for(let n=0;n<o;n++){const r=e[n];common.create_dom_element({element_type:"a",class_name:"url_data",title:r.title,text_content:r.title,href:r.iri,parent:t}),!(n%2)&&n<o&&o>1&&common.create_dom_element({element_type:"span",class_name:"separator",text_content:" | ",parent:t})}}return t},descriptors:function(e){const t=this,n=(this.biblio_object,common.create_dom_element({element_type:"div",class_name:"info_line descriptors"})),o=e.split(" - ");for(let e=0;e<o.length;e++){const r=o[e];common.create_dom_element({element_type:"a",class_name:"descriptors_link",text_content:r,parent:n}).addEventListener("click",(function(){t.caller.search_item("descriptors",r)}))}return n}};
//# sourceMappingURL=app-min.js.map