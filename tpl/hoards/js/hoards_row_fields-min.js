"use strict";var hoards_row_fields={ar_rows:[],caller:null,draw_item:function(e){const n=new DocumentFragment,t=common.create_dom_element({element_type:"div",class_name:"row_wrapper",parent:n});if(null!==e.name&&e.name.length>0){const n=common.create_dom_element({element_type:"div",class_name:"title_wrap",parent:t}),a=page_globals.__WEB_ROOT_WEB__+"/type/"+e.section_id,m='<a class="icon_link" href="'+a+'"></a> ';common.create_dom_element({element_type:"a",href:a,inner_html:e.name+m,class_name:"name",target:"_blank",parent:n});const _=e.place?" | "+e.place:"";common.create_dom_element({element_type:"span",inner_html:_,class_name:"label",parent:n});const l=common.create_dom_element({element_type:"div",class_name:"info_container",parent:t}),r=(common.create_dom_element({element_type:"div",class_name:"map_wrapper",parent:l}),common.create_dom_element({element_type:"div",class_name:"info_text_wrap",parent:l})),o=e.public_info||"";common.create_dom_element({element_type:"span",inner_html:o,class_name:"",parent:r});const c=e.link||"";common.create_dom_element({element_type:"a",href:c,inner_html:c,class_name:"",target:"_blank",parent:r})}return n}};