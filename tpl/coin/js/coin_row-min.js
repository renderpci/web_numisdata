"use strict";var coin_row={caller:null,draw_coin:function(e){!0===SHOW_DEBUG&&console.log("-- draw_coin row:",e);const t=new DocumentFragment;if(!e)return t;if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:e.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata4&id="+e.section_id,parent:t}).setAttribute("target","_blank")}const n=common.create_dom_element({element_type:"div",class_name:"identify_images_wrapper gallery coins-sides-wrapper",parent:t});let l=tstring.number||"Number";if(l+=" "+e.number,e.image_obverse&&e.image_obverse.length>0){const t=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:n});common.create_dom_element({element_type:"img",class_name:"image image_obverse",title:l,src:e.image_obverse,parent:t})}if(e.image_reverse&&e.image_reverse.length>0){const t=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:n});common.create_dom_element({element_type:"img",class_name:"image image_reverse",title:l,src:e.image_reverse,parent:t})}const a=common.create_dom_element({element_type:"div",class_name:"info_container",parent:t});e.section_id&&e.section_id.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:"ID",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.section_id,parent:a}));const _=[],m=[];e.collection&&e.collection.length>0&&(_.push(tstring.collection||"Collection"),m.push(e.collection)),e.former_collection&&e.former_collection.length>0&&(_.push(tstring.former_collection||"Former collection"),m.push(e.former_collection)),e.number&&e.number.length>0&&(_.push(tstring.number||"Number"),m.push(e.number));common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:_.join(" | "),parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:m.join(" | "),parent:a});const o=[],r=[];if(e.ref_auction_group&&e.ref_auction_group.length>0)for(let t=0;t<e.ref_auction_group.length;t++)e.ref_auction_group[t].name.length>0&&(o.push(tstring.auction||"Auction"),r.push(e.ref_auction_group[t].name),e.ref_auction_group[t].number&&e.ref_auction_group[t].number.length>0&&(o.push(tstring.number||"Number"),r.push(e.ref_auction_group[t].number)));common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:o.join(" | "),parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:r.join(" | "),parent:a});const s=[];if(e.ref_related_coin_auction_group&&e.ref_related_coin_auction_group.length>0)for(let t=0;t<e.ref_related_coin_auction_group.length;t++){const n=[];e.ref_related_coin_auction_group[t].name.length>0&&(n.push("= "+e.ref_related_coin_auction_group[t].name),e.ref_related_coin_auction_group[t].number&&e.ref_related_coin_auction_group[t].number.length>0&&n.push(e.ref_related_coin_auction_group[t].number)),s.push(n.join(" | "))}common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:s.join(" <br> "),parent:a});const c=tstring.type||"Type",i=(e.mint?e.mint:"")+" "+(e.mint_number?e.mint_number:"")+"/"+(e.mint_number?e.type_data[0].number:"");common.create_dom_element({element_type:"label",class_name:"left-labels",inner_html:c,parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:i,parent:a});common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.obverse.toUpperCase()||"OBVERSE",parent:a});const p=void 0!==e.type_data[0]?e.type_data[0].design_obverse:null;if(p&&p.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.design||"design",parent:a});const e=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_obverse&label="+p+"&value="+p;common.create_dom_element({element_type:"a",class_name:"rigth-values",inner_html:p,href:e,parent:a})}const d=void 0!==e.type_data[0]?e.type_data[0].symbol_obverse:null;if(d&&d.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.symbol||"symbol",parent:a});const e=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=symbol_obverse&label="+d+"&value="+d;common.create_dom_element({element_type:"a",class_name:"rigth-values",inner_html:d,href:e,parent:a})}const g=void 0!==e.type_data[0]?e.type_data[0].legend_obverse:null;if(g&&g.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.legend||"legend",parent:a});const e=page.render_legend({value:g,style:"median legend_obverse_box rigth-values"});a.appendChild(e)}if(e.countermark_obverse&&e.countermark_obverse.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.countermark||"countermark",parent:a});const t=page.render_legend({value:e.countermark_obverse,style:"median countermark_obverse_box rigth-values"});a.appendChild(t)}common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.reverse.toUpperCase()||"REVERSE",parent:a});const u=void 0!==e.type_data[0]?e.type_data[0].design_reverse:null;if(u&&u.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.design||"design",parent:a});const e=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_reverse&label="+u+"&value="+u;common.create_dom_element({element_type:"a",class_name:"rigth-values",inner_html:u,href:e,parent:a})}const b=void 0!==e.type_data[0]?e.type_data[0].symbol_reverse:null;b&&b.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.symbol||"symbol",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:b,parent:a}));const h=void 0!==e.type_data[0]?e.type_data[0].legend_reverse:null;if(h&&h.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.legend||"legend",parent:a});const e=page.render_legend({value:h,style:"median legend_reverse_box rigth-values"});a.appendChild(e)}if(e.countermark_reverse&&e.countermark_reverse.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.countermark||"countermark",parent:a});const t=page.render_legend({value:e.countermark_reverse,style:"median countermark_reverse_box rigth-values"});a.appendChild(t)}e.weight&&e.weight.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.weight||"weight",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.weight+" g",parent:a})),e.diameter&&e.diameter.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.diameter||"diameter",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.diameter+" mm",parent:a})),e.dies&&e.dies.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.dies||"dies",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.dies,parent:a})),e.technique&&e.technique.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.technique||"technique",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.technique,parent:a})),e.find_type&&e.find_type.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.find_type||"find_type",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.find_type,parent:a})),e.hoard&&e.hoard.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.hoard||"hoard",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.hoard,parent:a})),e.findspot_place&&e.findspot_place.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.findspot_place||"findspot_place",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.findspot_place,parent:a})),e.find_date&&e.find_date.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.find_date||"find_date",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.find_date,parent:a})),e.public_info&&e.public_info.length>1&&'<br data-mce-bogus="1">'!==e.public_info&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.public_info||"public_info",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.public_info,parent:a}));const f='<a class="icon_link info_value" target="_blank" href="'+e.mib_uri+'"> MIB </a> ';if(e.mib_uri&&e.mib_uri.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.uri||"uri",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:f,parent:a})),e.uri&&e.uri.length>0)for(let t=0;t<e.uri.length;t++){const n=e.uri[t],l='<a class="icon_link info_value" target="_blank" href="'+n.value+'"> '+n.label+"</a> ";common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:l,parent:a})}if(e.bibliography_data&&e.bibliography_data.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.bibliography||"bibliography",parent:a});const t=common.create_dom_element({element_type:"div",class_name:"vertical-group",parent:a}),n=e.bibliography_data,l=n.length;for(let e=0;e<l;e++){const l=biblio_row_fields.render_row_bibliography(n[e]);common.create_dom_element({element_type:"div",class_name:"rigth-values sub-vertical-group",parent:t}).appendChild(l)}}const y=common.create_dom_element({element_type:"div",class_name:"row_wrapper"});return y.appendChild(t),y}};