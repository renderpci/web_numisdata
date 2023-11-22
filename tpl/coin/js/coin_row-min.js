"use strict";var coin_row={caller:null,draw_coin:function(e){SHOW_DEBUG;const t=new DocumentFragment;if(!e)return t;if(!0===dedalo_logged){common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",text_content:e.section_id,href:"/dedalo/lib/dedalo/main/?t=numisdata4&id="+e.section_id,parent:t}).setAttribute("target","_blank")}const n=document.querySelector(".golden-separator");common.create_dom_element({element_type:"span",class_name:"cite_this_record",text_content:tstring.cite_this_record||"cite this record",parent:n}).addEventListener("click",(async function(){const t=(await page.load_main_catalog()).result[0],n=t.publication_data[0];t.autors={authorship_data:e.authorship_data||null,authorship_names:e.authorship_names||null,authorship_surnames:e.authorship_surnames||null,authorship_roles:e.authorship_roles||null},t.catalog=null,t.title="<em>"+page_globals.OWN_CATALOG_ACRONYM+" "+e.section_id+"</em>",t.publication_data=n,t.uri_location=window.location;const l=biblio_row_fields.render_cite_this(t),a=common.create_dom_element({element_type:"div",class_name:"float-cite",parent:document.body});a.addEventListener("mouseup",(function(){a.classList.add("copy"),l.classList.add("copy");const e=window.getSelection(),t=document.createRange();t.selectNodeContents(l),e.removeAllRanges(),e.addRange(t),document.execCommand("copy"),window.getSelection().removeAllRanges()}));common.create_dom_element({element_type:"div",class_name:"float-label",text_content:tstring.cite_this_record||"Cite this record",parent:a});common.create_dom_element({element_type:"div",class_name:"close-buttom",parent:a}).addEventListener("click",(function(){})),document.body.addEventListener("click",(function(e){document.body.removeEventListener("click",(function(e){})),a.remove()})),a.appendChild(l);common.create_dom_element({element_type:"div",class_name:"float-text_copy",text_content:tstring.click_to_copy||"Click to copy",parent:a})}));const l=common.create_dom_element({element_type:"div",class_name:"identify_images_wrapper gallery coins-sides-wrapper",parent:t});let a=tstring.number||"Number";if(a+=" "+e.number,e.image_obverse&&e.image_obverse.length>0){const t=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:l}),n=common.create_dom_element({element_type:"img",class_name:"image image_obverse",title:a,src:e.image_obverse,parent:t});if(e.collection&&e.collection.length>0){const t=e.former_collection&&e.former_collection.length>0?e.collection+" ("+e.former_collection+")":e.collection,l=e.number&&e.number.length>0?t+" "+e.number:t;n.setAttribute("data-caption",l)}if(e.ref_auction_group)for(let t=0;t<e.ref_auction_group.length;t++){const l=e.ref_auction_group[t];let a="";l.name&&(a+=l.name),l.date&&(a+=" "+l.date),l.number&&(a+=", "+l.number),e.number&&(a+=", "+(tstring.lot||"lot")+" "+e.number),n.setAttribute("data-caption",a)}if(e.image_obverse_data[0]&&e.image_obverse_data[0].photographer){const t=n.getAttribute("data-caption");n.setAttribute("data-caption",t+'<spam> | </spam> <i class="fa fa-camera"></i> '+e.image_obverse_data[0].photographer)}}if(e.image_reverse&&e.image_reverse.length>0){const t=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:l});common.create_dom_element({element_type:"img",class_name:"image image_reverse",title:a,src:e.image_reverse,parent:t})}const o=common.create_dom_element({element_type:"div",class_name:"info_container",parent:t});e.section_id&&e.section_id>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:"ID",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.section_id,parent:o}));const _=[],m=[];e.collection&&e.collection.length>0&&(_.push(tstring.collection||"Collection"),m.push(e.collection)),e.former_collection&&e.former_collection.length>0&&m.push("("+e.former_collection+")"),m.length>0&&e.number&&e.number.length>0&&m.push(e.number);common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:_.join(""),parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:m.join(" "),parent:o});if(e.ref_auction_group){const t=[];t.push(tstring.auction||"Auction");common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:t.join(" | "),parent:o});for(let t=0;t<e.ref_auction_group.length;t++){const n=e.ref_auction_group[t],l=[];n.name&&(l.push(n.name),l.push(" ")),n.date&&(l.push(n.date),l.push(", ")),n.number&&(l.push(n.number||e.number),l.push(", ")),e.number&&(l.push(tstring.lot||"Lot"),l.push(" "+e.number)),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:l.join(""),parent:o})}}const r=[];if(e.ref_related_coin_auction_group&&e.ref_related_coin_auction_group.length>0)for(let t=0;t<e.ref_related_coin_auction_group.length;t++){const n=[];e.ref_related_coin_auction_group[t].name.length>0&&(n.push("= "+e.ref_related_coin_auction_group[t].name),e.ref_related_coin_auction_group[t].number&&e.ref_related_coin_auction_group[t].number.length>0&&n.push(e.ref_related_coin_auction_group[t].number)),r.push(n.join(" | "))}common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:r.join(" <br> "),parent:o});const s=tstring.type||"Type",c=e.type_data.find((e=>e.catalogue===page_globals.OWN_CATALOG_ACRONYM))?e.type_data.find((e=>e.catalogue===page_globals.OWN_CATALOG_ACRONYM)):e.type_data[0],i=void 0!==c?c.creators_data:null;if(i&&i.length>0){const e=JSON.parse(i),t=c.creators_names?c.creators_names.split(" | "):[],n=c.creators_surnames?c.creators_surnames.split(" | "):[],l=c.creators_roles?c.creators_roles.split("|"):[],a=[],_=e.length;for(var p=0;p<_;p++){const e=t[p]?t[p]:"",o=n[p]?n[p]:"",_=l[p]?"("+l[p]+")":"",m=(e+" "+o).trim()+" "+_;a.push(m.trim())}common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.authorities||"Authorities",parent:o});common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:a,parent:o})}const d=c.mint?c.mint:"",g=c.mint_number?c.mint_number:"",u=c.number?c.number:"",b=d?d+" "+c.catalogue+" "+g+"/"+u:+c.catalogue+" "+u,h=page_globals.__WEB_ROOT_WEB__+"/type/"+c.section_id,f='<a class="icon_link" href="'+h+'"></a> ';common.create_dom_element({element_type:"label",class_name:"left-labels",inner_html:s,parent:o}),common.create_dom_element({element_type:"a",class_name:"rigth-values type_label",inner_html:b+" "+f,href:h,target:"_blank",parent:o});for(let t=0;t<e.catalogue_type_mint.length;t++){const n=e.catalogue_type_mint[t];if(n===page_globals.OWN_CATALOG_ACRONYM)continue;common.create_dom_element({element_type:"span",class_name:"rigth-values equivalents",inner_html:n+" "+e.type[t],parent:o})}common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.obverse.toUpperCase()||"OBVERSE",parent:o});const y=void 0!==c?c.design_obverse:null;if(y&&y.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.design||"design",parent:o});const e=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_obverse&label="+y+"&value="+y;common.create_dom_element({element_type:"a",class_name:"rigth-values",inner_html:y,href:e,parent:o})}const v=void 0!==c?c.symbol_obverse:null;if(v&&v.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.symbol||"symbol",parent:o});const e=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=symbol_obverse&label="+v+"&value="+v;common.create_dom_element({element_type:"a",class_name:"rigth-values",inner_html:v,href:e,parent:o})}const x=void 0!==c?c.legend_obverse:null;if(x&&x.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.legend||"legend",parent:o});const e=page.render_legend({value:x,style:"median legend_obverse_box rigth-values"});o.appendChild(e)}const k=void 0!==c?c.legend_obverse_transcription:null;if(k&&k.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.transcription||"Transcription",parent:o});common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:k,parent:o})}if(e.countermark_obverse&&e.countermark_obverse.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.countermark||"countermark",parent:o});const t=page.render_legend({value:e.countermark_obverse,style:"median countermark_obverse_box rigth-values"});o.appendChild(t)}common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.reverse.toUpperCase()||"REVERSE",parent:o});const O=void 0!==c?c.design_reverse:null;if(O&&O.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.design||"design",parent:o});const e=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type=design_reverse&label="+O+"&value="+O;common.create_dom_element({element_type:"a",class_name:"rigth-values",inner_html:O,href:e,parent:o})}const A=void 0!==c?c.symbol_reverse:null;A&&A.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.symbol||"symbol",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:A,parent:o}));const C=void 0!==c?c.legend_reverse:null;if(C&&C.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.legend||"legend",parent:o});const e=page.render_legend({value:C,style:"median legend_reverse_box rigth-values"});o.appendChild(e)}const w=void 0!==c?c.legend_reverse_transcription:null;if(w&&w.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.transcription||"Transcription",parent:o});common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:w,parent:o})}if(e.countermark_reverse&&e.countermark_reverse.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels sub-label",text_content:tstring.countermark||"countermark",parent:o});const t=page.render_legend({value:e.countermark_reverse,style:"median countermark_reverse_box rigth-values"});o.appendChild(t)}e.weight&&e.weight.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.weight||"weight",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.weight+" g",parent:o})),e.diameter&&e.diameter.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.diameter||"diameter",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.diameter+" mm",parent:o})),e.dies&&e.dies.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.dies||"dies",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.dies,parent:o})),e.technique&&e.technique.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.technique||"technique",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.technique,parent:o})),e.find_type&&e.find_type.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.find_type||"find_type",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.find_type,parent:o})),e.hoard&&e.hoard.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.hoard||"hoard",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.hoard,parent:o})),e.findspot_place&&e.findspot_place.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.findspot_place||"findspot_place",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.findspot_place,parent:o})),e.find_date&&e.find_date.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.find_date||"find_date",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.find_date,parent:o})),e.public_info&&e.public_info.length>1&&'<br data-mce-bogus="1">'!==e.public_info&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.public_info||"public_info",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:e.public_info,parent:o}));const E='<a class="icon_link info_value" target="_blank" href="'+e.coin_uri+'"> '+page_globals.OWN_CATALOG_ACRONYM+" </a> ";if(e.coin_uri&&e.coin_uri.length>0&&(common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.uri||"uri",parent:o}),common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:E,parent:o})),e.uri&&e.uri.length>0)for(let t=0;t<e.uri.length;t++){const n=e.uri[t],l='<a class="icon_link info_value" target="_blank" href="'+n.value+'"> '+n.label+"</a> ";common.create_dom_element({element_type:"span",class_name:"rigth-values",inner_html:l,parent:o})}if(e.bibliography_data&&e.bibliography_data.length>0){common.create_dom_element({element_type:"label",class_name:"left-labels",text_content:tstring.bibliography||"bibliography",parent:o});const t=common.create_dom_element({element_type:"div",class_name:"vertical-group",parent:o}),n=e.bibliography_data,l=n.length;for(let e=0;e<l;e++){const l=biblio_row_fields.render_row_bibliography(n[e]);common.create_dom_element({element_type:"div",class_name:"rigth-values sub-vertical-group",parent:t}).appendChild(l)}}const R=common.create_dom_element({element_type:"div",class_name:"row_wrapper"});return R.appendChild(t),R}};