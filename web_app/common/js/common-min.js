"use strict";var common={get_json_data:function(e,t,n){const r=e+"?d="+Date.now(),o=JSON.stringify(t);var a=-1!=navigator.userAgent.indexOf("MSIE"),i=/rv:11.0/i.test(navigator.userAgent);if(a||i){var s=tstring.incompatible_browser||"Warning: Internet explorer is not supported. Please use a modern browser like Chrome, Firefox, Safari, Opera, Edje..";return alert(s),!1}return void 0===n&&(n=!0),new Promise((function(e,t){var a=new XMLHttpRequest;a.open("POST",r,n),a.setRequestHeader("Content-type","application/json"),a.responseType="json",a.onload=function(n){200===a.status?e(a.response):t(Error("Reject error. Data don't load. error code: "+a.statusText+" - url: "+r))},a.onerror=function(e){t(Error("There was a network error. data_send: "+r+"?"+o+"statusText: "+a.statusText))},a.send(o)}))},create_dom_element:function(e){const t=e.element_type,n=e.parent,r=e.class_name,o=e.style,a=void 0!==e.dataset?e.dataset:e.data_set,i=e.custom_function_events,s=e.title_label||e.title||null,l=e.text_node,c=e.text_content,d=e.inner_html,u=e.href,m=e.id,p=e.draggable,_=e.value,f=e.download,v=e.src,g=e.type,h=e.placeholder,y=document.createElement(t);if(m&&(y.id=m),"a"===t&&(y.href=u||"javascript:;"),r&&(y.className=r),o)for(b in o)y.style[b]=o[b];if(s&&(y.title=s),a)for(var b in a)y.dataset[b]=a[b];if(_&&(y.value=_),g&&y.setAttribute("type",g),i){const e=i.length;for(var w=0;w<e;w++){var E=i[w].name,C=i[w].type,j=i[w].function_arguments;this.create_custom_events(y,C,E,j)}}if(l)if("span"===t)y.textContent=l;else{var S=document.createElement("span");S.innerHTML=" "+l,y.appendChild(S)}else c?y.textContent=c:d&&y.insertAdjacentHTML("afterbegin",d);return n&&n.appendChild(y),p&&(y.draggable=p),f&&y.setAttribute("download",f),v&&(y.src=v),h&&(y.placeholder=h),y},build_player:function(e){!0===SHOW_DEBUG&&console.log("[common.build_player] options",e);const t=this;var n=e.type||["video/mp4"],r=e.src||[""];Array.isArray(r)||(r=[r]);var o=document.createElement("video");o.id=e.id||"video_player",o.controls=e.controls||!0,o.poster=e.poster||"",o.className=e.class||"video-js video_hidden",o.preload=e.preload||"auto",o.dataset.setup="{}",e.height&&(o.height=e.height),e.width&&(o.width=e.width);for(var a=0;a<r.length;a++){var i=document.createElement("source");i.src=r[a],i.type=n[a],o.appendChild(i)}const s=r[0],l=parseInt(t.get_query_variable(s,"vbegin"));var c=e.ar_subtitles||null;if(c)for(a=0;a<c.length;a++){var d=c[a],u=document.createElement("track");u.kind="subtitles",u.src=d.src,u.srclang=d.srclang,u.label=d.label,d.srclang===e.default&&(u.default=!0),o.appendChild(u)}var m=document.createElement("p");m.className="vjs-no-js";var p,_=document.createTextNode("To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video");return m.appendChild(_),o.appendChild(m),setTimeout((function(){window.ready((function(n){(p=videojs(o)).ready((function(){this.addClass("video_show"),void 0!==e.ar_restricted_fragments&&e.ar_restricted_fragments.length>0&&this.on("timeupdate",(function(n){t.skip_restricted(this,e.ar_restricted_fragments,l)}))})),!0===e.play&&p.play()}))}),1),o},skip_restricted:function(e,t,n){const r=parseInt(e.currentTime()),o=r+parseInt(n);SHOW_DEBUG;const a=t.length;for(let i=0;i<a;i++){const a=t[i],s=a.tcin_secs,l=a.tcout_secs;if(o>s&&o<l){const t=l-n;e.currentTime(t),!0===SHOW_DEBUG&&(console.log("+++ Jumped to end time :",o,l),console.log("item:",a,"tcin_secs",n,"player_current_time",r,"time_to_jump_secs",t))}}return!0},timestamp_to_fecha:function(e){if(!e||e.length<4)return null;if(10===e.length){var t=e.substring(0,4),n=e.substring(5,7);const a=[];(o=e.substring(8,10))&&"00"!=o&&a.push(o),n&&"00"!=n&&a.push(n),t&&"00"!=t&&a.push(t);var r=a.join("-")}else{var o,a=new Date(e);t=a.getFullYear(),n=a.getMonth();function i(e){return e<10?"0"+e:e}r=i(o=a.getDate())+"-"+i(n+1)+"-"+t}return r},local_to_remote_path:function(e){if(!e)return null;const t=page_globals.WEB_ENTITY;return e=(e=e.replace("/dedalo4/","/dedalo/")).replace("/media_test/media_"+t,"/media"),e=page_globals.__WEB_MEDIA_BASE_URL__+e},get_posterframe_from_video:function(e){var t=e,n=(t=(t=t.replace(/\/404\//g,"/posterframe/")).replace(/\.mp4/g,".jpg")).split("?");return void 0!==n[0]&&(t=n[0]),t},open_note:function(e,t){for(var n=t.length-1;n>=0;n--){var r=t[n];if(e.dataset.tag_id===r.id)return $.colorbox({html:r.label,transition:"none"}),!0}return!1},set_background_color:function(e,t){e.setAttribute("crossOrigin","");const n=(new BackgroundColorTheif).getBackGroundColor(e);return t.style.backgroundColor="rgb("+n[0]+","+n[1]+","+n[2]+")",n},build_slider:function(e){const t=e.container;return new Promise((function(n){var r=common.create_dom_element({element_type:"ul",class_name:"slides",parent:t});const o=e.ar_elements.length;for(let t=0;t<o;t++){const o=e.ar_elements[t],c=o.image,d=o.title||null,u=o.text||null;if(!(c.length<4)){var a=common.create_dom_element({element_type:"li",class_name:"row_image",parent:r});common.create_dom_element({element_type:"div",class_name:"image_bg",parent:a}).style.backgroundImage="url("+c+")";var i=common.create_dom_element({element_type:"div",class_name:"image_text",parent:a}),s=common.create_dom_element({element_type:"h1",text_content:d,parent:i});common.create_dom_element({element_type:"a",parent:s}),common.create_dom_element({element_type:"span",text_content:u,parent:i});if(0===t){var l=new Image;l.addEventListener("load",(function(){n(r)}),!1),l.src=c}}}}))},get_scrollbar_width:function(){var e=document.createElement("div");e.style.visibility="hidden",e.style.width="100px",e.style.msOverflowStyle="scrollbar",document.body.appendChild(e);var t=e.offsetWidth;e.style.overflow="scroll";var n=document.createElement("div");n.style.width="100%",e.appendChild(n);var r=n.offsetWidth;return e.parentNode.removeChild(e),t-r},has_scrollbar:function(){if("number"==typeof window.innerWidth){return window.innerWidth>=document.documentElement.clientWidth}const e=document.documentElement||document.body;var t,n;void 0!==e.currentStyle&&(t=e.currentStyle.overflow),t=t||window.getComputedStyle(e,"").overflow,void 0!==e.currentStyle&&(n=e.currentStyle.overflowY),n=n||window.getComputedStyle(e,"").overflowY;var r=e.scrollHeight>e.clientHeight,o=/^(visible|auto)$/.test(t)||/^(visible|auto)$/.test(n);return r&&o||("scroll"===t||"scroll"===n)},clone_deep:function(e){const t=this;let n,r;if("object"!=typeof e)return e;if(!e)return e;if("[object Array]"===Object.prototype.toString.apply(e)){for(n=[],r=0;r<e.length;r+=1)n[r]=t.clone_deep(e[r]);return n}for(r in n={},e)e.hasOwnProperty(r)&&(n[r]=t.clone_deep(e[r]));return n},get_query_variable:function(e,t){const n=e.split("?")[1].split("&");for(var r=0;r<n.length;r++){const e=n[r].split("=");if(e[0]==t)return e[1]}return!1},register_events:function(e,t){for(let n in t){const r=t[n];e.addEventListener(n,(function(e){for(let t in r)r[t](e)}))}return!0},clean_gaps:function(e,t=" | ",n=", "){return(e=(e=(e=e.trim()).replace(/^\| |\| {1,2}\|| \|+$/g,"")).trim()).split(t).filter(e=>e.length>0).join(n)}};function ready(e){"loading"!==document.readyState?e():document.addEventListener("DOMContentLoaded",e)}!function(e,t,n){n=n||window;var r=!1;n.addEventListener(e,(function(){r||(r=!0,requestAnimationFrame((function(){n.dispatchEvent(new CustomEvent(t)),r=!1})))}))}("resize","optimizedResize");