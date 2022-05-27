"use strict";page.render_map_legend=function(){const e=common.create_dom_element({element_type:"div",class_name:"map_legend"});return common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.mint+'<img src="'+page.maps_config.markers.mint.iconUrl+'"/>',parent:e}),common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.hoard+'<img src="'+page.maps_config.markers.hoard.iconUrl+'"/>',parent:e}),common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.findspot+'<img src="'+page.maps_config.markers.findspot.iconUrl+'"/>',parent:e}),e},page.render_export_data_buttons=function(){let e,t,n,o,a;function r(){const o={info:"WARNING! This is a draft version data. Please do not use it in production",source_org:"MIB (Moneda Ibérica - Iberian Coin)",source_url:"https://monedaiberica.org",lang:page_globals.WEB_CURRENT_LANG_CODE,date:common.get_today_date()};return new Promise((function(n){if(!e)return t?void setTimeout((function(){n(t)}),1e3):(console.warn("Invalid result or request_body:",e),void n(!1));e.limit=0,e.resolve_portals_custom=null,data_manager.request({body:e}).then((function(e){n(e.result)}))})).then((function(e){return o.data=n&&"function"==typeof n?n(e):e,o}))}event_manager.subscribe("data_request_done",(function(a){e=a.request_body,t=a.result,n=a.export_data_parser||null,o=a.filter}));const m=new DocumentFragment;if("catalog"===WEB_AREA){const e=common.create_dom_element({element_type:"div",class_name:"export_container",parent:m});common.create_dom_element({element_type:"input",type:"button",value:tstring.share_search||"Share search",class_name:"btn primary button_download share_search",parent:e}).addEventListener("click",(function(){const e=psqo_factory.build_safe_psqo(o),t=common.create_dom_element({element_type:"div",class_name:"shared_wrapper",parent:document.body});t.addEventListener("click",(function(e){t.remove()}));const n=common.create_dom_element({element_type:"div",class_name:"shared_container",parent:t});n.addEventListener("click",(function(e){e.stopPropagation()}));common.create_dom_element({element_type:"div",class_name:"shared_json",text_content:JSON.stringify(e,null,2),parent:n});const r=psqo_factory.encode_psqo(e);a=window.location.protocol+"//"+window.location.host+page_globals.__WEB_ROOT_WEB__+"/"+WEB_AREA+"/?psqo="+r;const m=common.create_dom_element({element_type:"div",class_name:"shared_uri_encoded",parent:n});common.create_dom_element({element_type:"span",text_content:a,title:a.length,parent:m}),common.create_dom_element({element_type:"a",href:a,inner_html:tstring.search||"Search",target:"_blank",parent:m})}))}const c=common.create_dom_element({element_type:"div",class_name:"export_container",parent:m});common.create_dom_element({element_type:"input",type:"button",value:tstring.export_json||"Export JSON",class_name:"btn primary button_download json",parent:c}).addEventListener("click",(function(){const e=this;e.classList.add("unactive");const t=common.create_dom_element({element_type:"div",class_name:"spinner small",parent:c});r().then((function(n){const o="mib_export_data.json",a=new Blob([JSON.stringify(n,null,2)],{type:"application/json",name:o}),r=URL.createObjectURL(a),m=common.create_dom_element({element_type:"a",href:r,download:o});m.click(),m.remove(),t.remove(),e.classList.remove("unactive")}))}));const l=common.create_dom_element({element_type:"div",class_name:"export_container",parent:m});return common.create_dom_element({element_type:"input",type:"button",value:tstring.export_csv||"Export CSV",class_name:"btn primary button_download csv",parent:l}).addEventListener("click",(function(){const e=this;e.classList.add("unactive");const t=common.create_dom_element({element_type:"div",class_name:"spinner small",parent:l});r().then((function(n){const o="mib_export_data.csv",a=page.convert_json_to_csv(n.data),r=new Blob([a],{type:"text/csv",name:o}),m=URL.createObjectURL(r),c=common.create_dom_element({element_type:"a",href:m,download:o});c.click(),c.remove(),t.remove(),e.classList.remove("unactive")}))})),m},page.create_suggestions_button=function(){let e="";const t=new DocumentFragment,n=common.create_dom_element({element_type:"div",class_name:"form_button_container",parent:t});common.create_dom_element({element_type:"input",type:"button",value:tstring.suggest_error||"Suggestions / errors",class_name:"btn primary button_contact",parent:n}),event_manager.subscribe("data_request_done",(function(t){const n=t.filter;if(null!=n){const t=psqo_factory.build_safe_psqo(n),o=psqo_factory.encode_psqo(t);e=window.location.protocol+"//"+window.location.host+page_globals.__WEB_ROOT_WEB__+"/"+WEB_AREA+"/?psqo="+o}}));const o=function(){const t=tstring.contact_form||"Contact form",n=tstring.submit||"Submit",o=tstring.cancel||"Cancel",a=(tstring.name||"Name")+":",r=(tstring.email||"Email")+":",m=(tstring.message||"Message")+":",c=common.create_dom_element({element_type:"div",id:"popup-container"}),l=common.create_dom_element({element_type:"div",class_name:"form_container",parent:c});common.create_dom_element({element_type:"h2",class_name:"form-title",text_content:t,parent:l}),common.create_dom_element({element_type:"h3",class_name:"form-title",text_content:tstring.suggest_error||"Suggestions / errors",parent:l});let s=document.createRange().createContextualFragment('<form id="contact-form"></form>');const i=document.createRange().createContextualFragment('<label for="fname">'+a+'</label><input type="text" id="fname" name="fname" value="" required>'),_=document.createRange().createContextualFragment('<label for="fmail">'+r+'</label><input type="email" id="fmail" name="fmail" value="" required>'),d=document.createRange().createContextualFragment('<label for="fmessage">'+m+'</label><textarea id="fmessage" name="message" required></textarea>'),p=document.createRange().createContextualFragment('<input class="send-button" type="submit" value="'+n+'">'),u=document.createRange().createContextualFragment('<input class="cancel-button" type="button" value="'+o+'">'),g=document.createRange().createContextualFragment('<p id="error-msn"></p>');return s.firstElementChild.addEventListener("submit",(function(t){t.preventDefault(),page.handleForm(e)})),s.firstElementChild.appendChild(i),s.firstElementChild.appendChild(_),s.firstElementChild.appendChild(d),s.firstElementChild.appendChild(g),s.firstElementChild.appendChild(p),s.firstElementChild.appendChild(u),l.appendChild(s),c}();return n.addEventListener("click",(function(){document.querySelector("body").appendChild(o),document.querySelector(".cancel-button").addEventListener("click",page.removeForm)})),t},page.removeForm=function(){document.querySelector(".cancel-button").removeEventListener("click",page.removeForm),document.querySelector("#popup-container").remove()},page.handleForm=function(e){document.querySelector("#error-msn").textContent="";const t=document.querySelector("#contact-form"),n=(new Date).toUTCString(),o=t.querySelector("#fname").value,a=t.querySelector("#fmail").value,r=t.querySelector("#fmessage").value;let m=window.location.href;null!=e&&e.length>0&&(m=e);const c={mail:{subject:`${o} '${a}' MIB [${n}]`,message:r},data:{name:o,email:a,message:r,lang:page_globals.WEB_CURRENT_LANG_CODE,web_url:m,date:n}};return new Promise((function(e){data_manager.request({url:__WEB_TEMPLATE_WEB__+"/assets/lib/sendmail/send.php",body:c}).then((e=>{console.log("--- sendmail api_response:",e),e.result?(alert("Mensaje enviado correctamente, gracias."),t.reset(),page.removeForm()):document.querySelector("#error-msn").textContent="Ha ocurrido un error. Por favor, prueba más tarde."}))}))},page.render_legend=function(e){const t=e.value||"",n=e.style||"median";return common.create_dom_element({element_type:"div",class_name:"legend_box "+n,inner_html:t.trim()})},page.render_type_label=function(e){let t;const n=e.ref_mint_number?e.ref_mint_number+"/":"";if(e.term_section_id&&!e.children){const o=e.term.split(", "),a=o[0],r=void 0===o[1]?"":function(){const e=[];for(let t=1;t<o.length;t++)e.push(o[t]);return'<span class="keyword">, '+e.join(", ").trim()+"</span>"}(),m=e.term_section_id&&e.term_section_id.section_id?e.term_section_id.section_id:e.term_section_id;t=common.create_dom_element({element_type:"a",class_name:"a_term",href:page_globals.__WEB_ROOT_WEB__+"/type/"+m,target:"_blank",title:"MIB "+n+a+o.join(", ").trim(),inner_html:"MIB "+n+a+r}).outerHTML}else t="MIB "+n+e.term;return t},page.render_weight_value=function(e){return e.ref_type_averages_weight.toFixed(2).replace(/\.?0+$/,"").replace(".",",")+" g"},page.render_diameter_value=function(e){return e.ref_type_averages_diameter.toFixed(2).replace(/\.?0+$/,"").replace(".",",")+" mm"};