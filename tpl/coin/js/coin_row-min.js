"use strict";var coin_row={caller:null,draw_coin:function(e){SHOW_DEBUG;const t=new DocumentFragment;if(!e)return t;if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:e.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata4&id="+e.section_id,parent:t}).setAttribute("target","_blank")}const n=common.create_dom_element({element_type:"div",class_name:"identify_images_wrapper gallery coins-sides-wrapper",parent:t});let l=tstring.number||"Number";if(l+=" "+e.number,e.image_obverse&&e.image_obverse.length>0){const t=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:n}),a=common.create_dom_element({element_type:"img",class_name:"image image_obverse",title:l,src:e.image_obverse,parent:t});if(e.collection&&e.collection.length>0){const t=e.former_collection.length>0?e.collection+" ("+e.former_collection+")":e.collection,n=e.number&&e.number.length>0?t+" "+e.number:t;a.setAttribute("data-caption",n)}if(e.ref_auction_group)for(let t=0;t<e.ref_auction_group.length;t++){const n=e.ref_auction_group[t];let l="";n.name&&(l+=n.name),n.date&&(l+=" "+n.date),n.number&&(l+=", "+n.number),e.number&&(l+=", "+(tstring.lot||"lot")+" "+e.number),a.setAttribute("data-caption",l)}if(e.image_obverse_data[0]&&e.image_obverse_data[0].photographer){const t=a.getAttribute("data-caption");a.setAttribute("data-caption",t+'<spam> | </spam> <i class="fa fa-camera"></i> '+e.image_obverse_data[0].photographer)}}if(e.image_reverse&&e.image_reverse.length>0){const t=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:n});common.create_dom_element({element_type:"img",class_name:"image image_reverse",title:l,src:e.image_reverse,parent:t})}const a=common.create_dom_element({element_type:"div",class_name:"info_container",parent:t});e.section_id&&e.section_id>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:"ID",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.section_id,parent:a}));const m=[],_=[];e.collection&&e.collection.length>0&&(m.push(tstring.collection||"Collection"),_.push(e.collection)),e.former_collection&&e.former_collection.length>0&&_.push("("+e.former_collection+")"),e.number&&e.number.length>0&&_.push(e.number);common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:m.join(""),parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:_.join(" "),parent:a});if(e.ref_auction_group){const t=[];t.push(tstring.auction||"Auction");common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:t.join(" | "),parent:a});for(let t=0;t<e.ref_auction_group.length;t++){const n=e.ref_auction_group[t],l=[];n.name&&l.push(n.name),l.push(" "),n.date&&l.push(n.date),l.push(", "),n.number&&l.push(n.number||e.number),l.push(", "),e.number&&(l.push(tstring.lot||"Lot"),l.push(" "+e.number)),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:l.join(""),parent:a})}}const r=[];if(e.ref_related_coin_auction_group&&e.ref_related_coin_auction_group.length>0)for(let t=0;t<e.ref_related_coin_auction_group.length;t++){const n=[];e.ref_related_coin_auction_group[t].name.length>0&&(n.push("= "+e.ref_related_coin_auction_group[t].name),e.ref_related_coin_auction_group[t].number&&e.ref_related_coin_auction_group[t].number.length>0&&n.push(e.ref_related_coin_auction_group[t].number)),r.push(n.join(" | "))}common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:r.join(" <br> "),parent:a});const o=tstring.type||"Type",s=e.type_data.filter((e=>"MIB"===e.catalogue))[0],c=void 0!==s?s.creators_data:null;if(c&&c.length>0){const e=JSON.parse(c),t=s.creators_names?s.creators_names.split(" | "):[],n=s.creators_surnames?s.creators_surnames.split(" | "):[],l=s.creators_roles?s.creators_roles.split("|"):[],m=[],_=e.length;for(var i=0;i<_;i++){const e=t[i]?t[i]:"",a=n[i]?n[i]:"",_=l[i]?"("+l[i]+")":"",r=(e+" "+a).trim()+" "+_;m.push(r.trim())}common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.authorities||"Authorities",parent:a});common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:m,parent:a})}const p=s.mint?s.mint:"",g=s.mint_number?s.mint_number:"",d=s.mint_number?s.number:"",u=p+" "+s.catalogue+" "+g+"/"+d,b=page_globals.__WEB_ROOT_WEB__+"/type/"+s.section_id,h='<a class="icon_link" href="'+b+'"></a> ';common.create_dom_element({element_type:"label",class_name:"left-labels",inner_html:o,parent:a}),common.create_dom_element({element_type:"a",class_name:"rigth-values type_label",inner_html:u+" "+h,href:b,target:"_blank",parent:a});for(let t=0;t<e.catalogue_type_mint.length;t++){const n=e.catalogue_type_mint[t];if("MIB"===n)continue;common.create_dom_element({element_type:"span",class_name:"rigth-values equivalents",inner_html:n+" "+e.type[t],parent:a})}common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.obverse.toUpperCase()||"OBVERSE",parent:a});const f=void 0!==s?s.design_obverse:null;if(f&&f.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.design||"design",parent:a});const e=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_obverse&label="+f+"&value="+f;common.create_dom_element({element_type:"a",class_name:"rigth-values",inner_html:f,href:e,parent:a})}const y=void 0!==s?s.symbol_obverse:null;if(y&&y.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.symbol||"symbol",parent:a});const e=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=symbol_obverse&label="+y+"&value="+y;common.create_dom_element({element_type:"a",class_name:"rigth-values",inner_html:y,href:e,parent:a})}const v=void 0!==s?s.legend_obverse:null;if(v&&v.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.legend||"legend",parent:a});const e=page.render_legend({value:v,style:"median legend_obverse_box rigth-values"});a.appendChild(e)}const x=void 0!==s?s.legend_obverse_transcription:null;if(x&&x.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.transcription||"Transcription",parent:a});common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:x,parent:a})}if(e.countermark_obverse&&e.countermark_obverse.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.countermark||"countermark",parent:a});const t=page.render_legend({value:e.countermark_obverse,style:"median countermark_obverse_box rigth-values"});a.appendChild(t)}common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.reverse.toUpperCase()||"REVERSE",parent:a});const k=void 0!==s?s.design_reverse:null;if(k&&k.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.design||"design",parent:a});const e=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_reverse&label="+k+"&value="+k;common.create_dom_element({element_type:"a",class_name:"rigth-values",inner_html:k,href:e,parent:a})}const w=void 0!==s?s.symbol_reverse:null;w&&w.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.symbol||"symbol",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:w,parent:a}));const E=void 0!==s?s.legend_reverse:null;if(E&&E.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.legend||"legend",parent:a});const e=page.render_legend({value:E,style:"median legend_reverse_box rigth-values"});a.appendChild(e)}const B=void 0!==s?s.legend_reverse_transcription:null;if(B&&B.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.transcription||"Transcription",parent:a});common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:B,parent:a})}if(e.countermark_reverse&&e.countermark_reverse.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.countermark||"countermark",parent:a});const t=page.render_legend({value:e.countermark_reverse,style:"median countermark_reverse_box rigth-values"});a.appendChild(t)}e.weight&&e.weight.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.weight||"weight",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.weight+" g",parent:a})),e.diameter&&e.diameter.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.diameter||"diameter",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.diameter+" mm",parent:a})),e.dies&&e.dies.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.dies||"dies",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.dies,parent:a})),e.technique&&e.technique.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.technique||"technique",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.technique,parent:a})),e.find_type&&e.find_type.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.find_type||"find_type",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.find_type,parent:a})),e.hoard&&e.hoard.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.hoard||"hoard",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.hoard,parent:a})),e.findspot_place&&e.findspot_place.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.findspot_place||"findspot_place",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.findspot_place,parent:a})),e.find_date&&e.find_date.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.find_date||"find_date",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.find_date,parent:a})),e.public_info&&e.public_info.length>1&&'<br data-mce-bogus="1">'!==e.public_info&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.public_info||"public_info",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.public_info,parent:a}));const O='<a class="icon_link info_value" target="_blank" href="'+e.mib_uri+'"> MIB </a> ';if(e.mib_uri&&e.mib_uri.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.uri||"uri",parent:a}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:O,parent:a})),e.uri&&e.uri.length>0)for(let t=0;t<e.uri.length;t++){const n=e.uri[t],l='<a class="icon_link info_value" target="_blank" href="'+n.value+'"> '+n.label+"</a> ";common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:l,parent:a})}if(e.bibliography_data&&e.bibliography_data.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.bibliography||"bibliography",parent:a});const t=common.create_dom_element({element_type:"div",class_name:"vertical-group",parent:a}),n=e.bibliography_data,l=n.length;for(let e=0;e<l;e++){const l=biblio_row_fields.render_row_bibliography(n[e]);common.create_dom_element({element_type:"div",class_name:"rigth-values sub-vertical-group",parent:t}).appendChild(l)}}const C=common.create_dom_element({element_type:"div",class_name:"row_wrapper"});return C.appendChild(t),C}};
//# sourceMappingURL=coin_row-min.js.map