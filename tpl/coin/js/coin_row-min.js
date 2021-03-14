"use strict";var coin_row={caller:null,draw_coin:function(e){!0===SHOW_DEBUG&&console.log("-- draw_coin row:",e);const t=new DocumentFragment;if(!e)return t;if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:e.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata4&id="+e.section_id,parent:t}).setAttribute("target","_blank")}const n=common.create_dom_element({element_type:"div",class_name:"identify_images_wrapper gallery",parent:t});if(e.image_obverse&&e.image_obverse.length>0){const t=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:n});common.create_dom_element({element_type:"img",class_name:"image image_obverse",src:e.image_obverse,parent:t})}if(e.image_reverse&&e.image_reverse.length>0){const t=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:n});common.create_dom_element({element_type:"img",class_name:"image image_reverse",src:e.image_reverse,parent:t})}const m=common.create_dom_element({element_type:"div",class_name:"block_wrapper id_block",parent:t});if(e.section_id&&e.section_id.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group id",parent:m});common.create_dom_element({element_type:"label",text_content:"ID ",parent:t}),common.create_dom_element({element_type:"span",class_name:"value strong",inner_html:e.section_id,parent:t})}const _=common.create_dom_element({element_type:"div",class_name:"block_wrapper first_block",parent:t});if(e.collection&&e.collection.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group collection",parent:_});common.create_dom_element({element_type:"label",text_content:tstring.collection||"Collection",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.collection,parent:t})}if(e.former_collection&&e.former_collection.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group former_collection",parent:_});common.create_dom_element({element_type:"label",text_content:tstring.former_collection||"Former collection",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.former_collection,parent:t})}if(e.number&&e.number.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group number",parent:_});common.create_dom_element({element_type:"label",text_content:tstring.number||"Number",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.number,parent:t})}const o=common.create_dom_element({element_type:"div",class_name:"block_wrapper first_b_block",parent:t});if(e.ref_auction&&e.ref_auction.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group ref_auction",parent:o});common.create_dom_element({element_type:"label",text_content:tstring.ref_auction||"Auction",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.ref_auction,parent:t})}if(e.ref_auction_number&&e.ref_auction_number.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group ref_auction_number",parent:o});common.create_dom_element({element_type:"label",text_content:tstring.ref_auction_number||"Number",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.ref_auction_number,parent:t})}const a=common.create_dom_element({element_type:"div",class_name:"block_wrapper second_block",parent:t});if(e.type&&e.type.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group type",parent:a});common.create_dom_element({element_type:"label",text_content:tstring.type||"Type",parent:t}),console.log("row.type_data[0]:",e.type_data[0]);const n=void 0!==e.type_data[0]?e.type_data[0].mint:null,m=void 0!==e.type_data[0]?e.type_data[0].mint_number:null,_=void 0!==e.type_data[0]?e.type_data[0].number:null,o=common.clean_gaps(n+" "+m+" / "+_," | "," | ");common.create_dom_element({element_type:"span",class_name:"value",inner_html:o,parent:t})}const l=common.create_dom_element({element_type:"div",class_name:"block_wrapper third_block block",parent:t}),r=void 0!==e.type_data[0]?e.type_data[0].design_obverse:null;if(r&&r.length>0){const e=common.create_dom_element({element_type:"div",class_name:"group design_obverse",parent:l});common.create_dom_element({element_type:"label",text_content:tstring.design_obverse||"design_obverse",parent:e});const t=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_obverse&label="+r+"&value="+r;common.create_dom_element({element_type:"a",class_name:"value underline-text",inner_html:r,href:t,parent:e})}const c=void 0!==e.type_data[0]?e.type_data[0].design_reverse:null;if(c&&c.length>0){const e=common.create_dom_element({element_type:"div",class_name:"group design_reverse",parent:l});common.create_dom_element({element_type:"label",text_content:tstring.design_reverse||"design_reverse",parent:e});const t=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_reverse&label="+c+"&value="+c;common.create_dom_element({element_type:"a",class_name:"value underline-text",inner_html:c,href:t,parent:e})}const s=common.create_dom_element({element_type:"div",class_name:"block_wrapper third_block_2 block",parent:t}),p=void 0!==e.type_data[0]?e.type_data[0].symbol_obverse:null;if(p&&p.length>0){const e=common.create_dom_element({element_type:"div",class_name:"group symbol_obverse",parent:s});common.create_dom_element({element_type:"label",text_content:tstring.symbol_obverse||"symbol_obverse",parent:e});const t=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=symbol_obverse&label="+p+"&value="+p;common.create_dom_element({element_type:"a",class_name:"value underline-text",inner_html:p,href:t,parent:e})}const i=void 0!==e.type_data[0]?e.type_data[0].symbol_reverse:null;if(i&&i.length>0){const e=common.create_dom_element({element_type:"div",class_name:"group symbol_reverse",parent:s});common.create_dom_element({element_type:"label",text_content:tstring.symbol_reverse||"symbol_reverse",parent:e}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:i,parent:e})}const d=common.create_dom_element({element_type:"div",class_name:"block_wrapper third_block_3 block",parent:t}),g=void 0!==e.type_data[0]?e.type_data[0].legend_obverse:null;if(g&&g.length>0){const e=common.create_dom_element({element_type:"div",class_name:"group legend_obverse",parent:d});common.create_dom_element({element_type:"label",text_content:tstring.legend_obverse||"legend_obverse",parent:e});const t=page.render_legend({value:g,style:"median legend_obverse_box"});e.appendChild(t)}const u=void 0!==e.type_data[0]?e.type_data[0].legend_reverse:null;if(u&&u.length>0){const e=common.create_dom_element({element_type:"div",class_name:"group legend_reverse",parent:d});common.create_dom_element({element_type:"label",text_content:tstring.legend_reverse||"legend_reverse",parent:e});const t=page.render_legend({value:u,style:"median legend_reverse_box"});e.appendChild(t)}const y=common.create_dom_element({element_type:"div",class_name:"block_wrapper fifth_block",parent:t});if(e.countermark_obverse&&e.countermark_obverse.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group countermark_obverse",parent:y});common.create_dom_element({element_type:"label",text_content:tstring.countermark_obverse||"countermark_obverse",parent:t});const n=page.render_legend({value:e.countermark_obverse,style:"median countermark_obverse_box"});t.appendChild(n)}if(e.countermark_reverse&&e.countermark_reverse.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group countermark_reverse",parent:y});common.create_dom_element({element_type:"label",text_content:tstring.countermark_reverse||"countermark_reverse",parent:t});const n=page.render_legend({value:e.countermark_reverse,style:"median countermark_reverse_box"});t.appendChild(n)}const v=common.create_dom_element({element_type:"div",class_name:"block_wrapper fourth_block",parent:t});if(e.weight&&e.weight.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group weight",parent:v});common.create_dom_element({element_type:"label",text_content:tstring.weight||"weight",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.weight+" g",parent:t})}if(e.diameter&&e.diameter.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group diameter",parent:v});common.create_dom_element({element_type:"label",text_content:tstring.diameter||"diameter",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.diameter+" mm",parent:t})}if(e.dies&&e.dies.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group dies",parent:v});common.create_dom_element({element_type:"label",text_content:tstring.dies||"dies",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.dies,parent:t})}if(e.technique&&e.technique.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group technique",parent:v});common.create_dom_element({element_type:"label",text_content:tstring.technique||"technique",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.technique,parent:t})}if(e.find_type&&e.find_type.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group find_type",parent:v});common.create_dom_element({element_type:"label",text_content:tstring.find_type||"find_type",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.find_type,parent:t})}const b=common.create_dom_element({element_type:"div",class_name:"block_wrapper sixth_block",parent:t});if(e.hoard&&e.hoard.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group hoard",parent:b});common.create_dom_element({element_type:"label",text_content:tstring.hoard||"hoard",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.hoard,parent:t})}const f=common.create_dom_element({element_type:"div",class_name:"block_wrapper seventh_block",parent:t});if(e.findspot_place&&e.findspot_place.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group findspot_place",parent:f});common.create_dom_element({element_type:"label",text_content:tstring.findspot_place||"findspot_place",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.findspot_place,parent:t})}if(e.find_date&&e.find_date.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group find_date",parent:f});common.create_dom_element({element_type:"label",text_content:tstring.find_date||"find_date",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.find_date,parent:t})}const h=common.create_dom_element({element_type:"div",class_name:"block_wrapper eighth_block",parent:t});if(e.public_info&&e.public_info.length>1&&'<br data-mce-bogus="1">'!==e.public_info){const t=common.create_dom_element({element_type:"div",class_name:"group public_info",parent:h});common.create_dom_element({element_type:"label",text_content:tstring.public_info||"public_info",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.public_info,parent:t})}const k=common.create_dom_element({element_type:"div",class_name:"block_wrapper nineth_block",parent:t});if(e.mib_uri&&e.mib_uri.length>0){const t=common.create_dom_element({element_type:"div",class_name:"group uri",parent:k});common.create_dom_element({element_type:"label",text_content:tstring.uri||"uri",parent:t}),common.create_dom_element({element_type:"span",class_name:"value",inner_html:e.mib_uri,parent:t})}if(e.uri&&e.uri.length>0)for(let t=0;t<e.uri.length;t++){const n=e.uri[t],m=common.create_dom_element({element_type:"div",class_name:"group uri",parent:k});common.create_dom_element({element_type:"label",text_content:(tstring.uri||"uri")+" "+n.label,parent:m}),common.create_dom_element({element_type:"a",href:n.value,target:"_blank",class_name:"value",inner_html:n.value,parent:m})}const x=common.create_dom_element({element_type:"div",class_name:"row_wrapper"});return x.appendChild(t),x},default:function(e,t,n,m){const _=common.create_dom_element({element_type:"div",class_name:"info_line "+e});if(t&&t.length>0){n&&common.create_dom_element({element_type:"label",class_name:"",text_content:n,parent:_});const e="function"==typeof m?m(t):page.remove_gaps(t," | ");common.create_dom_element({element_type:"span",class_name:"info_value",inner_html:e.trim(),parent:_})}return _},image:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line inline "+t});return e[t]&&e[t].length>0&&common.create_dom_element({element_type:"img",class_name:"image "+t,src:e[t],parent:n}),n},identify_coin:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line inline "+t}),m=page.split_data(e.ref_coins," | "),_=[];for(var o=0;o<m.length;o++)_.push(JSON.parse(m[o]));const a=_[0][0],l=e.ref_coins_union.find(e=>e.section_id===a);if(l){common.create_dom_element({element_type:"span",class_name:t,text_content:l.ref_auction,parent:n});const e=(l.ref_auction_date?l.ref_auction_date.split(" "):[""])[0].split("-").reverse().join("-");e&&common.create_dom_element({element_type:"span",class_name:t,text_content:" | "+e,parent:n}),l.ref_auction_number&&common.create_dom_element({element_type:"span",class_name:t,text_content:", "+(tstring.n||"nº")+" "+l.ref_auction_number,parent:n});const m=[];l.weight&&l.weight.length>0&&m.push(l.weight+" g"),l.dies&&l.dies.length>0&&m.push(l.dies+" h"),l.diameter&&l.diameter.length>0&&m.push(l.diameter+" mm");const _=m.join("; ");common.create_dom_element({element_type:"span",class_name:t,text_content:" ("+_+")",parent:n})}return n}};