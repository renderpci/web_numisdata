"use strict";var type_row_fields={caller:null,type:"",equivalents:"",draw_item:function(e){const t=this,n=new DocumentFragment;if(!0===dedalo_logged){const a=t.dedalo_link(e,"numisdata3");n.appendChild(a)}const a=document.querySelector(".golden-separator");common.create_dom_element({element_type:"span",class_name:"cite_this_record",text_content:tstring.cite_this_record||"cite this record",parent:a}).addEventListener("click",(async function(){const n=(await page.load_main_catalog()).result[0],a=n.publication_data[0];n.autors={authorship_data:e.authorship_data||null,authorship_names:e.authorship_names||null,authorship_surnames:e.authorship_surnames||null,authorship_roles:e.authorship_roles||null},n.catalog=null,n.title="<em>"+t.type+"</em>",n.publication_data=a,n.uri_location=window.location;const o=biblio_row_fields.render_cite_this(n),_=common.create_dom_element({element_type:"div",class_name:"float-cite",parent:document.body});_.addEventListener("mouseup",(function(){_.classList.add("copy"),o.classList.add("copy");const e=window.getSelection(),t=document.createRange();t.selectNodeContents(o),e.removeAllRanges(),e.addRange(t),document.execCommand("copy"),window.getSelection().removeAllRanges()}));common.create_dom_element({element_type:"div",class_name:"float-label",text_content:tstring.cite_this_record||"Cite this record",parent:_});common.create_dom_element({element_type:"div",class_name:"close-buttom",parent:_}).addEventListener("click",(function(){})),document.body.addEventListener("click",(function(e){document.body.removeEventListener("click",(function(e){})),_.remove()})),_.appendChild(o);common.create_dom_element({element_type:"div",class_name:"float-text_copy",text_content:tstring.click_to_copy||"Click to copy",parent:_})})),n.appendChild(t.catalog_hierarchy(e,"catalog_hierarchy")),n.appendChild(t.creators(e,"creators"));const o=common.create_dom_element({element_type:"div",class_name:"identify_coin_wrapper gallery",parent:n});o.appendChild(t.image(e,"ref_coins_image_obverse")),o.appendChild(t.image(e,"ref_coins_image_reverse")),common.create_dom_element({element_type:"div",id:"embedded-gallery",parent:n}),n.appendChild(t.id_line(e,"id_line"));const _=common.create_dom_element({element_type:"div",class_name:"sides_wrapper",parent:n}),l=common.create_dom_element({element_type:"div",class_name:"obverse_wrapper",parent:_});l.appendChild(t.default(e,"design_obverse")),l.appendChild(t.default(e,"symbol_obverse")),e.legend_obverse&&l.appendChild(page.render_legend({value:e.legend_obverse,style:"median legend_obverse_box"})),l.appendChild(t.default(e,"legend_obverse_transcription"));const m=common.create_dom_element({element_type:"div",class_name:"reverse_wrapper",parent:_});if(m.appendChild(t.default(e,"design_reverse")),m.appendChild(t.default(e,"symbol_reverse")),e.legend_reverse&&m.appendChild(page.render_legend({value:e.legend_reverse,style:"median legend_reverse_box"})),m.appendChild(t.default(e,"legend_reverse_transcription")),n.appendChild(t.default(e,"public_info",page.local_to_remote_path)),n.appendChild(t.default(e,"equivalents",(function(e){const n=page.split_data(e,"<br>"),a=[];for(let e=0;e<n.length;e++)a.push(n[e].replace(/ \| /g," "));return t.equivalents=a.join(" | "),t.equivalents}))),e.related_types){e.related_types;const t=e.related_types_data,a=tstring.related_types||"Related types",o=t.length,_=[];for(let e=0;e<o;e++){const n=t[e],a=(n.mint?n.mint:"...")+" "+(n.mint_number?n.mint_number:"..")+"/"+(n.number?n.number:".."),o=!!n.section_id&&n.section_id,l=page_globals.__WEB_ROOT_WEB__+"/type/"+o,m=o?'<a href="'+l+'">'+a+"</a>":a;_.push(m)}common.create_dom_element({element_type:"span",class_name:"info_value related_types",inner_html:a+": "+_.join(" | "),parent:n})}const i=e.bibliography_data;if(n.appendChild(t.draw_bibliographic_reference(i)),n.appendChild(t.default(e,"section_id",(function(e){const t=tstring.permanent_uri||"Permanent URI",n=page_globals.__WEB_ROOT_WEB__+"/type/"+e;return t+': <span class="uri">'+(page_globals.__WEB_BASE_URL__+n)+"</span>"}))),e.uri&&e.uri.length>0)for(let a=0;a<e.uri.length;a++){const o=e.uri[a];n.appendChild(t.default(e,"section_id",(function(e){return(tstring.uri||"URI")+" "+o.label+': <span class="uri"><a href="'+o.value+'" target="_blank">'+o.value+"</a></span>"})))}if(e._coins_group&&e._coins_group.length>0){const a=e._coins_group.filter((e=>"1"!=e.typology_id));if(a.length>0){const o=t.label(e,"coins");n.appendChild(o);const _=t.items_list(e,"items_list",a);o.addEventListener("mouseup",(e=>{e.preventDefault(),_.classList.toggle("hide")})),n.appendChild(_)}}if(e.ref_coins_findspots_data&&e.ref_coins_findspots_data.length>0||e.ref_coins_hoard_data&&e.ref_coins_hoard_data.length>0){const a=tstring.findspots+"/"+tstring.hoards+"/"+tstring.mints;n.appendChild(t.label(e,a)),n.appendChild(t.hoards_and_findspots(e,a))}const r=common.create_dom_element({element_type:"div",class_name:"row_wrapper"});return r.appendChild(n),r},dedalo_link:function(e,t){const n=common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",inner_html:e.section_id+" <small>("+t+")</small>",href:"/dedalo/lib/dedalo/main/?t="+t+"&id="+e.section_id});return n.setAttribute("target","_blank"),n},default:function(e,t,n){const a=common.create_dom_element({element_type:"div",class_name:"info_line "+t});if(e[t]&&e[t].length>0){const o=["design_obverse","design_reverse","symbol_reverse","symbol_obverse"],_="function"==typeof n?n(e[t]):page.remove_gaps(e[t]," | ");if(o.includes(t)){const n={$and:[{id:t,q:e[t],op:"="}]},o=psqo_factory.build_safe_psqo(n),l=psqo_factory.encode_psqo(o),m=page_globals.__WEB_ROOT_WEB__+"/catalog/?psqo="+l;common.create_dom_element({element_type:"a",class_name:"info_value underline-text",inner_html:_.trim(),href:m,parent:a})}else common.create_dom_element({element_type:"span",class_name:"info_value",inner_html:_.trim(),parent:a})}return a},label:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line separator "+t});return common.create_dom_element({element_type:"div",class_name:"big_label",text_content:tstring[t]||t,parent:n}),n},catalog_hierarchy:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line inline "+t}),a=e.catalog;if(a&&Object.keys(a).length>0&&a.constructor===Object){const e=a.parents,t=[];for(let n=0;n<e.length&&(t.push(e[n]),"mints"!==e[n].term_table);n++);for(let e=t.length-1;e>=0;e--){if("mints"===t[e].term_table){const a=t[e].term_data?JSON.parse(t[e].term_data)[0]:"";common.create_dom_element({element_type:"a",class_name:"breadcrumb link link_mint",href:page_globals.__WEB_ROOT_WEB__+"/mint/"+a,target:"_blank",text_content:t[e].term,parent:n})}else common.create_dom_element({element_type:"span",class_name:"breadcrumb "+t[e].term_table,text_content:t[e].term,parent:n});common.create_dom_element({element_type:"span",class_name:"breadcrumb_symbol",text_content:" > ",parent:n})}const o=a.ref_mint_number?a.ref_mint_number+"/":"";common.create_dom_element({element_type:"span",class_name:"breadcrumb",text_content:page_globals.OWN_CATALOG_ACRONYM+" "+o+a.term,parent:n})}return n},creators:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line "+t});if(e.creators_data&&e.creators_data.length>0){const t=JSON.parse(e.creators_data),o=e.creators_names?e.creators_names.split(" | "):[],_=e.creators_surnames?e.creators_surnames.split(" | "):[],l=e.creators_roles?e.creators_roles.split("|"):[],m=[],i=t.length;for(var a=0;a<i;a++){const e=o[a]?o[a]:"",t=_[a]?_[a]:"",n=l[a]?"("+l[a]+")":"",i=(e+" "+t).trim()+" "+n;m.push(i.trim())}common.create_dom_element({element_type:"span",class_name:"creators",text_content:m.join(" | "),parent:n})}return n},image:function(e,t){const n=this,a=common.create_dom_element({element_type:"div",class_name:"info_line inline "+t});if(e[t]&&e[t].length>0){const o=e[t],_=common.create_dom_element({element_type:"a",class_name:"image_link",href:o,parent:a});common.create_dom_element({element_type:"img",class_name:"image",src:o,title:e.number,dataset:{caption:n.type+" | "+n.equivalents},parent:_})}return a},identify_coin:function(e,t){},id_line:function(e,t){const n=this,a=common.create_dom_element({element_type:"div",class_name:"info_line "+t}),o=[];if(e[t="catalogue"]&&e[t].length>0){const a=e.mint_number?e.mint_number+"/":"",_=e[t]+" "+a+e.number;n.type=_;const l=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:_});o.push(l)}if(e[t="denomination"]&&e[t].length>0){const a=e[t],_=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:a});o.push(_),n.create_float_prompt(e,_,"denomination_data")}if(e[t="material"]&&e[t].length>0){const n=page.split_data(e[t]," | ").filter(Boolean).join(", ");var _=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:n});o.push(_)}if(n.create_float_prompt(e,_,"material_data"),t="averages",e.averages_weight&&e.averages_weight.length>0){const n=e.averages_weight?e.averages_weight.replace(".",",")+" g ("+e.total_weight_items+")":"",a=e.averages_diameter?"; "+e.averages_diameter.replace(".",",")+" mm ("+e.total_diameter_items+")":"",_=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:n+a});o.push(_)}const l=o.length;for(let e=0;e<l;e++)e>0&&e<l&&common.create_dom_element({element_type:"span",class_name:"info_value separator",text_content:" | ",parent:a}),a.appendChild(o[e]);return a},items_list:function(e,t,n){const a=this,o=common.create_dom_element({element_type:"div",class_name:"info_line "+t}),_=n.length;for(let t=0;t<_;t++){const _=n[t],l=_.coins.length;if(1==_.typology_id)continue;const m=_.typology;common.create_dom_element({element_type:"div",class_name:"medium_label",text_content:m+" ("+l+")",parent:o});const i=common.create_dom_element({element_type:"div",class_name:"coins_list typology_coins gallery",parent:o}),r=_.coins,c=r.length;for(let t=0;t<c;t++){const n=r[t],o=e.ref_coins_union.find((e=>e.section_id==n));if(o){const e=a.draw_coin(o);i.appendChild(e)}}}return o},draw_coin:function(e){const t=this;function n(){this.removeEventListener("load",n,!1);const e=this,t=this.hires;setTimeout((function(){e.src=t}),1e3)}const a=common.create_dom_element({element_type:"div",class_name:"sorted_coin"}),o=common.create_dom_element({element_type:"div",class_name:"images_wrapper",parent:a}),_=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:o}),l=common.create_dom_element({element_type:"img",src:e.image_obverse_thumb,title:e.section_id,loading:"lazy",parent:_});l.hires=e.image_obverse,l.addEventListener("load",n,!1);const m=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:o}),i=common.create_dom_element({element_type:"img",src:e.image_reverse_thumb,title:e.section_id,loading:"lazy",parent:m});if(i.hires=e.image_reverse,i.addEventListener("load",n,!1),e.collection&&e.collection.length>0){const t=e.former_collection.length>0?e.collection+" ("+e.former_collection+")":e.collection,n=e.number&&e.number.length>0?t+" "+e.number:t;l.setAttribute("data-caption",n),i.setAttribute("data-caption",n),common.create_dom_element({element_type:"div",class_name:"golden-color",inner_html:n,parent:a})}function r(e,t,n,a){if(e.name.length<1)return;let o="";const _=common.create_dom_element({element_type:"div",class_name:"line_full",parent:t});return e.name&&(o+=a+" "+e.name,common.create_dom_element({element_type:"span",class_name:n+" golden-color",inner_html:a+" "+e.name,parent:_})),e.date&&(o+=" "+e.date,common.create_dom_element({element_type:"span",class_name:n+" golden-color",inner_html:" "+e.date,parent:_})),e.number&&(o+=", "+e.number,common.create_dom_element({element_type:"span",class_name:n+" golden-color",inner_html:", "+e.number,parent:_})),e.lot&&(o+=", "+(tstring.lot||"lot")+" "+e.lot,common.create_dom_element({element_type:"span",class_name:n+" golden-color",inner_html:", "+(tstring.lot||"lot")+" "+e.lot,parent:_})),l.setAttribute("data-caption",o),i.setAttribute("data-caption",o),!0}if(e.photographer){const t=l.dataset.caption||"";l.setAttribute("data-caption",t+'<spam> | </spam> <i class="fa fa-camera"></i> '+e.photographer)}if(e.ref_auction_group)for(let t=0;t<e.ref_auction_group.length;t++)e.ref_auction_group[t].lot=e.number,r(e.ref_auction_group[t],a,"identify_coin","");if(e.ref_related_coin_auction_group)for(let t=0;t<e.ref_related_coin_auction_group.length;t++)e.ref_related_coin_auction_group[t].lot=e.number,r(e.ref_related_coin_auction_group[t],a,"identify_coin","= ");const c=[];e.weight&&e.weight.length>0&&c.push(e.weight.replace(".",",")+" g"),e.diameter&&e.diameter.length>0&&c.push(e.diameter.replace(".",",")+" mm"),e.dies&&e.dies.length>0&&c.push(e.dies+" h");const s=c.join("; ");common.create_dom_element({element_type:"div",class_name:"",inner_html:s,parent:a});const p=[];let d="";if(e.hoard){const t=e.hoard_place?e.hoard+" ("+e.hoard_place+")":e.hoard;d=(tstring.hoard||"Hoard")+": ",p.push(t)}if(e.findspot){const t=e.findspot_place?e.findspot+" ("+e.findspot_place+")":e.findspot;d=(tstring.findspot||"Findspot")+": ",p.push(t)}const u=p.join(" | ");if(common.create_dom_element({element_type:"div",class_name:"",inner_html:d+u,parent:a}),e.public_info&&e.public_info.length>0&&common.create_dom_element({element_type:"div",inner_html:e.public_info,parent:a}),e.technique&&e.technique.length>0){const t=(tstring.technique||"Technique")+": ";common.create_dom_element({element_type:"div",inner_html:t+e.technique,parent:a})}const f=common.create_dom_element({element_type:"div",class_name:"countermarks_wrapper",parent:a});e.countermark_obverse&&e.countermark_obverse.length>0&&common.create_dom_element({element_type:"span",class_name:"countermark_obverse",inner_html:e.countermark_obverse,parent:f}),e.countermark_reverse&&e.countermark_reverse.length>0&&common.create_dom_element({element_type:"span",class_name:"countermark_reverse",inner_html:e.countermark_reverse,parent:f});const g=common.create_dom_element({element_type:"div",class_name:"references",parent:a}),h=e.bibliography_data;if(h&&h.length>0&&"object"==typeof h[0]){const e=t.draw_bibliographic_reference(h);e&&g.appendChild(e)}const y=page_globals.__WEB_ROOT_WEB__+"/coin/"+e.section_id,v=(page_globals.__WEB_BASE_URL__,'<a class="icon_link" target="_blank" href="'+y+'"> '+page_globals.OWN_CATALOG_ACRONYM+" </a>");if(common.create_dom_element({element_type:"span",class_name:"uri-text",inner_html:v,parent:a}),e.uri&&e.uri.length>0)for(let t=0;t<e.uri.length;t++){const n=e.uri[t],o=(n.label,'<a class="icon_link info_value" href="'+n.value+'" target="_blank"> '+n.label+"</a>");common.create_dom_element({element_type:"span",class_name:"",inner_html:o,parent:a})}return a},draw_bibliographic_reference:function(e){const t=new DocumentFragment,n=e,a=n?n.length:0;for(let e=0;e<a;e++){const a=biblio_row_fields.render_row_bibliography(n[e]);common.create_dom_element({element_type:"div",class_name:"bibliographic_reference",parent:t}).appendChild(a)}return t},hoards_and_findspots:function(e,t){SHOW_DEBUG;const n=this,a=common.create_dom_element({element_type:"div",id:"findspots",class_name:"info_line "+t}),o=common.create_dom_element({element_type:"div",class_name:"map_container hide_opacity map",parent:a});function _(e,t){const a=common.create_dom_element({element_type:"div",class_name:"find_coin",parent:t}),o=common.create_dom_element({element_type:"div",class_name:"images_wrapper",parent:a}),_=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:o});common.create_dom_element({element_type:"img",src:e.image_obverse,title:e.section_id,dataset:{caption:n.type+" | "+n.equivalents},parent:_}).loading="lazy";const l=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:o});common.create_dom_element({element_type:"img",src:e.image_reverse,title:e.section_id,dataset:{caption:n.type+" | "+n.equivalents},parent:l}).loading="lazy";const m=common.create_dom_element({element_type:"div",class_name:"info_wrapper",parent:a});common.create_dom_element({element_type:"div",class_name:"",inner_html:e.collection,parent:m});const i=[];e.weight&&e.weight.length>0&&i.push(e.weight.replace(".",",")+" g"),e.diameter&&e.diameter.length>0&&i.push(e.diameter.replace(".",",")+" mm"),e.dies&&e.dies.length>0&&i.push(e.dies+" h");const r=i.join("; ");common.create_dom_element({element_type:"div",class_name:"",inner_html:r,parent:m});const c=page_globals.__WEB_ROOT_WEB__+"/coin/"+e.section_id,s=(page_globals.__WEB_BASE_URL__,'<a class="icon_link" target="_blank" href="'+c+'"> '+page_globals.OWN_CATALOG_ACRONYM+" </a>");if(common.create_dom_element({element_type:"span",class_name:"",inner_html:s,parent:m}),e.uri&&e.uri.length>0)for(let t=0;t<e.uri.length;t++){const n=e.uri[t],a=(n.label,'<a class="icon_link info_value" href="'+n.value+'" target="_blank"> '+n.label+"</a>");common.create_dom_element({element_type:"span",class_name:"",inner_html:a,parent:m})}common.create_dom_element({element_type:"div",class_name:"",inner_html:e.hoard,parent:m});const p=common.create_dom_element({element_type:"div",class_name:"references",parent:m}),d=e.bibliography_data;p.appendChild(n.draw_bibliographic_reference(d))}const l=[],m=[],i=[],r=e.ref_coins_hoard_data,c=r.length;if(c){const f=n.label(e,tstring.hoards);a.appendChild(f);const g=common.create_dom_element({element_type:"div",class_name:"hoard_container",parent:a});f.addEventListener("mouseup",(e=>{e.preventDefault(),g.classList.toggle("hide")}));for(let h=0;h<c;h++){const y=r[h],v=JSON.parse(y.coins)||[],b=v.length;if(b<1){console.warn("! Skipped hoard without zero coins :",r);continue}if(i.find((e=>e==y.section_id)))continue;const w=common.create_dom_element({element_type:"div",class_name:"find_wrapper hoard",parent:g});common.create_dom_element({element_type:"span",inner_html:" "+(y.name||"")+" ("+(y.place||"")+") ",parent:w});const k=common.create_dom_element({element_type:"span",text_content:" | ",parent:w}),x=common.create_dom_element({element_type:"div",class_name:"find_coins hoard gallery",parent:g}),C=[];for(let L=0;L<b;L++){const O=v[L],B=e.coin_references.find((e=>e.section_id==O));B&&(_(B,x),C.push(O))}k.innerHTML=k.innerHTML+C.length+" "+(tstring.of||"of")+" "+b+" "+(tstring.coins||"coins");const E=JSON.parse(y.map);E&&l.push({section_id:y.section_id,name:y.name,place:y.place,georef:y.georef,data:E,items:C.length,total_items:b,type:"hoard",marker_icon:page.maps_config.markers.hoard}),i.push(y.section_id)}}const s=e.ref_coins_findspots_data,p=s.length;if(p){const q=n.label(e,tstring.findspots);a.appendChild(q);const A=common.create_dom_element({element_type:"div",class_name:"findspots_container",parent:a});q.addEventListener("mouseup",(e=>{e.preventDefault(),A.classList.toggle("hide")}));for(let W=0;W<p;W++){const R=s[W],S=JSON.parse(R.coins)||[],N=S.length;if(N<1){console.warn("! Skipped findspot without zero coins :",s);continue}if(m.find((e=>e==R.section_id)))continue;const T=common.create_dom_element({element_type:"div",class_name:"find_wrapper findspot",parent:A});common.create_dom_element({element_type:"span",inner_html:" "+(R.name||"")+" ("+(R.place||"")+") ",parent:T});const j=common.create_dom_element({element_type:"span",text_content:" | ",parent:T}),z=common.create_dom_element({element_type:"div",class_name:"find_coins findspot gallery",parent:A}),J=[];for(let M=0;M<N;M++){const D=S[M],H=e.coin_references.find((e=>e.section_id==D));H&&(_(H,z),J.push(D))}const I=JSON.parse(R.map);I&&l.push({section_id:R.section_id,name:R.name,place:R.place,georef:R.georef,data:I,items:J.length,total_items:N,type:"findspot",marker_icon:page.maps_config.markers.findspot}),j.innerHTML=j.innerHTML+J.length+" "+(tstring.of||"of")+" "+N+" "+(tstring.coins||"coins"),m.push(R.section_id)}}const d=e.mint_data||[],u=d.length;if(u>0)for(let U=0;U<u;U++){const G=d[U],Y=JSON.parse(G.relations_coins)||[],F=Y.length,P=[];for(let K=0;K<F;K++){const Q=Y[K];e.coin_references.find((e=>e.section_id==Q))&&P.push(Q)}const X=JSON.parse(G.map);X&&l.push({section_id:G.section_id,name:G.name,place:G.place,georef:G.georef,data:X,items:P.length,total_items:F,type:"mint",marker_icon:page.maps_config.markers.mint})}if(l.length>0){function V(){n.caller.draw_map({container:o,map_position:null,map_data:l})}common.when_in_dom(o,V)}else o.remove();return a},mint:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line mint"});if(e.mint&&e.mint.length>0){common.create_dom_element({element_type:"label",class_name:"",text_content:tstring.mint||"Mint",parent:t});const e=row_object.mint;common.create_dom_element({element_type:"span",class_name:"info_value",text_content:e,parent:t})}return t},authors_alt:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line authors_alt"});if(e.authors_alt&&e.authors_alt.length>0){const n=" ("+(e.authors_alt||"")+"). ";common.create_dom_element({element_type:"div",class_name:"info_value authors_alt",text_content:n,parent:t})}return t},publication_date:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line publication_date"});if(e.publication_date){const n=e.publication_date.split("-");let a=parseInt(n[0]);n[1],parseInt(n[1])>0&&(a=a+"-"+parseInt(n[1])),n[2],parseInt(n[2])>0&&(a=a+"-"+parseInt(n[2])),a=" ("+a+"). ",common.create_dom_element({element_type:"div",class_name:"info_value",text_content:a,parent:t}),t.classList.remove("hide")}return t},title:function(e){const t=this.get_typology(e),n=e.title||"",a="1"==t||"20"==t||"28"==t||"30"==t||"32"==t?" italic":"",o=common.create_dom_element({element_type:"div",class_name:"info_line title"}),_=" "+n+". ";return common.create_dom_element({element_type:"div",class_name:""+a,text_content:_,parent:o}),o},editor:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line editor"});if(e.editor&&e.editor.length>0){const n=" "+(tstring.en||"En")+" "+e.editor+", ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},title_secondary:function(e){const t=e.title_secondary||"",n=common.create_dom_element({element_type:"div",class_name:"info_line row_title"});if(t.length>0){const e=" "+t+" ";common.create_dom_element({element_type:"div",class_name:"title_secondary italic",text_content:e,parent:n})}return n},magazine:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line magazine"});if(e.magazine&&e.magazine.length>0){const n=" "+e.magazine+", ";common.create_dom_element({element_type:"div",class_name:"info_value italic",text_content:n,parent:t})}return t},serie:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line serie"});if(e.serie&&e.serie.length>0){const n=!e.copy||e.copy.length<1?" "+e.serie+", ":" "+e.serie;common.create_dom_element({element_type:"div",class_name:"info_value italic",text_content:n,parent:t})}return t},copy:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line copy"});if(e.copy&&e.copy.length>0){const n=" ("+e.copy+"), ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},physical_description:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line physical_description"});if(e.physical_description&&e.physical_description.length>0){const n=" "+e.physical_description+". ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},editorial:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line editorial"});if(e.editorial&&e.editorial.length>0){const n=" "+e.editorial+". ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},url:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line url"}),n=e.url_data;if(n&&n.length>0){const e=JSON.parse(n),a=e.length;for(let n=0;n<a;n++){const o=e[n],_=o.title&&o.title.length>1?o.title:o.iri;common.create_dom_element({element_type:"a",class_name:"url_data",title:_,text_content:_,href:o.iri,parent:t}).setAttribute("target","_blank"),!(n%2)&&n<a&&a>1&&common.create_dom_element({element_type:"span",class_name:"separator",text_content:" | ",parent:t})}}return t},place:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line place"});return e.place&&e.place.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.place,parent:t}),t},descriptors:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line descriptors"});return e.descriptors&&e.descriptors.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.descriptors,parent:t}),t},typology_name:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line typology_name"});return e.typology_name&&e.typology_name.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.typology_name,parent:t}),t},create_float_prompt:function(e,t,n){if(e[n]&&e[n].length>0){t.classList.add("active-pointer"),t.classList.add("underline-text");const a=document.getElementById("main"),o=common.create_dom_element({element_type:"div",class_name:"float-prompt hide",parent:a}),_="material_data"===n?e.material:e[n][0].term,l=[{$and:[{field:e[n][0].table,value:_,op:"="}]}],m=psqo_factory.encode_psqo(l),i=page_globals.__WEB_ROOT_WEB__+"/catalog/?psqo="+m,r=(common.create_dom_element({element_type:"a",class_name:"prompt-label underline-text",inner_html:e[n][0].term,href:i,parent:o}),common.create_dom_element({element_type:"div",class_name:"close-buttom",parent:o}));if(e[n][0].definition){common.create_dom_element({element_type:"p",class_name:"prompt-description",inner_html:e[n][0].definition,parent:o})}if(e[n][0].iri.length>0){const t=page.split_data(e[n][0].iri," | ");for(let e=0;e<t.length;e++){common.create_dom_element({element_type:"a",class_name:"image_link underline-text",target:"_blank",href:t[e],inner_html:t[e],parent:o})}}t.addEventListener("click",(function(e){const t=document.getElementsByClassName("float-prompt");for(let e=0;e<t.length;e++)t[e].classList.contains("hide")||t[e].classList.add("hide");o.style.left=e.clientX+"px",o.style.top=e.clientY+"px",o.classList.remove("hide")})),r.addEventListener("click",(function(){o.classList.add("hide")}))}}};
//# sourceMappingURL=type_row_fields-min.js.map