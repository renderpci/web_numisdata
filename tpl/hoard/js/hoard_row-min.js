"use strict";var hoard_row={caller:null,draw_hoard:function(e){const n=new DocumentFragment;if(!e)return console.warn("Warning! draw_row row no found in options"),n;const t=common.create_dom_element({element_type:"div",parent:n});if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:e.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata6&id="+e.section_id,parent:t}).setAttribute("target","_blank")}if(e.name&&e.name.length>0){const n=common.create_dom_element({element_type:"div",class_name:"line-tittle-wrap",parent:t});if(common.create_dom_element({element_type:"div",class_name:"line-tittle golden-color",text_content:e.name,parent:n}),e.place&&e.place.length>0){const t="| "+e.place;common.create_dom_element({element_type:"div",class_name:"info_value",text_content:t,parent:n})}}if(e.coins&&e.coins.length>0){const t=e.coins.length;common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:(tstring.total_coins||"Total coins")+": "+t,parent:n})}if(e.public_info&&common.create_dom_element({element_type:"div",class_name:"info_text_block",inner_html:e.public_info,parent:n}),e.bibliography_data&&e.bibliography_data.length>0){const t=common.create_dom_element({element_type:"div",class_name:"info_line separator",parent:n});common.create_dom_element({element_type:"label",class_name:"big_label",text_content:tstring.bibliographic_references||"Bibliographic references",parent:t});const o=common.create_dom_element({element_type:"div",class_name:"info_text_block",parent:n}),a=e.bibliography_data,l=a.length;for(let e=0;e<l;e++){const n=biblio_row_fields.render_row_bibliography(a[e]);common.create_dom_element({element_type:"div",class_name:"bibliographic_reference",parent:o}).appendChild(n)}page.create_expandable_block(o,n)}return e.link&&common.create_dom_element({element_type:"a",class_name:"icon_link info_value",inner_html:e.link,href:e.link,target:"_blank",parent:n}),n}};
//# sourceMappingURL=hoard_row-min.js.map