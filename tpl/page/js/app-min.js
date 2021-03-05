"use strict";var common={get_json_data:function(e,t,n){const o=e+"?d="+Date.now(),r=JSON.stringify(t);var a=-1!=navigator.userAgent.indexOf("MSIE"),l=/rv:11.0/i.test(navigator.userAgent);if(a||l){var i=tstring.incompatible_browser||"Warning: Internet explorer is not supported. Please use a modern browser like Chrome, Firefox, Safari, Opera, Edje..";return alert(i),!1}return void 0===n&&(n=!0),new Promise((function(e,t){var a=new XMLHttpRequest;a.open("POST",o,n),a.setRequestHeader("Content-type","application/json"),a.responseType="json",a.onload=function(n){200===a.status?e(a.response):t(Error("Reject error. Data don't load. error code: "+a.statusText+" - url: "+o))},a.onerror=function(e){t(Error("There was a network error. data_send: "+o+"?"+r+"statusText: "+a.statusText))},a.send(r)}))},create_dom_element:function(e){const t=e.element_type,n=e.parent,o=e.class_name,r=e.style,a=e.data_set||e.dataset,l=e.custom_function_events,i=e.title_label||e.title,s=e.text_node,c=e.text_content,_=e.inner_html,u=e.href,p=e.id,m=e.draggable,d=e.value,f=e.download,h=e.src,g=e.placeholder,v=e.type,b=e.target,y=e.loading,w=document.createElement(t);if(p&&(w.id=p),"a"===t&&(w.href=u||"javascript:;",b&&(w.target=b)),o&&(w.className=o),r)for(q in r)w.style[q]=r[q];if(i&&(w.title=i),a)for(var q in a)w.dataset[q]=a[q];if(d&&(w.value=d),v&&w.setAttribute("type",v),l){const e=l.length;for(let t=0;t<e;t++){const e=l[t].name,n=l[t].type,o=l[t].function_arguments;this.create_custom_events(w,n,e,o)}}if(s)if("span"===t)w.textContent=s;else{const e=document.createElement("span");e.insertAdjacentHTML("afterbegin"," "+s),w.appendChild(e)}else c?w.textContent=c:_&&w.insertAdjacentHTML("afterbegin",_);return n&&n.appendChild(w),m&&(w.draggable=m),f&&w.setAttribute("download",f),h&&(w.src=h),g&&(w.placeholder=g),y&&(w.loading=y),w},build_player:function(e){!0===SHOW_DEBUG&&console.log("[common.build_player] options",e);const t=this;var n=e.type||["video/mp4"],o=e.src||[""];Array.isArray(o)||(o=[o]);const r=document.createElement("video");r.id=e.id||"video_player",r.controls=e.controls||!0,r.poster=e.poster||common.get_posterframe_from_video(o),r.className=e.class||"video-js video_hidden hide",r.preload=e.preload||"auto",r.dataset.setup="{}",e.height&&(r.height=e.height),e.width&&(r.width=e.width);for(let e=0;e<o.length;e++){const t=document.createElement("source");t.src=o[e],t.type=n[e],r.appendChild(t)}const a=e.ar_subtitles||null;if(a)for(let t=0;t<a.length;t++){const n=a[t],o=document.createElement("track");o.kind="subtitles",o.src=n.src,o.srclang=n.srclang,o.label=n.label,n.srclang===e.default&&(o.default=!0),r.appendChild(o)}const l=document.createElement("p");l.className="vjs-no-js";const i=document.createTextNode("To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video");return l.appendChild(i),r.appendChild(l),setTimeout((function(){window.ready((function(n){const a=videojs(r);a.ready((function(){if(this.addClass("video_show"),this.removeClass("hide"),void 0!==e.ar_restricted_fragments&&e.ar_restricted_fragments.length>0){const n=o[0],r=parseInt(t.get_query_variable(n,"vbegin"));this.on("timeupdate",(function(n){t.skip_restricted(this,e.ar_restricted_fragments,r)}))}})),!0===e.play&&a.play()}))}),1),r},skip_restricted:function(e,t,n){const o=parseInt(e.currentTime()),r=o+parseInt(n);SHOW_DEBUG;const a=t.length;for(let l=0;l<a;l++){const a=t[l],i=a.tcin_secs,s=a.tcout_secs;if(r>i&&r<s){const t=s-n;e.currentTime(t),!0===SHOW_DEBUG&&(console.log("+++ Jumped to end time :",r,s),console.log("item:",a,"tcin_secs",n,"player_current_time",o,"time_to_jump_secs",t))}}return!0},timestamp_to_fecha:function(e){if(!e||e.length<4)return null;if(10===e.length){var t=e.substring(0,4),n=e.substring(5,7);const a=[];(r=e.substring(8,10))&&"00"!=r&&a.push(r),n&&"00"!=n&&a.push(n),t&&"00"!=t&&a.push(t);var o=a.join("-")}else{var r,a=new Date(e);t=a.getFullYear(),n=a.getMonth();function l(e){return e<10?"0"+e:e}o=l(r=a.getDate())+"-"+l(n+1)+"-"+t}return o},local_to_remote_path:function(e){if(!e)return null;if(-1===e.indexOf("http://")&&-1===e.indexOf("https://")){const t=page_globals.WEB_ENTITY;"/"!==(e=(e=e.replace("/dedalo4/","/dedalo/")).replace("/media_test/media_"+t,"/media")).charAt(0)&&(e="/"+e),e=page_globals.__WEB_MEDIA_BASE_URL__+e}return e},get_posterframe_from_video:function(e){var t=e,n=(t=(t=t.replace(/\/404\//g,"/posterframe/")).replace(/\.mp4/g,".jpg")).split("?");return void 0!==n[0]&&(t=n[0]),t},get_media_engine_url:function(e,t,n,o){const r=o?e:/^.{3,}_.{3,}_(\d{1,})\.[\S]{3,4}$/.exec(e)[1];return __WEB_MEDIA_ENGINE_URL__+"/"+t+"/"+r+(n?"/"+n:"")},open_note:function(e,t){for(var n=t.length-1;n>=0;n--){var o=t[n];if(e.dataset.tag_id===o.id)return $.colorbox({html:o.label,transition:"none"}),!0}return!1},set_background_color:function(e,t){e.setAttribute("crossOrigin","");const n=(new BackgroundColorTheif).getBackGroundColor(e);return t.style.backgroundColor="rgb("+n[0]+","+n[1]+","+n[2]+")",n},build_slider:function(e){const t=e.container;return new Promise((function(n){var o=common.create_dom_element({element_type:"ul",class_name:"slides",parent:t});const r=e.ar_elements.length;for(let t=0;t<r;t++){const r=e.ar_elements[t],c=r.image,_=r.title||null,u=r.text||null;if(!(c.length<4)){var a=common.create_dom_element({element_type:"li",class_name:"row_image",parent:o});common.create_dom_element({element_type:"div",class_name:"image_bg",parent:a}).style.backgroundImage="url("+c+")";var l=common.create_dom_element({element_type:"div",class_name:"image_text",parent:a}),i=common.create_dom_element({element_type:"h1",text_content:_,parent:l});common.create_dom_element({element_type:"a",parent:i}),common.create_dom_element({element_type:"span",text_content:u,parent:l});if(0===t){var s=new Image;s.addEventListener("load",(function(){n(o)}),!1),s.src=c}}}}))},get_scrollbar_width:function(){var e=document.createElement("div");e.style.visibility="hidden",e.style.width="100px",e.style.msOverflowStyle="scrollbar",document.body.appendChild(e);var t=e.offsetWidth;e.style.overflow="scroll";var n=document.createElement("div");n.style.width="100%",e.appendChild(n);var o=n.offsetWidth;return e.parentNode.removeChild(e),t-o},has_scrollbar:function(){if("number"==typeof window.innerWidth){return window.innerWidth>=document.documentElement.clientWidth}const e=document.documentElement||document.body;var t,n;void 0!==e.currentStyle&&(t=e.currentStyle.overflow),t=t||window.getComputedStyle(e,"").overflow,void 0!==e.currentStyle&&(n=e.currentStyle.overflowY),n=n||window.getComputedStyle(e,"").overflowY;var o=e.scrollHeight>e.clientHeight,r=/^(visible|auto)$/.test(t)||/^(visible|auto)$/.test(n);return o&&r||("scroll"===t||"scroll"===n)},clone_deep:function(e){const t=this;let n,o;if("object"!=typeof e)return e;if(!e)return e;if("[object Array]"===Object.prototype.toString.apply(e)){for(n=[],o=0;o<e.length;o+=1)n[o]=t.clone_deep(e[o]);return n}for(o in n={},e)e.hasOwnProperty(o)&&(n[o]=t.clone_deep(e[o]));return n},get_query_variable:function(e,t){const n=e.split("?")[1].split("&");for(var o=0;o<n.length;o++){const e=n[o].split("=");if(e[0]==t)return e[1]}return!1},register_events:function(e,t){for(let n in t){const o=t[n];e.addEventListener(n,(function(e){for(let t in o)o[t](e)}))}return!0},clean_gaps:function(e,t=" | ",n=", "){if(!e)return"";return(e=(e=(e=e.trim()).replace(/^\| |\| {1,2}\|| \|+$/g,"")).trim()).split(t).filter(e=>e.length>0).join(n)},when_in_dom:function(e,t){if(document.contains(e))return t();const n=new MutationObserver((function(o){document.contains(e)&&(n.disconnect(),t())}));return n.observe(document,{attributes:!1,childList:!0,characterData:!1,subtree:!0}),n},remove_gaps:function(e,t){return e.split(t).filter(Boolean).join(t)},split_data:function(e,t){return e?e.split(t):[]},clean_date:function(e,t){const n=e?e.split(t):[],o=[];for(let e=0;e<n.length;e++){const t=n[e].split("-"),r=[];if(t[2]&&"00 00:00:00"!==t[2]){const e=t[2].split(" ")[0];r.push(e)}t[1]&&"00"!==t[1]&&r.push(t[1]),t[0]&&"0000"!==t[0]&&r.push(t[0]);const a=r.join("-");o.push(a)}return o},download_item:function(e,t){return fetch(e).then((function(e){return e.blob()})).then((function(e){const n=URL.createObjectURL(e),o=common.create_dom_element({element_type:"a",href:n,download:t||"image.jpg"});o.click(),o.remove()})),!0},is_node:function(e){return!!(e instanceof HTMLElement||e.nodeType)},is_element_in_viewport:function(e){const t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&t.right<=(window.innerWidth||document.documentElement.clientWidth)},is_element_top_in_viewport:function(e){return e.getBoundingClientRect().top<=(window.innerHeight||document.documentElement.clientHeight)},lang_code_to_tld2:function(e){let t;switch(e){case"lg-spa":t="es";break;case"lg-eng":t="en";break;case"lg-cat":t="ca";break;case"lg-fra":t="fr";break;case"lg-ell":t="el";break;case"lg-deu":t="de";break;case"lg-por":t="pt";break;case"lg-eus":t="eu";break;case"lg-ara":t="ar";break;default:t="lang_code",console.warn("Impossible to convert lang_code to tld2 ISO 639-1 :",e)}return t},is_object:function(e){return"object"==typeof e&&null!==e},is_array:function(e){return Array.isArray(e)},get_today_date:function(){const e=new Date;return`${e.getDate().toString().padStart(2,"0")}/${(e.getMonth()+1).toString().padStart(2,"0")}/${e.getFullYear().toString().padStart(4,"0")} ${e.getHours().toString().padStart(2,"0")}:${e.getMinutes().toString().padStart(2,"0")}:${e.getSeconds().toString().padStart(2,"0")}`},uniq_fast:function(e){const t={},n=[];let o=e.length,r=0;for(let a=0;a<o;a++){const o=e[a];1!==t[o]&&(t[o]=1,n[r++]=o)}return n}};function ready(e){"loading"!==document.readyState?e():document.addEventListener("DOMContentLoaded",e)}function form_factory(){this.form_items=[],this.node=null,this.item_factory=function(e){const t=this.build_form_item(e);return this.build_form_node(t,e.parent),"function"==typeof e.callback&&e.callback(t),this.form_items[e.id]=t,t},this.build_form_item=function(e){return{id:e.name,name:e.name,label:e.label,class_name:e.class_name||null,q:e.q||"",q_selected:[],q_selected_eq:e.q_selected_eq||"=",q_column:e.q_column,q_column_filter:e.q_column_filter,q_splittable:e.q_splittable||!1,sql_filter:e.sql_filter||null,eq:e.eq||"LIKE",eq_in:void 0!==e.eq_in?e.eq_in:"",eq_out:void 0!==e.eq_out?e.eq_out:"%",is_term:e.is_term||!1,callback:e.callback||!1,list_format:e.list_format||null,wrapper:e.wrapper||null,node_input:null,node_values:null,input_type:e.input_type,input_values:e.input_values}},this.build_form_node=function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"form-group field "+e.class_name,parent:t});switch(e.input_type){case"range_slider":const t=common.create_dom_element({element_type:"div",class_name:"range_slider_labels",parent:n}),o=(common.create_dom_element({element_type:"input",type:"text",id:e.id+"_in",class_name:"form-control range_slider_value value_in",parent:t}),common.create_dom_element({element_type:"span",class_name:"form-control range_slider_label node_label",inner_html:e.label,parent:t}),common.create_dom_element({element_type:"input",type:"text",id:e.id+"_out",class_name:"form-control range_slider_value value_out",parent:t}),common.create_dom_element({element_type:"div",id:e.id,class_name:"form-control "+(e.class_name?" "+e.class_name:""),parent:n}));e.node_input=o;break;case"select":const r=common.create_dom_element({element_type:"select",id:e.id,class_name:"form-control ui-autocomplete-select"+(e.class_name?" "+e.class_name:""),value:e.q||"",parent:n});for(let t=0;t<e.input_values.length;t++)e.input_values[t],common.create_dom_element({element_type:"option",value:e.input_values[t].value,inner_html:e.input_values[t].label,parent:r});r.addEventListener("change",(function(t){console.log("e.target.value:",t.target.value),t.target.value&&(e.q=t.target.value,console.log("form_item:",e))})),e.node_input=r;break;default:let a;const l=common.create_dom_element({element_type:"input",type:"text",id:e.id,class_name:"form-control ui-autocomplete-input"+(e.class_name?" "+e.class_name:""),placeholder:e.label,value:e.q||"",parent:n});l.addEventListener("keyup",(function(t){e.q=t.target.value,l.value.length>0&&(a=a||common.create_dom_element({element_type:"span",class_name:"form_input_label",inner_html:e.label,parent:n}))})),l.addEventListener("blur",(function(e){a&&0===l.value.length&&(a.remove(),a=null)})),e.node_input=l}const o=common.create_dom_element({element_type:"div",class_name:"container_values",parent:n});return e.node_values=o,!0},this.build_operators_node=function(){const e=common.create_dom_element({element_type:"div",class_name:"form-group field field_operators"}),t=(common.create_dom_element({element_type:"span",class_name:"radio operators",text_content:tstring.operator||"Operator",parent:e}),common.create_dom_element({element_type:"input",type:"radio",id:"operator_or",parent:e}));t.setAttribute("name","operators"),t.setAttribute("value","OR");common.create_dom_element({element_type:"label",text_content:tstring.or||"or",parent:e}).setAttribute("for","operator_or");const n=common.create_dom_element({element_type:"input",type:"radio",id:"operator_and",name:"operators",parent:e});n.setAttribute("name","operators"),n.setAttribute("value","AND"),n.setAttribute("checked","checked");return common.create_dom_element({element_type:"label",text_content:tstring.and||"and",parent:e}).setAttribute("for","operator_and"),e},this.add_selected_value=function(e,t,n){const o=e.node_values,r=o.querySelectorAll(".input_values");for(let e=r.length-1;e>=0;e--)if(n===r[e].value)return!1;const a=common.create_dom_element({element_type:"div",class_name:"line_value",parent:o});common.create_dom_element({element_type:"i",class_name:"icon remove fal far fa-trash fa-trash-alt",parent:a}).addEventListener("click",(function(){const t=e.q_selected.indexOf(n);t>-1&&(e.q_selected.splice(t,1),this.parentNode.remove(),!0===SHOW_DEBUG&&console.log("form_item.q_selected removed value:",n,e.q_selected))}));common.create_dom_element({element_type:"span",class_name:"value_label",inner_html:t,parent:a});return common.create_dom_element({element_type:"input",class_name:"input_values",parent:a}).value=n,e.q_selected.push(n),e.node_input.value="",e.q="",!0},this.set_input_value=function(e,t){return e.node_input.value=t,e.q=t,!0},this.build_filter=function(){const e=this,t=e.form_items,n=[];for(let[e,o]of Object.entries(t)){const e=!0===o.is_term?"OR":"AND",t={};if(t[e]=[],0!==o.q.length&&"*"!==o.q||o.sql_filter){const n="AND",r={};r[n]=[];const a=o.q.replace(/(')/g,"''"),l={field:o.q_column,value:`'${o.eq_in}${a}${o.eq_out}'`,op:o.eq,sql_filter:o.sql_filter,wrapper:o.wrapper};r[n].push(l),t[e].push(r)}if(0!==o.q_selected.length)for(let n=0;n<o.q_selected.length;n++){const r=o.q_selected[n].replace(/(')/g,"''"),a="AND",l={};l[a]=[];const i={field:o.q_column,value:"LIKE"===o.q_selected_eq?`'%${r}%'`:`'${r}'`,op:o.q_selected_eq,sql_filter:o.sql_filter,wrapper:o.wrapper};l[a].push(i),t[e].push(l)}t[e].length>0&&n.push(t)}if(!0===SHOW_DEBUG&&(console.log("self.form_items:",e.form_items),console.log("ar_query_elements:",n)),n.length<1)return console.warn("-> form_to_sql_filter empty elements selected:",n),!1;const o={};return o[e.node.querySelector('input[name="operators"]')?e.node.querySelector('input[name="operators"]:checked').value:"AND"]=n,o},this.parse_sql_filter=function(e,t){const n=this;return e?function(){const o=Object.keys(e)[0],r=e[o],a=[],l=r.length;for(let e=0;e<l;e++){const o=r[e],l=Object.keys(o)[0];if("AND"===l||"OR"===l){const e=""+n.parse_sql_filter(o,t);a.push(e);continue}const i=o.wrapper&&o.wrapper.length>0?o.wrapper+"("+o.field+")":o.field;let s;s=o.sql_filter&&o.sql_filter.length>0?o.sql_filter:"MATCH"===o.op?"MATCH ("+i+") AGAINST ("+o.value+" IN BOOLEAN MODE)":-1!==i.indexOf("AS")||o.wrapper&&o.wrapper.length>0?i+" "+o.op+" "+o.value+" AND "+i+"!=''":"`"+i+"` "+o.op+" "+o.value+" AND `"+i+"`!=''",a.push(s),t&&o.group&&t.push(o.group)}return a.join(" "+o+" ")}():null},this.full_text_search_operators_info=function(){const e=common.create_dom_element({element_type:"div",class_name:"full_text_search_operators_info"}),t=[{op:tstring.operator,info:tstring.description},{op:"+",info:tstring.include_the_word||"Include, the word must be present."},{op:"-",info:tstring.exclude_the_word||"Exclude, the word must not be present."},{op:">",info:tstring.increase_ranking||"Include, and increase ranking value."},{op:"<",info:tstring.decrease_ranking||"Include, and decrease the ranking value."},{op:"()",info:tstring.group_words||"Group words into subexpressions (allowing them to be included, excluded, ranked, and so forth as a group)."},{op:"~",info:tstring.negate_word||"Negate a word’s ranking value."},{op:"*",info:tstring.wildcard_at_end||"Wildcard at the end of the word."},{op:"“”",info:tstring.defines_phrase||"Defines a phrase (as opposed to a list of individual words, the entire phrase is matched for inclusion or exclusion)."}];for(let n=0;n<t.length;n++)common.create_dom_element({element_type:"div",class_name:"op",text_content:t[n].op,parent:e}),common.create_dom_element({element_type:"div",class_name:"info",text_content:t[n].info,parent:e});return e},this.activate_autocomplete=function(e){const t=this,n=e.form_item,o=e.limit||30,r=e.table||n.table,a=e.cross_filter||!0,l=e.order||"name ASC";!function(e){var t=e.ui.autocomplete.prototype,n=t._initSource;e.extend(t,{_initSource:function(){this.options.html&&e.isArray(this.options.source)?this.source=function(t,n){var o,r,a;n((o=this.options.source,r=t.term,a=new RegExp(e.ui.autocomplete.escapeRegex(r),"i"),e.grep(o,(function(t){return a.test(e("<div>").html(t.label||t.value||t).text())}))))}:n.call(this)},_renderItem:function(t,n){for(var o=n.label,r=o.split(" | "),a=[],l=0;l<r.length;l++){var i=r[l];i.length>1&&"<i>.</i>"!==i&&a.push(i)}return o=a.join(" | "),e('<li class="ui-menu-item"></li>').data("item.autocomplete",n).append(e('<div class="ui-menu-item-wrapper"></div>')[this.options.html?"html":"text"](o)).appendTo(t)}})}(jQuery);const i={};return $(n.node_input).autocomplete({delay:150,minLength:0,html:!0,source:function(e,s){const c=e.term,_=(n.q_name,n.q_column),u={AND:[]},p=n.eq_in+c+n.eq_out;if(u.AND.push({field:n.q_column_filter||_,value:`'${p}'`,op:n.eq,group:_}),a){const e="OR",o={};o[e]=[];for(let[r,a]of Object.entries(t.form_items))if(a.id!==n.id){if(0!==a.q.length&&"*"!==a.q||a.sql_filter){const t={field:a.q_column,value:`'%${a.q}%'`,op:"LIKE",sql_filter:a.sql_filter,wrapper:a.wrapper};o[e].push(t)}if(0!==a.q_selected.length)for(let t=0;t<a.q_selected.length;t++){const n=a.q_selected[t].replace(/(')/g,"''"),r={field:a.q_column,value:!0===a.is_term?`'%"${n}"%'`:`'${n}'`,op:!0===a.is_term?"LIKE":"=",sql_filter:a.sql_filter,wrapper:a.wrapper};o[e].push(r)}}o[e].length>0&&u.AND.push(o)}if(1===u.AND.length&&c in i)return!0===SHOW_DEBUG&&console.warn("Returning values from cache:",i[c]),void s(i[c]);const m=t.parse_sql_filter(u);data_manager.request({body:{dedalo_get:"records",table:r,ar_fields:[_+" AS name"],sql_filter:m,group:_,limit:o,order:l}}).then(e=>{console.log("--\x3eautocomplete api_response:",e);const t=e.result,n=[],o=t.length;for(let e=0;e<o;e++){const o=t[e];if(!o.name)continue;const r=0===o.name.indexOf('["')?JSON.parse(o.name):[o.name];for(let e=0;e<r.length;e++){const t=r[e];n.find(e=>e.value===t)||n.push({label:t,value:t})}}const r=function(e,t){return e.map((function(e){return e.label=e.label.replace(/<br>/g," "),e.label=page.parse_legend_svg(e.label),e}))}(n);1===u.AND.length&&(i[c]=r),SHOW_DEBUG,s(r)})},select:function(e,o){return e.preventDefault(),t.add_selected_value(n,o.item.label,o.item.value),this.value="",!1},focus:function(){return!1},close:function(e,t){},change:function(e,t){},response:function(e,t){}}).on("keydown",(function(e){e.keyCode===$.ui.keyCode.ENTER&&$(this).autocomplete("close")})).focus((function(){$(this).autocomplete("search",null)})),!0},this.form_to_sql_filter=function(e){console.error("WARNING! form_to_sql_filter is DEPRECATED! Use build_filter instead!");const t=this,n=e.form_node,o=t.form_items,r=[];for(let[e,t]of Object.entries(o)){const e="AND",n={};if(n[e]=[],0!==t.q.length){const o="AND",r={};r[o]=[];const a=t.q.replace(/(')/g,"''"),l=t.eq_in+a+t.eq_out,i={field:t.q_column,value:l,op:t.eq};r[o].push(i),n[e].push(r)}if(0!==t.q_selected.length)for(let o=0;o<t.q_selected.length;o++){const r=t.q_selected[o].replace(/(')/g,"''"),a="AND",l={};l[a]=[];const i={field:t.q_column,value:!0===t.is_term?`'%"${r}"%'`:`'${r}'`,op:!0===t.is_term?"LIKE":"="};l[a].push(i),n[e].push(l)}n[e].length>0&&r.push(n)}if(!0===SHOW_DEBUG&&(console.log("self.form_items:",t.form_items),console.log("ar_query_elements:",r)),r.length<1)return console.warn("-> form_to_sql_filter empty elements selected:",r),null;const a={};a[n.querySelector('input[name="operators"]')?n.querySelector('input[name="operators"]:checked').value:"AND"]=r,!0===SHOW_DEBUG&&console.log("-> form_to_sql_filter filter:",a);return t.parse_sql_filter(a)}}function map_factory(){this.target=null,this.data=null,this.source_maps={},this.popup_builder=null,this.map=null,this.layer_control=!1,this.loaded_document=!1,this.icon_main=null,this.icon_finds=null,this.icon_uncertain=null,this.popupOptions=null,this.current_layer=null,this.current_group=null,this.option_selected=null,this.initial_map_data={lat:40.65993615913156,lon:-3.2304345278385687,zoom:5,alt:0},this.source_maps=[{name:"osm",url:"//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",default:!0},{name:"arcgis",url:"//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"}],this.icon_main=null,this.popup_options,this.map_container_div=null,this.init=function(e){SHOW_DEBUG;const t=e.source_maps||this.source_maps,n=e.popup_builder||this.build_popup_content,o=e.map_position||this.initial_map_data,r=e.map_container,a=e.legend||null,l=e.popup_options||{maxWidth:420,closeButton:!1,className:"map_popup"},i=e.marker_icon?L.icon(e.marker_icon):L.icon({iconUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/lib/leaflet/images/naranja.png",shadowUrl:page_globals.__WEB_TEMPLATE_WEB__+"/assets/lib/leaflet/images/marker-shadow.png",iconSize:[47,43],shadowSize:[41,41],iconAnchor:[10,19],shadowAnchor:[0,20],popupAnchor:[12,-20]});return this.source_maps=t,this.map_position=o,this.map_container=r,this.popup_builder=n,this.popup_options=l,this.icon_main=i,this.legend=a,this.render_base_map()},this.render_base_map=function(){const e=this;return new Promise((function(t){e.map&&(e.map.off(),e.map.remove());const n=e.map_position,o=parseFloat(n.lat),r=parseFloat(n.lon),a=parseInt(n.zoom);parseInt(n.alt);e.map=null,e.layer_control=!1,e.loaded_document=!1,e.icon_finds=null,e.icon_uncertain=null,e.popupOptions=null,e.current_layer=null,e.current_group=null,e.option_selected=null;let l=null;const i={};for(let t=0;t<e.source_maps.length;t++){const n=e.source_maps[t],o=new L.TileLayer(n.url,n.options);i[n.name]=o,0!==t&&!0!==n.default||(l=o)}const s=e.map_container_div||common.create_dom_element({element_type:"div",class_name:"",parent:e.map_container});if(e.map_container_div=s,e.map=new L.map(s,{layers:[l],center:new L.LatLng(o,r),zoom:a}),e.layer_control=L.control.layers(i).addTo(e.map),e.map.scrollWheelZoom.disable(),e.popupOptions=e.popup_options,e.legend&&"function"==typeof e.legend){const t=e.legend();e.map_container.appendChild(t)}t(e.map)}))},this.parse_data_to_map=function(e,t){const n=this;return new Promise((function(t){if(n.current_group&&n.current_group.clearLayers(),!e||e.length<1)return n.render_base_map(),t(n.map_container),!1;const o=e[0].geojson?n.group_by_place_geojson(e):n.group_by_place(e),r=function(e,t,n,o){const r=L.marker(t,{icon:n}).bindPopup(o);return r.on("mousedown",(function(t){event_manager.publish("map_selected_marker",{item:e,event:t})})),r},a=[];for(let e=o.length-1;e>=0;e--){const t=o[e],l=t.marker_icon?L.icon(t.marker_icon):n.icon_main,i=n.popup_builder(t),s=L.popup(n.popupOptions).setLatLng([t.lat,t.lon]).setContent(i);if(t.geojson)for(let e=0;e<t.geojson.length;e++){const n=t.geojson[e].layer_data,o=L.geoJSON(n,{pointToLayer:function(e,t){return L.marker(t,{icon:l})},onEachFeature:function(e,t){t.bindPopup(s)}});o.on("mousedown",(function(e){event_manager.publish("map_selected_marker",{item:t,event:e})})),a.push(o)}else{const e=r(t,[t.lat,t.lon],l,s);a.push(e)}}if(a.length>0){const e=L.markerClusterGroup({spiderfyOnMaxZoom:!0,showCoverageOnHover:!1,zoomToBoundsOnClick:!0,maxClusterRadius:30,iconCreateFunction:function(e){return L.divIcon({html:e.getChildCount(),className:"mycluster",iconSize:L.point(40,40)})}});for(let t=0;t<a.length;t++)e.addLayer(a[t]);n.map.addLayer(e)}if(a&&a.length>0){const e=new L.featureGroup(a);e&&(n.map.fitBounds(e.getBounds()),n.map.getZoom()>18&&n.map.setZoom(18))}n.map.on("popupopen",(function(e){const t=e.popup._wrapper.querySelectorAll("img");if(t)for(let e=0;e<t.length;e++)t[e].classList.contains("loaded")||t[e].image_in_dom()})),t(n.map_container)}))},this.group_by_place=function(e){const t=[],n=e.length;for(let o=0;o<n;o++){const n=e[o],r=t.find(e=>e.lat===n.lat&&e.lon===n.lon);if(r)r.group.push(n.data);else{const e={lat:n.lat,lon:n.lon,geojson:n.geojson,marker_icon:n.marker_icon,group:[n.data]};t.push(e)}}return t},this.group_by_place_geojson=function(e){const t=[],n=e.length;for(let o=0;o<n;o++){const n=e[o],r=n.geojson,a=r.length;for(let e=0;e<a;e++){const o=r[e].layer_data.features;for(let a=0;a<o.length;a++){const l=o[a].geometry.coordinates,i=l[0],s=l[1],c=t.find(e=>e.lat===i&&e.lon===s);if(c)c.group.push(n.data);else{const o={lat:i,lon:s,geojson:[r[e]],marker_icon:n.marker_icon,group:[n.data]};t.push(o)}break}}}return t},this.build_popup_content=function(e){console.log("(!) Using default build_popup_content function:",e);const t=common.create_dom_element({element_type:"div",class_name:"popup_wrapper",inner_html:"TITLE: "+e.title+" ["+e.section_id+"]"});return t},this.reset_map=function(){const e=this.initial_map_data;return this.map.setView(new L.LatLng(e.lat,e.lon),e.zoom),!0}}function list_factory(){this.data=null,this.fn_row_builder=null,this.pagination=null,this.caller,this.init=function(e){return this.data=e.data||[],this.fn_row_builder=e.fn_row_builder,this.pagination=void 0===e.pagination||null===e.pagination?{total:null,limit:10,offset:0,n_nodes:10}:e.pagination,this.caller=e.caller,this.status="initied",!0},this.render_list=function(){const e=this;return new Promise((function(t){const n=new DocumentFragment,o=e.data.length;let r;if(e.pagination){r=e.pagination,r.count=o,r.class_name="top";const t=e.render_pagination(r);t&&n.appendChild(t)}const a=common.create_dom_element({element_type:"div",class_name:"rows_container",parent:n});e.caller&&e.caller.view_mode&&"list_images"===e.caller.view_mode&&common.create_dom_element({element_type:"div",class_name:"grid-sizer",parent:a});for(let t=0;t<o;t++){const n=e.fn_row_builder(e.data[t],e.caller.view_mode);n&&a.appendChild(n)}e.pagination&&(r.class_name="bottom",n.appendChild(e.render_pagination(r))),t(n)}))},this.render_pagination=function(e){e.class_name;const t=common.create_dom_element({element_type:"div",class_name:"pagination"+(e.class_name?" "+e.class_name:"")}),n=this.paginator.get_full_paginator(e);n&&t.appendChild(n);common.create_dom_element({element_type:"div",class_name:"spacer",parent:t});return t.appendChild(this.paginator.get_totals_node(e)),t},this.paginator={_string:{to:tstring.to||"to",of:tstring.of||"of",first:tstring.first||"<<",prev:tstring.prev||"Prev",next:tstring.next||"Next",last:tstring.last||">>",showed:tstring.showed||"Showed"},get_full_paginator:function(e){const t=parseInt(e.total),n=parseInt(e.limit),o=parseInt(e.offset),r=e.n_nodes?parseInt(e.n_nodes):0,a=this.build_page_nodes(t,n,o,r);return this.build_paginator_html(a,!1)},build_page_nodes:function(e,t,n,o){!0===SHOW_DEBUG&&console.log("[paginator.build_page_nodes] : total",e,"limit:",t,"offset",n,"n_nodes:",o);const r=[];if(e<t)return r;o&&0!==o||(o=6),r.push({label:this._string.first,offset_value:0,type:"navigator",active:n>=t,id:"first"}),r.push({label:this._string.prev,offset_value:n-t>0?n-t:0,type:"navigator",active:n>=t,id:"previous"});const a=t>0?Math.ceil(e/t):0,l=t>0?Math.ceil(n/t)+1:1;let i=Math.ceil(o/2);if(l<=i&&(i=2*i-l+1),a>0)for(let e=1;e<=a;e++){const o=e-1==n/t,a=!o,s=(e-1)*t;(e>=l-i&&e<=l||e>=l-i&&e<=l+i)&&r.push({label:e,offset_value:s,type:"page",selected:o,active:a,id:e})}r.push({label:this._string.next,offset_value:n+t,type:"navigator",active:n<e-t,id:"next"}),r.push({label:this._string.last||">>",offset_value:(a-1)*t,type:"navigator",active:n<e-t,id:"last"});return SHOW_DEBUG,{total:e,limit:t,offset:n,nodes:o,n_pages:a,n_pages_group:i,current_page:l,ar_nodes:r}},build_paginator_html:function(e){const t=new DocumentFragment,n=e.ar_nodes||[],o=n.length;for(let e=0;e<o;e++){const o=n[e];let r="navigator"===o.type?o.type+" "+o.id:o.type;!0===o.selected&&(r+=" selected");const a=common.create_dom_element({element_type:"a",class_name:r+(o.active?"":" unactive"),text_content:o.label,parent:t});!0===o.active&&a.addEventListener("click",(function(){event_manager.publish("paginate",o.offset_value)}))}const r=common.create_dom_element({element_type:"div",class_name:"paginator_wrapper navigator"});return r.appendChild(t),r},get_totals_node:function(e){const t=e.total,n=(e.limit,e.offset),o=e.count,r=0==t?0:Math.ceil(1*n)||1,a=n+o,l=0===t?this._string.showed+" "+t:this._string.showed+" "+r+" "+this._string.to+" "+a+" "+this._string.of+" "+t;return common.create_dom_element({element_type:"div",class_name:"totals",text_content:l})}}}!function(e,t,n){n=n||window;var o=!1;n.addEventListener(e,(function(){o||(o=!0,requestAnimationFrame((function(){n.dispatchEvent(new CustomEvent(t)),o=!1})))}))}("resize","optimizedResize"),function(){const e=function(){};e.prototype.request=async function(e){console.log("++++ data_manager request options:",e);const t=e.url||page_globals.JSON_TRIGGER_URL,n=e.method||"POST",o=e.mode||"cors",r=e.cache||"no-cache",a=e.credentials||"same-origin",l=e.headers||{"Content-Type":"application/json"},i=e.redirect||"follow",s=e.referrer||"no-referrer",c=e.body;return c.code||(c.code=page_globals.API_WEB_USER_CODE),c.lang||(c.lang=page_globals.WEB_CURRENT_LANG_CODE),!c.db_name&&page_globals.WEB_DB&&(c.db_name=page_globals.WEB_DB),fetch(t,{method:n,mode:o,cache:r,credentials:a,headers:l,redirect:i,referrer:s,body:JSON.stringify(c)}).then((function(e){if(!e.ok)throw console.warn("-> handle_errors response:",e),Error(e.statusText);return e})).then(e=>e.json().then(e=>e)).catch(e=>(console.error("!!!!! [page data_manager.request] ERROR:",e),{result:!1,msg:e.message,error:e}))},window.data_manager=new e,window.event_manager=new function(){this.events=[],this.last_token=-1,this.subscribe=function(e,t){const n="event_"+String(++this.last_token),o={event_name:e,token:n,callback:t};return this.events.push(o),n},this.unsubscribe=function(e){return this.events.map((t,n,o)=>{t.token===e&&o.splice(n,1)})},this.publish=function(e,t={}){const n=this.events.filter(t=>t.event_name===e);return!!n&&n.map(e=>e.callback(t))},this.get_events=function(){return this.events},this.fire_event=function(e,t){var n;if(e.ownerDocument)n=e.ownerDocument;else{if(9!=e.nodeType)throw new Error("Invalid node passed to fireEvent: "+e.id);n=e}if(e.dispatchEvent){var o="";switch(t){case"click":case"mousedown":case"mouseup":o="MouseEvents";break;case"focus":case"change":case"blur":case"select":o="HTMLEvents";break;default:throw"fireEvent: Couldn't find an event class for event '"+t+"'."}var r="change"!=t;(a=n.createEvent(o)).initEvent(t,r,!0),a.synthetic=!0,e.dispatchEvent(a,!0)}else if(e.fireEvent){var a;(a=n.createEventObject()).synthetic=!0,e.fireEvent("on"+t,a)}},this.when_in_dom=function(e,t){
const n=new MutationObserver((function(o){document.contains(e)&&(n.disconnect(),t(this))}));return n.observe(document,{attributes:!1,childList:!0,characterData:!1,subtree:!0}),n}}}();
//# sourceMappingURL=app-min.js.map