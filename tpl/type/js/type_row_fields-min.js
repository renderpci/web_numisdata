"use strict";var type_row_fields={caller:null,draw_item:function(e){const t=this,n=new DocumentFragment;if(!0===dedalo_logged){const o=t.dedalo_link(e,"numisdata3");n.appendChild(o)}n.appendChild(t.catalog_hierarchy(e,"catalog_hierarchy"));const o=common.create_dom_element({element_type:"div",class_name:"identify_coin_wrapper gallery",parent:n});o.appendChild(t.image(e,"ref_coins_image_obverse")),o.appendChild(t.image(e,"ref_coins_image_reverse")),n.appendChild(t.id_line(e,"id_line"));const a=common.create_dom_element({element_type:"div",class_name:"sides_wrapper",parent:n}),_=common.create_dom_element({element_type:"div",class_name:"obverse_wrapper",parent:a});_.appendChild(t.default(e,"design_obverse")),_.appendChild(t.default(e,"symbol_obverse")),e.legend_obverse?_.appendChild(page.render_legend({value:e.legend_obverse,style:"median legend_obverse_box"})):common.create_dom_element({element_type:"div",parent:wrapper}),_.appendChild(t.default(e,"legend_obverse_transcription"));const m=common.create_dom_element({element_type:"div",class_name:"reverse_wrapper",parent:a});if(m.appendChild(t.default(e,"design_reverse")),m.appendChild(t.default(e,"symbol_reverse")),e.legend_reverse&&m.appendChild(page.render_legend({value:e.legend_reverse,style:"median legend_reverse_box"})),m.appendChild(t.default(e,"legend_reverse_transcription")),n.appendChild(t.default(e,"public_info",page.local_to_remote_path)),n.appendChild(t.default(e,"equivalents",(function(e){const t=page.split_data(e,"<br>"),n=[];for(let e=0;e<t.length;e++)n.push(t[e].replace(/ \| /g," "));return n.join(" | ")}))),e.related_types){const t=e.related_types,o=JSON.parse(e.related_types_data),a=tstring.related_types||"Related types",_=page.split_data(t,"<br>"),m=[];for(let e=0;e<_.length;e++){const t=_[e].replace(/ \| /g," "),n=!!o&&(!!o[e]&&o[e]),a=page_globals.__WEB_ROOT_WEB__+"/type/"+n,l=n?'<a href="'+a+'">'+t+"</a>":t;m.push(l)}common.create_dom_element({element_type:"span",class_name:"info_value related_types",inner_html:a+": "+m.join(" | "),parent:n})}const l=e.bibliography_data;if(n.appendChild(t.draw_bibliographic_reference(l)),n.appendChild(t.default(e,"section_id",(function(e){const t=tstring.permanent_uri||"Permanent URI",n=page_globals.__WEB_ROOT_WEB__+"/type/"+e;return t+': <span class="uri">'+(page_globals.__WEB_BASE_URL__+n)+"</span>"}))),e.uri&&e.uri.length>0)for(let o=0;o<e.uri.length;o++){const a=e.uri[o];n.appendChild(t.default(e,"section_id",(function(e){return(tstring.uri||"URI")+" "+a.label+': <span class="uri"><a href="'+a.value+'" target="_blank">'+a.value+"</a></span>"})))}if(e._coins_group&&e._coins_group.length>0){const o=e._coins_group.filter((e=>"1"!=e.typology_id));if(o.length>0){const a=t.label(e,"coins");n.appendChild(a);const _=t.items_list(e,"items_list",o);a.addEventListener("mouseup",(e=>{e.preventDefault(),_.classList.toggle("hide")})),n.appendChild(_)}}if(e.ref_coins_findspots_data&&e.ref_coins_findspots_data.length>0||e.ref_coins_hoard_data&&e.ref_coins_hoard_data.length>0){const o=tstring.findspots+"/"+tstring.hoards;n.appendChild(t.label(e,o)),n.appendChild(t.hoards_and_findspots(e,o))}const i=common.create_dom_element({element_type:"div",class_name:"row_wrapper"});return i.appendChild(n),i},dedalo_link:function(e,t){const n=common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",inner_html:e.section_id+" <small>("+t+")</small>",href:"/dedalo/lib/dedalo/main/?t="+t+"&id="+e.section_id});return n.setAttribute("target","_blank"),n},default:function(e,t,n){const o=common.create_dom_element({element_type:"div",class_name:"info_line "+t});if(e[t]&&e[t].length>0){const a=["design_obverse","design_reverse","symbol_reverse","symbol_obverse"],_="function"==typeof n?n(e[t]):page.remove_gaps(e[t]," | ");if(a.includes(t)){const n={$and:[{id:t,q:e[t],op:"="}]},a=psqo_factory.build_safe_psqo(n);console.log("safe_psqo:",a);const m=psqo_factory.encode_psqo(a),l=page_globals.__WEB_ROOT_WEB__+"/catalog/?psqo="+m;common.create_dom_element({element_type:"a",class_name:"info_value underline-text",inner_html:_.trim(),href:l,parent:o})}else common.create_dom_element({element_type:"span",class_name:"info_value",inner_html:_.trim(),parent:o})}return o},label:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line separator "+t});return common.create_dom_element({element_type:"div",class_name:"big_label",text_content:tstring[t]||t,parent:n}),n},catalog_hierarchy:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line inline "+t}),o=e.catalog;if(o&&Object.keys(o).length>0&&o.constructor===Object){const e=o.parents,t=[];for(let n=0;n<e.length&&(t.push(e[n]),"mints"!==e[n].term_table);n++);for(let e=t.length-1;e>=0;e--){if("mints"===t[e].term_table){const o=t[e].term_data?JSON.parse(t[e].term_data)[0]:"";common.create_dom_element({element_type:"a",class_name:"breadcrumb link link_mint",href:page_globals.__WEB_ROOT_WEB__+"/mint/"+o,target:"_blank",text_content:t[e].term,parent:n})}else common.create_dom_element({element_type:"span",class_name:"breadcrumb "+t[e].term_table,text_content:t[e].term,parent:n});common.create_dom_element({element_type:"span",class_name:"breadcrumb_symbol",text_content:" > ",parent:n})}const a=o.ref_mint_number?o.ref_mint_number+"/":"";common.create_dom_element({element_type:"span",class_name:"breadcrumb",text_content:"MIB "+a+o.term,parent:n})}return n},image:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line inline "+t});if(e[t]&&e[t].length>0){const o=e[t],a=common.create_dom_element({element_type:"a",class_name:"image_link",href:o,parent:n});common.create_dom_element({element_type:"img",class_name:"image",src:o,parent:a})}return n},identify_coin:function(e,t){},id_line:function(e,t){const n=this,o=common.create_dom_element({element_type:"div",class_name:"info_line "+t}),a=[];if(e[t="catalogue"]&&e[t].length>0){const n=e.mint_number?e.mint_number+"/":"",o=e[t]+" "+n+e.number,_=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:o});a.push(_)}if(e[t="denomination"]&&e[t].length>0){const o=e[t],_=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:o});a.push(_),n.create_float_prompt(e,_,"denomination_data")}if(e[t="material"]&&e[t].length>0){const n=page.split_data(e[t]," | ").filter(Boolean).join(", ");var _=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:n});a.push(_)}if(n.create_float_prompt(e,_,"material_data"),t="averages",e.averages_weight&&e.averages_weight.length>0){const n=e.averages_weight?e.averages_weight.replace(".",",")+" g ("+e.total_weight_items+")":"",o=e.averages_diameter?"; "+e.averages_diameter.replace(".",",")+" mm ("+e.total_diameter_items+")":"",_=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:n+o});a.push(_)}const m=a.length;for(let e=0;e<m;e++){if(e>0&&e<m){common.create_dom_element({element_type:"span",class_name:"info_value separator",text_content:" | ",parent:o})}o.appendChild(a[e])}return o},items_list:function(e,t,n){const o=this,a=common.create_dom_element({element_type:"div",class_name:"info_line "+t}),_=n.length;for(let t=0;t<_;t++){const _=n[t],m=_.coins.length;if(1==_.typology_id)continue;const l=_.typology;common.create_dom_element({element_type:"div",class_name:"medium_label",text_content:l+" ("+m+")",parent:a});const i=common.create_dom_element({element_type:"div",class_name:"coins_list typology_coins gallery",parent:a}),r=_.coins,c=r.length;for(let t=0;t<c;t++){const n=r[t],a=e.ref_coins_union.find((e=>e.section_id==n));if(a){const e=o.draw_coin(a);i.appendChild(e)}}}return a},draw_coin:function(e){const t=this;function n(){this.removeEventListener("load",n,!1);const e=this,t=this.hires;setTimeout((function(){e.src=t}),1e3)}const o=common.create_dom_element({element_type:"div",class_name:"sorted_coin"}),a=common.create_dom_element({element_type:"div",class_name:"images_wrapper",parent:o}),_=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:a}),m=common.create_dom_element({element_type:"img",src:e.image_obverse_thumb,loading:"lazy",parent:_});m.hires=e.image_obverse,m.addEventListener("load",n,!1);const l=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:a}),i=common.create_dom_element({element_type:"img",src:e.image_reverse_thumb,loading:"lazy",parent:l});if(i.hires=e.image_reverse,i.addEventListener("load",n,!1),e.collection&&e.collection.length>0){const t=e.former_collection.length>0?e.collection+" ("+e.former_collection+")":e.collection,n=e.number&&e.number.length>0?t+" "+e.number:t;common.create_dom_element({element_type:"div",class_name:"golden-color",inner_html:n,parent:o})}const r=[];e.weight&&e.weight.length>0&&r.push(e.weight.replace(".",",")+" g"),e.diameter&&e.diameter.length>0&&r.push(e.diameter.replace(".",",")+" mm"),e.dies&&e.dies.length>0&&r.push(e.dies+" h");const c=r.join("; ");common.create_dom_element({element_type:"div",class_name:"",inner_html:c,parent:o});const s=[];let p="";if(e.hoard){const t=e.hoard_place?e.hoard+" ("+e.hoard_place+")":e.hoard;p=(tstring.hoard||"Hoard")+": ",s.push(t)}if(e.findspot){const t=e.findspot_place?e.findspot+" ("+e.findspot_place+")":e.findspot;p=(tstring.findspot||"Findspot")+": ",s.push(t)}const d=s.join(" | ");function f(e,t,n,o){if(e.name.length<1)return;const a=common.create_dom_element({element_type:"div",class_name:"line_full",parent:t});return e.name&&common.create_dom_element({element_type:"span",class_name:n+" golden-color",inner_html:o+" "+e.name,parent:a}),e.date&&common.create_dom_element({element_type:"span",class_name:n+" golden-color",inner_html:" "+e.date,parent:a}),e.number&&common.create_dom_element({element_type:"span",class_name:n+" golden-color",inner_html:", "+e.number,parent:a}),e.lot&&common.create_dom_element({element_type:"span",class_name:n+" golden-color",inner_html:", "+(tstring.lot||"lot")+" "+e.lot,parent:a}),!0}if(common.create_dom_element({element_type:"div",class_name:"",inner_html:p+d,parent:o}),e.ref_auction_group)for(let t=0;t<e.ref_auction_group.length;t++)e.ref_auction_group[t].lot=e.number,f(e.ref_auction_group[t],o,"identify_coin","");if(e.ref_related_coin_auction_group)for(let t=0;t<e.ref_related_coin_auction_group.length;t++)e.ref_related_coin_auction_group[t].lot=e.number,f(e.ref_related_coin_auction_group[t],o,"identify_coin","= ");if(e.public_info&&e.public_info.length>0&&common.create_dom_element({element_type:"div",inner_html:e.public_info,parent:o}),e.technique&&e.technique.length>0){const t=(tstring.technique||"Technique")+": ";common.create_dom_element({element_type:"div",inner_html:t+e.technique,parent:o})}const g=common.create_dom_element({element_type:"div",class_name:"countermarks_wrapper",parent:o});e.countermark_obverse&&e.countermark_obverse.length>0&&common.create_dom_element({element_type:"span",class_name:"countermark_obverse",inner_html:e.countermark_obverse,parent:g}),e.countermark_reverse&&e.countermark_reverse.length>0&&common.create_dom_element({element_type:"span",class_name:"countermark_reverse",inner_html:e.countermark_reverse,parent:g});const h=common.create_dom_element({element_type:"div",class_name:"references",parent:o}),u=e.bibliography_data;if(u&&u.length>0&&"object"==typeof u[0]){const e=t.draw_bibliographic_reference(u);e&&h.appendChild(e)}const y=page_globals.__WEB_ROOT_WEB__+"/coin/"+e.section_id,v=(page_globals.__WEB_BASE_URL__,'<a class="icon_link" target="_blank" href="'+y+'"> URI </a>');if(common.create_dom_element({element_type:"span",class_name:"uri-text",inner_html:v,parent:o}),e.uri&&e.uri.length>0)for(let t=0;t<e.uri.length;t++){const n=e.uri[t],a=(n.label,'<a class="icon_link info_value" href="'+n.value+'" target="_blank"> '+n.label+"</a>");common.create_dom_element({element_type:"span",class_name:"",inner_html:a,parent:o})}return o},draw_bibliographic_reference:function(e){const t=new DocumentFragment,n=e,o=n?n.length:0;for(let e=0;e<o;e++){const o=biblio_row_fields.render_row_bibliography(n[e]);common.create_dom_element({element_type:"div",class_name:"bibliographic_reference",parent:t}).appendChild(o)}return t},hoards_and_findspots:function(e,t){!0===SHOW_DEBUG&&console.log("item.ref_coins_findspots_data:",e.ref_coins_findspots_data);const n=this,o=common.create_dom_element({element_type:"div",id:"findspots",class_name:"info_line "+t}),a=common.create_dom_element({element_type:"div",class_name:"map_container hide_opacity map",parent:o});function _(e,t){const o=common.create_dom_element({element_type:"div",class_name:"find_coin",parent:t}),a=common.create_dom_element({element_type:"div",class_name:"images_wrapper",parent:o}),_=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:a});common.create_dom_element({element_type:"img",src:e.image_obverse,parent:_}).loading="lazy";const m=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:a});common.create_dom_element({element_type:"img",src:e.image_reverse,parent:m}).loading="lazy";const l=common.create_dom_element({element_type:"div",class_name:"info_wrapper",parent:o});common.create_dom_element({element_type:"div",class_name:"",inner_html:e.collection,parent:l});const i=[];e.weight&&e.weight.length>0&&i.push(e.weight.replace(".",",")+" g"),e.diameter&&e.diameter.length>0&&i.push(e.diameter.replace(".",",")+" mm"),e.dies&&e.dies.length>0&&i.push(e.dies+" h");const r=i.join("; ");common.create_dom_element({element_type:"div",class_name:"",inner_html:r,parent:l});const c=page_globals.__WEB_ROOT_WEB__+"/coin/"+e.section_id,s=(page_globals.__WEB_BASE_URL__,'<a class="icon_link" target="_blank" href="'+c+'"> URI </a>');common.create_dom_element({element_type:"div",class_name:"",inner_html:s,parent:l}),common.create_dom_element({element_type:"div",class_name:"",inner_html:e.hoard,parent:l});const p=common.create_dom_element({element_type:"div",class_name:"references",parent:l}),d=e.bibliography_data;p.appendChild(n.draw_bibliographic_reference(d))}const m=[],l=[],i=[],r=e.ref_coins_hoard_data,c=r.length;if(c){const t=n.label(e,tstring.hoards);o.appendChild(t);const a=common.create_dom_element({element_type:"div",class_name:"hoard_container",parent:o});t.addEventListener("mouseup",(e=>{e.preventDefault(),a.classList.toggle("hide")}));for(let t=0;t<c;t++){const n=r[t],o=JSON.parse(n.coins)||[],l=o.length;if(l<1){console.warn("! Skipped hoard without zero coins :",r);continue}if(i.find((e=>e==n.section_id)))continue;const c=common.create_dom_element({element_type:"div",class_name:"find_wrapper hoard",parent:a});common.create_dom_element({element_type:"span",inner_html:" "+(n.name||"")+" ("+(n.place||"")+") ",parent:c});const s=common.create_dom_element({element_type:"span",text_content:" | ",parent:c}),p=common.create_dom_element({element_type:"div",class_name:"find_coins hoard gallery",parent:a}),d=[];for(let t=0;t<l;t++){const n=o[t],a=e.coin_references.find((e=>e.section_id==n));a&&(_(a,p),d.push(n))}s.innerHTML=s.innerHTML+d.length+" "+(tstring.of||"of")+" "+l+" "+(tstring.coins||"coins");const f=JSON.parse(n.map);f&&m.push({section_id:n.section_id,name:n.name,place:n.place,georef:n.georef,data:f,items:d.length,total_items:l,type:"hoard",marker_icon:page.maps_config.markers.hoard}),i.push(n.section_id)}}const s=e.ref_coins_findspots_data,p=s.length;if(p){const t=n.label(e,tstring.findspots);o.appendChild(t);const a=common.create_dom_element({element_type:"div",class_name:"findspots_container",parent:o});t.addEventListener("mouseup",(e=>{e.preventDefault(),a.classList.toggle("hide")}));for(let t=0;t<p;t++){const n=s[t],o=JSON.parse(n.coins)||[],i=o.length;if(i<1){console.warn("! Skipped findspot without zero coins :",s);continue}if(l.find((e=>e==n.section_id)))continue;const r=common.create_dom_element({element_type:"div",class_name:"find_wrapper findspot",parent:a});common.create_dom_element({element_type:"span",inner_html:" "+(n.name||"")+" ("+(n.place||"")+") ",parent:r});const c=common.create_dom_element({element_type:"span",text_content:" | ",parent:r}),p=common.create_dom_element({element_type:"div",class_name:"find_coins findspot gallery",parent:a}),d=[];for(let t=0;t<i;t++){const n=o[t],a=e.coin_references.find((e=>e.section_id==n));a&&(_(a,p),d.push(n))}const f=JSON.parse(n.map);f&&m.push({section_id:n.section_id,name:n.name,place:n.place,georef:n.georef,data:f,items:d.length,total_items:i,type:"findspot",marker_icon:page.maps_config.markers.findspot}),c.innerHTML=c.innerHTML+d.length+" "+(tstring.of||"of")+" "+i+" "+(tstring.coins||"coins"),l.push(n.section_id)}}if(console.log("// map_data:",m),m.length>0){common.when_in_dom(a,(function(){n.caller.draw_map({container:a,map_position:null,map_data:m})}))}else a.remove();return o},mint:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line mint"});if(e.mint&&e.mint.length>0){common.create_dom_element({element_type:"label",class_name:"",text_content:tstring.mint||"Mint",parent:t});const e=row_object.mint;common.create_dom_element({element_type:"span",class_name:"info_value",text_content:e,parent:t})}return t},authors_alt:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line authors_alt"});if(e.authors_alt&&e.authors_alt.length>0){const n=" ("+(e.authors_alt||"")+"). ";common.create_dom_element({element_type:"div",class_name:"info_value authors_alt",text_content:n,parent:t})}return t},publication_date:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line publication_date"});if(e.publication_date){const n=e.publication_date.split("-");let o=parseInt(n[0]);n[1],parseInt(n[1])>0&&(o=o+"-"+parseInt(n[1])),n[2],parseInt(n[2])>0&&(o=o+"-"+parseInt(n[2])),o=" ("+o+"). ",common.create_dom_element({element_type:"div",class_name:"info_value",text_content:o,parent:t}),t.classList.remove("hide")}return t},title:function(e){const t=this.get_typology(e),n=e.title||"",o="1"==t||"20"==t||"28"==t||"30"==t||"32"==t?" italic":"",a=common.create_dom_element({element_type:"div",class_name:"info_line title"}),_=" "+n+". ";return common.create_dom_element({element_type:"div",class_name:""+o,text_content:_,parent:a}),a},editor:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line editor"});if(e.editor&&e.editor.length>0){const n=" "+(tstring.en||"En")+" "+e.editor+", ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},title_secondary:function(e){this.get_typology(e);const t=e.title_secondary||"",n=common.create_dom_element({element_type:"div",class_name:"info_line row_title"});if(t.length>0){const e=" "+t+" ";common.create_dom_element({element_type:"div",class_name:"title_secondary italic",text_content:e,parent:n})}return n},magazine:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line magazine"});if(e.magazine&&e.magazine.length>0){const n=" "+e.magazine+", ";common.create_dom_element({element_type:"div",class_name:"info_value italic",text_content:n,parent:t})}return t},serie:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line serie"});if(e.serie&&e.serie.length>0){const n=!e.copy||e.copy.length<1?" "+e.serie+", ":" "+e.serie;common.create_dom_element({element_type:"div",class_name:"info_value italic",text_content:n,parent:t})}return t},copy:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line copy"});if(e.copy&&e.copy.length>0){const n=" ("+e.copy+"), ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},physical_description:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line physical_description"});if(e.physical_description&&e.physical_description.length>0){const n=" "+e.physical_description+". ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},editorial:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line editorial"});if(e.editorial&&e.editorial.length>0){const n=" "+e.editorial+". ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},url:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line url"}),n=e.url_data;if(n&&n.length>0){const e=JSON.parse(n),o=e.length;for(let n=0;n<o;n++){const a=e[n],_=a.title&&a.title.length>1?a.title:a.iri;common.create_dom_element({element_type:"a",class_name:"url_data",title:_,text_content:_,href:a.iri,parent:t}).setAttribute("target","_blank"),!(n%2)&&n<o&&o>1&&common.create_dom_element({element_type:"span",class_name:"separator",text_content:" | ",parent:t})}}return t},place:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line place"});return e.place&&e.place.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.place,parent:t}),t},descriptors:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line descriptors"});return e.descriptors&&e.descriptors.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.descriptors,parent:t}),t},typology_name:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line typology_name"});return e.typology_name&&e.typology_name.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.typology_name,parent:t}),t},create_float_prompt:function(e,t,n){if(e[n]&&e[n].length>0){t.classList.add("active-pointer"),t.classList.add("underline-text");const a=document.getElementById("main"),_=common.create_dom_element({element_type:"div",class_name:"float-prompt hide",parent:a});if("material_data"===n)var o=e.material;else o=e[n][0].term;const m=[{$and:[{field:e[n][0].table,value:o,op:"="}]}],l=psqo_factory.encode_psqo(m),i=page_globals.__WEB_ROOT_WEB__+"/catalog/?psqo="+l,r=(common.create_dom_element({element_type:"a",class_name:"prompt-label underline-text",inner_html:e[n][0].term,href:i,parent:_}),common.create_dom_element({element_type:"div",class_name:"close-buttom",parent:_}));if(e[n][0].definition){common.create_dom_element({element_type:"p",class_name:"prompt-description",inner_html:e[n][0].definition,parent:_})}if(e[n][0].iri.length>0){const t=page.split_data(e[n][0].iri," | ");for(let e=0;e<t.length;e++){common.create_dom_element({element_type:"a",class_name:"image_link underline-text",target:"_blank",href:t[e],inner_html:t[e],parent:_})}}t.addEventListener("click",(function(e){const t=document.getElementsByClassName("float-prompt");for(let e=0;e<t.length;e++)t[e].classList.contains("hide")||t[e].classList.add("hide");_.style.left=e.clientX+"px",_.style.top=e.clientY+"px",_.classList.remove("hide")})),r.addEventListener("click",(function(){_.classList.add("hide")}))}}};
//# sourceMappingURL=type_row_fields-min.js.map