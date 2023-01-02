var web_ts_term=new function(){this.url_trigger=page_globals.__WEB_TEMPLATE_WEB__+"/lib/web_ts_term/trigger.web_ts_term.php",this.ar_childrens_loaded={},this.ar_index_loaded={},$(document).ready((function(){var e=JSON.parse(localStorage.getItem("ar_loaded_web_ts_term"));for(var t in"undefined"!=typeof web_ts_term_to_open&&(e=web_ts_term_to_open),e)if("loaded"==e[t]){var n=document.querySelector('div.icon_show_childrens[data-term_id="'+t+'"]');n&&web_ts_term.toggle_childrens(n,!1)}web_ts_term.highlight_terms()})),this.toggle_childrens=function(e,t){var n=void 0!==window.tree_mode&&window.tree_mode,a=e.dataset.term_id,_={mode:"toggle_childrens",term_id:e.dataset.term_id,ar_childrens:JSON.parse(e.dataset.ar_childrens),tree_mode:n};!1!==t&&(t=!0),e.classList.toggle("arrow_dow");var r=document.getElementById("childrens_wrapper_"+a);return r?"none"==r.style.display&&"closed"==web_ts_term.ar_childrens_loaded[a]?(r.style.display="block",web_ts_term.ar_childrens_loaded[a]="loaded",localStorage.setItem("ar_loaded_web_ts_term",JSON.stringify(web_ts_term.ar_childrens_loaded)),!1):"block"===r.style.display?(r.style.display="none",web_ts_term.ar_childrens_loaded[a]="closed",localStorage.setItem("ar_loaded_web_ts_term",JSON.stringify(web_ts_term.ar_childrens_loaded)),!1):(r.classList.add("loading"),r.style.display="block",void $.ajax({url:this.url_trigger,data:_,type:"POST",async:t}).done((function(e){/Error/.test(e)?(r.innerHTML="[toggle_childrens] Request failed: \n"+e,!0===SHOW_DEBUG&&console.log(e)):(r.innerHTML=e,web_ts_term.ar_childrens_loaded[a]="loaded",localStorage.setItem("ar_loaded_web_ts_term",JSON.stringify(web_ts_term.ar_childrens_loaded)),tpl_common.activate_tooltips())})).fail((function(e,t){console.log("Error: "+e.statusText+" ("+t+")"),r.innerHTML="Sorry. Failed load"})).always((function(){r.classList.remove("loading")}))):alert("Error")},this.highlight_terms=function(){var e=window.ar_highlight?JSON.parse(window.ar_highlight):[],t=e.length;if(t>0)for(var n=t-1;n>=0;n--){var a=e[n];document.getElementById("web_ts_term_"+a)&&document.getElementById("web_ts_term_"+a).classList.add("highlight_term"),document.getElementById("button_toggle_indexation_"+a)&&web_ts_term.toggle_indexation(document.getElementById("button_toggle_indexation_"+a))}},this.toggle_indexation=function(e){const t=e.dataset.term_id,n={mode:"toggle_indexation",term_id:t,ar_legends:JSON.parse(e.dataset.ar_legends),ar_cmk:JSON.parse(e.dataset.ar_cmk)};console.log(n);var a=document.getElementById("index_wrapper_"+t);if(a.classList.toggle("hidden"),a.classList.contains("hidden"))return a.parentNode.classList.remove("open"),!1;a.classList.add("loading"),a.parentNode.classList.add("open"),$.ajax({url:this.url_trigger,data:n,type:"POST"}).done((function(e){const t=JSON.parse(e);if(!1===t.result)return;for(;a.hasChildNodes();)a.removeChild(a.lastChild);const n=t.result.find((e=>"type"===e.id)),_=t.result.find((e=>"coins"===e.id)),r=n?n.result:[],o=r.length;for(var s=0;s<o;s++){const e=r[s],t=[],n=page_globals.OWN_CATALOG_ACRONYM+" "+e.section_id+"/"+e.number;t.push(n),e.denomination&&t.push(e.denomination),e.material&&t.push(e.material);const _=[];if(e.averages_weight&&e.averages_weight.length>0){const t=e.total_weight_items?e.averages_weight+" g ("+e.total_weight_items+")":e.averages_weight+" g";_.push(t)}if(e.averages_diameter&&e.averages_diameter.length>0){const t=e.total_diameter_items?e.averages_diameter+" mm ("+e.total_diameter_items+")":e.averages_diameter+" mm"+_.push(t)}const o=_.join("; ");t.push(o);const i=t.join(" | "),m=common.create_dom_element({element_type:"span",class_name:"type_wrapper",parent:a});m.addEventListener("mouseup",(function(){window.open("./type/"+e.section_id,"_blank")}));common.create_dom_element({element_type:"div",class_name:"value_label type_mint",inner_html:e.mint,parent:m}),common.create_dom_element({element_type:"div",class_name:"value_label type",inner_html:i,parent:m});const l=common.create_dom_element({element_type:"span",class_name:"img_wrapper",parent:m});common.create_dom_element({element_type:"img",class_name:"image image_obverse",src:page.remote_image(e.ref_coins_image_obverse),parent:l}),common.create_dom_element({element_type:"img",class_name:"image image_reverse",src:page.remote_image(e.ref_coins_image_reverse),parent:l})}const i=_?_.result:[],m=i.length;for(s=0;s<m;s++){const e=i[s],t=common.create_dom_element({element_type:"span",class_name:"type_wrapper",parent:a});t.addEventListener("mouseup",(function(){window.open("./coin/"+e.section_id,"_blank")}));const n=common.create_dom_element({element_type:"span",class_name:"img_wrapper",parent:t}),_=(common.create_dom_element({element_type:"img",class_name:"image image_obverse",src:page.remote_image(e.image_obverse),parent:n}),common.create_dom_element({element_type:"img",class_name:"image image_reverse",src:page.remote_image(e.image_reverse),parent:n}),common.create_dom_element({element_type:"div",class_name:"value_label type_collection",inner_html:e.collection,parent:t}),common.create_dom_element({element_type:"div",class_name:"info_line inline"}));common.create_dom_element({element_type:"span",class_name:name,text_content:e.ref_auction,parent:_});const r=(e.ref_auction_date?e.ref_auction_date.split(" "):[""])[0].split("-").reverse().join("-");r&&common.create_dom_element({element_type:"span",class_name:name,text_content:" | "+r,parent:_}),e.ref_auction_number&&common.create_dom_element({element_type:"span",class_name:name,text_content:", "+(tstring.n||"nº")+" "+e.ref_auction_number,parent:_});const o=[];e.weight&&e.weight.length>0&&o.push(e.weight+" g"),e.dies&&e.dies.length>0&&o.push(e.dies+" h"),e.diameter&&e.diameter.length>0&&o.push(e.diameter+" mm");const m=o.join("; ");common.create_dom_element({element_type:"span",class_name:name,text_content:" ("+m+")",parent:_}),t.appendChild(_)}tpl_common.activate_tooltips()})).fail((function(e,t){console.log("Error: "+e.statusText+" ("+t+")"),a.innerHTML="Sorry. Failed load"})).always((function(){a.classList.remove("loading")}))},this.reset_tree=function(){localStorage.removeItem("ar_loaded_web_ts_term")}};