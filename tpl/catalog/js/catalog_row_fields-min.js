"use strict";var catalog_row_fields={ar_rows:[],caller:null,draw_item:function(e){const t=this,n=e.term_table,_=new DocumentFragment;function l(){this.removeEventListener("load",l,!1);const e=this,t=this.hires;setTimeout((function(){e.src=t}),1600)}switch(n){case"types":if(e.children&&e.children.length>0){const n=common.create_dom_element({element_type:"div",class_name:"term_line",parent:_});t.node_factory(e,"term",n,"span",null),t.node_factory(e,"ref_type_material",n,null,null),t.node_factory(e,"ref_type_denomination",n,null,null),t.node_factory(e,"ref_type_averages_weight",n,null,null),t.node_factory(e,"ref_type_total_weight_items",n,null,null),t.node_factory(e,"ref_type_averages_diameter",n,null,null),t.node_factory(e,"ref_type_total_diameter_items",n,null,null)}else{const n=common.create_dom_element({element_type:"div",class_name:"type_container",parent:_}),r=common.create_dom_element({element_type:"div",class_name:"type_info",parent:n});t.node_factory(e,"term",r,"span",null);const a=e.parent?e.parent[0]:null,o=t.ar_rows.find(e=>e.section_id==a);o&&"types"!==o.term_table&&(t.node_factory(e,"ref_type_material",r,null,null),t.node_factory(e,"ref_type_denomination",r,null,null)),t.node_factory(e,"ref_type_averages_weight",r,null,null),t.node_factory(e,"ref_type_total_weight_items",r,null,null),t.node_factory(e,"ref_type_averages_diameter",r,null,null),t.node_factory(e,"ref_type_total_diameter_items",r,null,null);const m=common.create_dom_element({element_type:"div",class_name:"descriptions",parent:r});t.node_factory(e,"ref_type_design_obverse",m,null,null),t.node_factory(e,"ref_type_symbol_obverse",m,null,null);const s=common.create_dom_element({element_type:"div",class_name:"legend_obverse",parent:m});t.node_factory(e,"ref_type_legend_obverse",s,null,null),t.node_factory(e,"ref_type_legend_transcription_obverse",s,null,null),t.node_factory(e,"ref_type_design_reverse",m,null,null),t.node_factory(e,"ref_type_symbol_reverse",m,null,null);const c=common.create_dom_element({element_type:"div",class_name:"legend_reverse",parent:m});t.node_factory(e,"ref_type_legend_reverse",c,null,null),t.node_factory(e,"ref_type_legend_transcription_reverse",c,null,null),t.node_factory(e,"ref_type_equivalents",n,null,null);const i=e.ref_type_averages_diameter?Math.round(e.ref_type_averages_diameter,0):15,d=common.create_dom_element({element_type:"div",class_name:"coins_images_container",parent:n}),p=common.create_dom_element({element_type:"div",class_name:"coins_images",parent:d});p.style.width=4*i+"mm";const y=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.ref_coins_image_obverse,parent:p}),f=common.create_dom_element({element_type:"img",class_name:"image_obverse",src:e.ref_coins_image_obverse_thumb,parent:y});f.style.width=2*i+"mm",f.hires=e.ref_coins_image_obverse,f.loading="lazy",f.addEventListener("load",l,!1);const u=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.ref_coins_image_reverse,parent:p}),g=common.create_dom_element({element_type:"img",class_name:"image_reverse",src:e.ref_coins_image_reverse_thumb,parent:u});g.style.width=2*i+"mm",g.hires=e.ref_coins_image_reverse,g.loading="lazy",g.addEventListener("load",l,!1),window.matchMedia&&window.matchMedia("print").addListener((function(e){e.matches&&(p.style.width=2*i+"mm",f.style.width=1*i+"mm",g.style.width=1*i+"mm"),e.matches||(p.style.width=4*i+"mm",f.style.width=2*i+"mm",g.style.width=2*i+"mm")}));const v=common.create_dom_element({element_type:"div",class_name:"collection_auction",parent:n});t.node_factory(e,"ref_coins_collection",v,null,null),t.node_factory(e,"ref_coins_auction",v,null,null)}break;case"mints":if(common.create_dom_element({element_type:"div",class_name:"mint",text_content:e.term,parent:_}),e.term_section_id){common.create_dom_element({element_type:"a",class_name:"link link_mint",href:page_globals.__WEB_ROOT_WEB__+"/mint/"+e.term_section_id,target:"_blank",parent:_})}break;default:common.create_dom_element({element_type:"div",class_name:n+"_value",text_content:e.term,parent:_})}const r=common.create_dom_element({element_type:"div",class_name:"row_node "+n});return r.appendChild(_),r},node_factory:function(e,t,n,_,l){if(e[t]){const r=_||"span",a=l||t;let o;switch(t){case"ref_type_total_weight_items":case"ref_type_total_diameter_items":o="("+e[t]+")";break;case"ref_type_averages_weight":o=e[t].toFixed(2).replace(/\.?0+$/,"").replace(".",",")+" g";break;case"ref_type_averages_diameter":o=e[t].toFixed(2).replace(/\.?0+$/,"").replace(".",",")+" mm";break;case"ref_type_equivalents":o=e[t].replace(/ \| /g," "),o=o.replace(/<br>/g," | ");break;case"term":if(e.term_section_id&&!e.children){const n=e[t].split(", "),_=n[0],l=void 0===n[1]?"":function(){const e=[];for(let t=1;t<n.length;t++)e.push(n[t]);return'<span class="keyword">, '+e.join(", ").trim()+"</span>"}(),r=e.ref_mint_number?e.ref_mint_number+"/":"";o=common.create_dom_element({element_type:"a",class_name:"a_term",href:page_globals.__WEB_ROOT_WEB__+"/type/"+e.term_section_id,target:"_blank",inner_html:"MIB "+r+_+l}).outerHTML}else o="MIB "+e[t];break;default:o=e[t]}return common.create_dom_element({element_type:r,class_name:a,inner_html:o,parent:n}).title=e.section_id,!0}return!1}};