"use strict";var coins_row_fields={ar_rows:[],caller:null,draw_item:function(e){const a=new DocumentFragment,r=common.create_dom_element({element_type:"div",class_name:"wrapper",parent:a}),m=common.create_dom_element({element_type:"img",class_name:"image",src:e.image_obverse_thumb,loading:"lazy",parent:r});m.hires=e.image_obverse,m.addEventListener("load",page.load_hires);const n=common.create_dom_element({element_type:"img",class_name:"image",src:e.image_reverse_thumb,loading:"lazy",parent:r});return n.hires=e.image_reverse,n.addEventListener("load",page.load_hires),a}};