"use strict";var research={container:null,swagger_ui_container:null,set_up:function(e){SHOW_DEBUG;const n=this,t=e.row,r=e.main_container,a=e.swagger_ui_container,i=e.source_file_url,o=common.create_dom_element({element_type:"div",class_name:"spinner",parent:r}),l=page.parse_ts_web(t)[0];return n.render_row(l).then((function(e){r.appendChild(e),event_manager.publish("template_render_end",{item:r}),n.render_api_docu_ui({source_file_url:i}),o.remove(),a.classList.remove("hide")})),!0},render_api_docu_ui:function(e){const n=e.source_file_url,t=SwaggerUIBundle({url:n,dom_id:"#swagger-ui",presets:[SwaggerUIBundle.presets.apis,SwaggerUIStandalonePreset],plugins:[SwaggerUIBundle.plugins.DownloadUrl],layout:"StandaloneLayout"});return window.ui=t,t},render_row:function(e){return new Promise((function(n){const t=new DocumentFragment,r=e.titulo,a=e.entradilla,i=e.cuerpo;if(common.create_dom_element({element_type:"h1",class_name:"title",inner_html:r,parent:t}),a&&a.length>0&&common.create_dom_element({element_type:"p",class_name:"abstract",inner_html:a,parent:t}),e.identify_image&&e.identify_image.length>0){const n=e.identify_image;common.create_dom_element({element_type:"img",class_name:"identify_image",src:n,parent:t})}common.create_dom_element({element_type:"input",type:"button",class_name:"entrada_dedalo btn btn-light btn-block primary",value:tstring.entry_to_catalog||"Entry to the cataloging system",parent:t}).addEventListener("click",(function(){window.open("/dedalo/","Dédalo",[]).focus()})),i&&i.length>0&&(common.create_dom_element({element_type:"section",class_name:"content",inner_html:i,parent:t}),hljs.initHighlightingOnLoad()),n(t)}))}};
//# sourceMappingURL=research-min.js.map