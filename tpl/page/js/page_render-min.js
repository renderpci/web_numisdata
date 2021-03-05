"use strict";page.render_map_legend=function(){const e=common.create_dom_element({element_type:"div",class_name:"map_legend"});return common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.mint+'<img src="'+page.maps_config.markers.mint.iconUrl+'"/>',parent:e}),common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.hoard+'<img src="'+page.maps_config.markers.hoard.iconUrl+'"/>',parent:e}),common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.findspot+'<img src="'+page.maps_config.markers.findspot.iconUrl+'"/>',parent:e}),e},page.render_export_data_buttons=function(){let e,t,n;function o(){const o={info:"WARNING! This is a draft version data. Please do not use it in production",source_org:"MIB (Moneda Ibérica - Iberian Coin)",source_url:"https://mib.numisdata.org",lang:page_globals.WEB_CURRENT_LANG_CODE,date:common.get_today_date()};return new Promise((function(n){if(!e)return t?void setTimeout((function(){n(t)}),1e3):(console.warn("Invalid result or request_body:",e),void n(!1));e.limit=0,e.resolve_portals_custom=null,data_manager.request({body:e}).then((function(e){n(e.result)}))})).then((function(e){return o.data=n&&"function"==typeof n?n(e):e,o}))}event_manager.subscribe("data_request_done",(function(o){e=o.request_body,t=o.result,n=o.export_data_parser||null}));const a=new DocumentFragment,r=common.create_dom_element({element_type:"div",class_name:"export_container",parent:a});common.create_dom_element({element_type:"input",type:"button",value:tstring.export_json||"Export JSON",class_name:"btn primary button_download json",parent:r}).addEventListener("click",(function(){const e=this;e.classList.add("unactive");const t=common.create_dom_element({element_type:"div",class_name:"spinner small",parent:r});o().then((function(n){const o=new Blob([JSON.stringify(n,null,2)],{type:"application/json",name:"mib_export_data.json"}),a=URL.createObjectURL(o),r=common.create_dom_element({element_type:"a",href:a,download:"mib_export_data.json"});r.click(),r.remove(),t.remove(),e.classList.remove("unactive")}))}));const m=common.create_dom_element({element_type:"div",class_name:"export_container",parent:a});return common.create_dom_element({element_type:"input",type:"button",value:tstring.export_csv||"Export CSV",class_name:"btn primary button_download csv",parent:m}).addEventListener("click",(function(){const e=this;e.classList.add("unactive");const t=common.create_dom_element({element_type:"div",class_name:"spinner small",parent:m});o().then((function(n){const o=page.convert_json_to_csv(n.data),a=new Blob([o],{type:"text/csv",name:"mib_export_data.csv"}),r=URL.createObjectURL(a),m=common.create_dom_element({element_type:"a",href:r,download:"mib_export_data.csv"});m.click(),m.remove(),t.remove(),e.classList.remove("unactive")}))})),a},page.render_legend=function(e){const t=e.value||"",n=e.style||"median";return common.create_dom_element({element_type:"div",class_name:"legend_box "+n,inner_html:t.trim()})};