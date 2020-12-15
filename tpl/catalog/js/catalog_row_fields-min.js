"use strict";var catalog_row_fields={ar_rows:[],caller:null,draw_item:function(e){const t=this,n=e.term_table,_=new DocumentFragment;function a(e){this.removeEventListener("load",a,!1);const t=this,n=this.hires;setTimeout((function(){t.src=n}),1600)}switch(n){case"types":if(e.children){const n=common.create_dom_element({element_type:"div",class_name:"term_line",parent:_});t.node_factory(e,"term",n,"span",null),t.node_factory(e,"ref_type_material",n,null,null),t.node_factory(e,"ref_type_denomination",n,null,null)}else{const n=common.create_dom_element({element_type:"div",class_name:"type_container",parent:_}),l=common.create_dom_element({element_type:"div",class_name:"type_info",parent:n});t.node_factory(e,"term",l,"span",null);const r=e.parent?JSON.parse(e.parent)[0]:null,m=t.ar_rows.find(e=>e.section_id===r);m&&"types"!==m.term_table&&(t.node_factory(e,"ref_type_material",l,null,null),t.node_factory(e,"ref_type_denomination",l,null,null)),t.node_factory(e,"ref_type_averages_weight",l,null,null),t.node_factory(e,"ref_type_total_weight_items",l,null,null),t.node_factory(e,"ref_type_averages_diameter",l,null,null),t.node_factory(e,"ref_type_total_diameter_items",l,null,null);const o=common.create_dom_element({element_type:"div",class_name:"descriptions",parent:l});t.node_factory(e,"ref_type_design_obverse",o,null,null),t.node_factory(e,"ref_type_symbol_obverse",o,null,null);const s=common.create_dom_element({element_type:"div",class_name:"legend_obverse",parent:o});t.node_factory(e,"ref_type_legend_obverse",s,null,null),t.node_factory(e,"ref_type_legend_transcription_obverse",s,null,null),t.node_factory(e,"ref_type_design_reverse",o,null,null),t.node_factory(e,"ref_type_symbol_reverse",o,null,null);const c=common.create_dom_element({element_type:"div",class_name:"legend_reverse",parent:o});t.node_factory(e,"ref_type_legend_reverse",c,null,null),t.node_factory(e,"ref_type_legend_transcription_reverse",c,null,null),t.node_factory(e,"ref_type_equivalents",n,null,null);const i=null!==e.ref_type_averages_diameter?parseFloat(e.ref_type_averages_diameter.replace(",",".")):15,d=common.create_dom_element({element_type:"div",class_name:"coins_images_container",parent:n}),y=common.create_dom_element({element_type:"div",class_name:"coins_images",parent:d});y.style.width=4*i+"mm";const p=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.ref_coins_image_obverse,parent:y}),f=common.create_dom_element({element_type:"img",class_name:"image_obverse",src:e.ref_coins_image_obverse_thumb,parent:p});f.style.width=2*i+"mm",f.hires=e.ref_coins_image_obverse,f.loading="lazy",f.addEventListener("load",a,!1);const u=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.ref_coins_image_reverse,parent:y}),g=common.create_dom_element({element_type:"img",class_name:"image_reverse",src:e.ref_coins_image_reverse_thumb,parent:u});g.style.width=2*i+"mm",g.hires=e.ref_coins_image_reverse,g.loading="lazy",g.addEventListener("load",a,!1),window.matchMedia&&window.matchMedia("print").addListener((function(e){e.matches&&(y.style.width=2*i+"mm",f.style.width=1*i+"mm",g.style.width=1*i+"mm"),e.matches||(y.style.width=4*i+"mm",f.style.width=2*i+"mm",g.style.width=2*i+"mm")}));const v=common.create_dom_element({element_type:"div",class_name:"collection_auction",parent:n});t.node_factory(e,"ref_coins_collection",v,null,null),t.node_factory(e,"ref_coins_auction",v,null,null)}break;case"mints":if(common.create_dom_element({element_type:"div",class_name:"mint",text_content:e.term,parent:_}),e.term_section_id){common.create_dom_element({element_type:"a",class_name:"link link_mint",href:page_globals.__WEB_ROOT_WEB__+"/mint/"+e.term_section_id,target:"_blank",parent:_})}break;default:common.create_dom_element({element_type:"div",class_name:n,text_content:e.term,parent:_})}const l=common.create_dom_element({element_type:"div",class_name:"row_node "+n});return l.appendChild(_),l},node_factory:function(e,t,n,_,a){if(e[t]&&e[t].length>0){const l=_||"span",r=a||t;let m;switch(t){case"ref_type_total_weight_items":case"ref_type_total_diameter_items":m="("+e[t]+")";break;case"ref_type_averages_weight":m=e[t]+" g";break;case"ref_type_averages_diameter":m=e[t]+" mm";break;case"ref_type_equivalents":m=e[t].replace(/<br>/g," - ");break;case"term":if(e.term_section_id&&!e.children){m=common.create_dom_element({element_type:"a",class_name:"a_term",href:page_globals.__WEB_ROOT_WEB__+"/type/"+e.term_section_id,target:"_blank",inner_html:"MIB "+e[t]}).outerHTML}else m=e[t];break;default:m=e[t]}common.create_dom_element({element_type:l,class_name:r,inner_html:m,parent:n});return!0}return!1}};