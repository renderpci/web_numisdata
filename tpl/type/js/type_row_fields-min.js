"use strict";var type_row_fields={caller:null,draw_item:function(e){const n=this,t=new DocumentFragment;if(!0===dedalo_logged){const o=n.dedalo_link(e,"numisdata3");t.appendChild(o)}t.appendChild(n.catalog_hierarchy(e,"catalog_hierarchy"));const o=common.create_dom_element({element_type:"div",class_name:"identify_coin_wrapper gallery",parent:t});o.appendChild(n.image(e,"ref_coins_image_obverse")),o.appendChild(n.image(e,"ref_coins_image_reverse")),t.appendChild(n.identify_coin(e,"identify_coin")),t.appendChild(n.id_line(e,"id_line"));const a=common.create_dom_element({element_type:"div",class_name:"sides_wrapper",parent:t}),_=common.create_dom_element({element_type:"div",class_name:"obverse_wrapper",parent:a});_.appendChild(n.default(e,"design_obverse")),_.appendChild(n.default(e,"symbol_obverse")),e.legend_obverse?_.appendChild(page.render_legend({value:e.legend_obverse,style:"median legend_obverse_box"})):common.create_dom_element({element_type:"div",parent:wrapper});const l=common.create_dom_element({element_type:"div",class_name:"reverse_wrapper",parent:a});l.appendChild(n.default(e,"design_reverse")),l.appendChild(n.default(e,"symbol_reverse")),e.legend_reverse&&l.appendChild(page.render_legend({value:e.legend_reverse,style:"median legend_reverse_box"})),t.appendChild(n.default(e,"public_info",page.local_to_remote_path)),t.appendChild(n.default(e,"equivalents",(function(e){const n=page.split_data(e,"<br>"),t=[];for(let e=0;e<n.length;e++)t.push(n[e].replace(/ \| /g," "));return t.join(" | ")}))),t.appendChild(n.default(e,"related_types",(function(e){const n=tstring.related_types||"Related types",t=page.split_data(e,"<br>"),o=[];for(let e=0;e<t.length;e++)o.push(t[e].replace(/ \| /g," "));return n+": "+o.join(" | ")})));const m=e.bibliography_data;if(t.appendChild(n.draw_bibliographic_reference(m)),t.appendChild(n.default(e,"section_id",(function(e){const n=tstring.permanent_uri||"Permanent URI",t=page_globals.__WEB_ROOT_WEB__+"/type/"+e;return n+': <span class="uri">'+(page_globals.__WEB_BASE_URL__+t)+"</span>"}))),e.uri&&e.uri.length>0)for(let o=0;o<e.uri.length;o++){const a=e.uri[o];t.appendChild(n.default(e,"section_id",(function(e){return(tstring.uri||"URI")+" "+a.label+': <span class="uri"><a href="'+a.value+'" target="_blank">'+a.value+"</a></span>"})))}if(e._coins_group&&e._coins_group.length>0){const o=e._coins_group.filter(e=>"1"!=e.typology_id);o.length>0&&(t.appendChild(n.label(e,"coins")),t.appendChild(n.items_list(e,"items_list",o)))}if(e.ref_coins_findspots_data&&e.ref_coins_findspots_data.length>0||e.ref_coins_hoard_data&&e.ref_coins_hoard_data.length>0){const o=tstring.findspots+"/"+tstring.hoards;t.appendChild(n.label(e,o)),t.appendChild(n.hoards_and_findspots(e,o))}const i=common.create_dom_element({element_type:"div",class_name:"row_wrapper"});return i.appendChild(t),i},dedalo_link:function(e,n){const t=common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",inner_html:e.section_id+" <small>("+n+")</small>",href:"/dedalo/lib/dedalo/main/?t="+n+"&id="+e.section_id});return t.setAttribute("target","_blank"),t},default:function(e,n,t){const o=common.create_dom_element({element_type:"div",class_name:"info_line "+n});if(e[n]&&e[n].length>0){const a=["design_obverse","design_reverse","symbol_reverse","symbol_obverse"],_="function"==typeof t?t(e[n]):page.remove_gaps(e[n]," | ");if(a.includes(n)){const t=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type="+n+"&label="+e[n]+"&value="+e[n];common.create_dom_element({element_type:"a",class_name:"info_value underline-text",inner_html:_.trim(),href:t,parent:o})}else common.create_dom_element({element_type:"span",class_name:"info_value",inner_html:_.trim(),parent:o})}return o},label:function(e,n){const t=common.create_dom_element({element_type:"div",class_name:"info_line separator "+n});return common.create_dom_element({element_type:"div",class_name:"big_label",text_content:tstring[n]||n,parent:t}),t},catalog_hierarchy:function(e,n){const t=common.create_dom_element({element_type:"div",class_name:"info_line inline "+n}),o=e.catalog;if(o&&Object.keys(o).length>0&&o.constructor===Object){const e=o.parents,n=[];for(let t=0;t<e.length&&(n.push(e[t]),"mints"!==e[t].term_table);t++);for(let e=n.length-1;e>=0;e--){if("mints"===n[e].term_table){console.log("parents_ordered[i]",n[e]);const o=n[e].term_data?JSON.parse(n[e].term_data)[0]:"";common.create_dom_element({element_type:"a",class_name:"breadcrumb link link_mint",href:page_globals.__WEB_ROOT_WEB__+"/mint/"+o,target:"_blank",text_content:n[e].term,parent:t})}else common.create_dom_element({element_type:"span",class_name:"breadcrumb "+n[e].term_table,text_content:n[e].term,parent:t});common.create_dom_element({element_type:"span",class_name:"breadcrumb_symbol",text_content:" > ",parent:t})}const a=o.ref_mint_number?o.ref_mint_number+"/":"";common.create_dom_element({element_type:"span",class_name:"breadcrumb",text_content:"MIB "+a+o.term,parent:t})}return t},image:function(e,n){const t=common.create_dom_element({element_type:"div",class_name:"info_line inline "+n});if(e[n]&&e[n].length>0){const o=e[n],a=common.create_dom_element({element_type:"a",class_name:"image_link",href:o,parent:t});common.create_dom_element({element_type:"img",class_name:"image",src:o,parent:a})}return t},identify_coin:function(e,n){const t=common.create_dom_element({element_type:"div",class_name:"info_line inline "+n}),o=page.split_data(e.ref_coins," | "),a=[];for(var _=0;_<o.length;_++)a.push(JSON.parse(o[_]));const l=a[0][0],m=e.ref_coins_union.find(e=>e.section_id===l);if(m){console.log("identify_coin:",m);const e=page_globals.__WEB_ROOT_WEB__+"/coin/"+l,o=(page_globals.__WEB_BASE_URL__,'<a class="icon_link info_value" target="_blank" href="'+e+'"> URI </a> ');if(common.create_dom_element({element_type:"span",class_name:"",inner_html:o,parent:t}),m.uri&&m.uri.length>0)for(let e=0;e<m.uri.length;e++){const n=m.uri[e],o=(n.label,'<a class="icon_link info_value" href="'+n.value+'" target="_blank"> '+n.label+"</a>");common.create_dom_element({element_type:"span",class_name:"",inner_html:o,parent:t})}if(m.collection.length>0){const e=common.create_dom_element({element_type:"span",class_name:"info_value",parent:t});common.create_dom_element({element_type:"span",class_name:n+" golden-color",inner_html:m.collection,parent:e}),m.number.length>0&&common.create_dom_element({element_type:"span",class_name:n+" golden-color",inner_html:" "+m.number,parent:e})}function i(e,n,t,o){if(e.name.length<1)return;const a=common.create_dom_element({element_type:"span",class_name:"info_value",parent:n});return e.name&&common.create_dom_element({element_type:"span",class_name:t+" golden-color",inner_html:o+e.name,parent:a}),e.date&&common.create_dom_element({element_type:"span",class_name:t+" golden-color",inner_html:" | "+e.date,parent:a}),e.number&&common.create_dom_element({element_type:"span",class_name:t+" golden-color",inner_html:" "+e.number,parent:a}),!0}if(m.ref_auction_group)for(let e=0;e<m.ref_auction_group.length;e++)i(m.ref_auction_group[e],t,n,"");if(m.ref_related_coin_auction_group)for(let e=0;e<m.ref_related_coin_auction_group.length;e++)i(m.ref_related_coin_auction_group[e],t,n,"= ");m.public_info&&m.public_info.length>0&&common.create_dom_element({element_type:"div",class_name:"",inner_html:m.public_info,parent:t});const a=[];m.weight&&m.weight.length>0&&a.push(m.weight.replace(".",",")+" g"),m.diameter&&m.diameter.length>0&&a.push(m.diameter.replace(".",",")+" mm"),m.dies&&m.dies.length>0&&a.push(m.dies+" h");const _=a.join("; ");common.create_dom_element({element_type:"span",class_name:n,text_content:" ("+_+")",parent:t})}return t},id_line:function(e,n){const t=this,o=common.create_dom_element({element_type:"div",class_name:"info_line "+n}),a=[];if(e[n="catalogue"]&&e[n].length>0){const t=e.mint_number?e.mint_number+"/":"",o=e[n]+" "+t+e.number,_=common.create_dom_element({element_type:"span",class_name:"info_value "+n,text_content:o});a.push(_)}if(e[n="denomination"]&&e[n].length>0){const o=e[n],_=common.create_dom_element({element_type:"span",class_name:"info_value "+n,text_content:o});a.push(_),t.create_float_prompt(e,_,"denomination_data")}if(e[n="material"]&&e[n].length>0){const t=page.split_data(e[n]," | ").filter(Boolean).join(", ");var _=common.create_dom_element({element_type:"span",class_name:"info_value "+n,text_content:t});a.push(_)}if(t.create_float_prompt(e,_,"material_data"),n="averages",e.averages_weight&&e.averages_weight.length>0){const t=e.averages_weight?e.averages_weight.replace(".",",")+" g ("+e.total_weight_items+")":"",o=e.averages_diameter?"; "+e.averages_diameter.replace(".",",")+" mm ("+e.total_diameter_items+")":"",_=common.create_dom_element({element_type:"span",class_name:"info_value "+n,text_content:t+o});a.push(_)}const l=a.length;for(let e=0;e<l;e++){if(e>0&&e<l){common.create_dom_element({element_type:"span",class_name:"info_value separator",text_content:" | ",parent:o})}o.appendChild(a[e])}return o},items_list:function(e,n,t){const o=this,a=common.create_dom_element({element_type:"div",class_name:"info_line "+n}),_=t.length;for(let n=0;n<_;n++){const _=t[n],l=_.coins.length;if(1==_.typology_id)continue;const m=_.typology;common.create_dom_element({element_type:"div",class_name:"medium_label",text_content:m+" ("+l+")",parent:a});const i=common.create_dom_element({element_type:"div",class_name:"coins_list typology_coins gallery",parent:a}),c=_.coins,r=c.length;for(let n=0;n<r;n++){const t=c[n],a=e.ref_coins_union.find(e=>e.section_id==t);if(a){const e=o.draw_coin(a);i.appendChild(e)}}}return a},draw_coin:function(e){const n=this;function t(){this.removeEventListener("load",t,!1);const e=this,n=this.hires;setTimeout((function(){e.src=n}),1e3)}const o=common.create_dom_element({element_type:"div",class_name:"sorted_coin"}),a=common.create_dom_element({element_type:"div",class_name:"images_wrapper",parent:o}),_=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:a}),l=common.create_dom_element({element_type:"img",src:e.image_obverse_thumb,loading:"lazy",parent:_});l.hires=e.image_obverse,l.addEventListener("load",t,!1);const m=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:a}),i=common.create_dom_element({element_type:"img",src:e.image_reverse_thumb,loading:"lazy",parent:m});if(i.hires=e.image_reverse,i.addEventListener("load",t,!1),e.collection&&e.collection.length>0){const n=e.former_collection.length>0?e.collection+" ("+e.former_collection+")":e.collection,t=e.number&&e.number.length>0?n+" "+e.number:n;common.create_dom_element({element_type:"div",class_name:"golden-color",inner_html:t,parent:o})}const c=[];e.weight&&e.weight.length>0&&c.push(e.weight.replace(".",",")+" g"),e.diameter&&e.diameter.length>0&&c.push(e.diameter.replace(".",",")+" mm"),e.dies&&e.dies.length>0&&c.push(e.dies+" h");const r=c.join("; ");common.create_dom_element({element_type:"div",class_name:"",inner_html:r,parent:o});const s=[];let p="";if(e.hoard){const n=e.hoard_place?e.hoard+" ("+e.hoard_place+")":e.hoard;p=(tstring.hoard||"Hoard")+": ",s.push(n)}if(e.findspot){const n=e.findspot_place?e.findspot+" ("+e.findspot_place+")":e.findspot;p=(tstring.fiindspot||"Findspot")+": ",s.push(n)}const d=s.join(" | ");function f(e,n,t,o){if(e.name.length<1)return;const a=common.create_dom_element({element_type:"div",class_name:"line_full",parent:n});return e.name&&common.create_dom_element({element_type:"span",class_name:t+" golden-color",inner_html:o+" "+e.name,parent:a}),e.date&&common.create_dom_element({element_type:"span",class_name:t+" golden-color",inner_html:" "+e.date,parent:a}),e.number&&common.create_dom_element({element_type:"span",class_name:t+" golden-color",inner_html:0+e.number,parent:a}),!0}if(common.create_dom_element({element_type:"div",class_name:"",inner_html:p+d,parent:o}),e.ref_auction_group)for(let n=0;n<e.ref_auction_group.length;n++)f(e.ref_auction_group[n],o,"identify_coin","");if(e.ref_related_coin_auction_group)for(let n=0;n<e.ref_related_coin_auction_group.length;n++)f(e.ref_related_coin_auction_group[n],o,"identify_coin","= ");if(e.public_info&&e.public_info.length>0){const n=(tstring.public_info||"Public_info")+": ";common.create_dom_element({element_type:"div",inner_html:n+e.public_info,parent:o})}const g=common.create_dom_element({element_type:"div",class_name:"references",parent:o}),h=e.bibliography_data;if(h&&h.length>0&&"object"==typeof h[0]){const e=n.draw_bibliographic_reference(h);e&&g.appendChild(e)}const u=page_globals.__WEB_ROOT_WEB__+"/coin/"+e.section_id,y=(page_globals.__WEB_BASE_URL__,'<a class="icon_link" target="_blank" href="'+u+'"> URI </a>');if(common.create_dom_element({element_type:"span",class_name:"uri-text",inner_html:y,parent:o}),e.uri&&e.uri.length>0)for(let n=0;n<e.uri.length;n++){const t=e.uri[n],a=(t.label,'<a class="icon_link info_value" href="'+t.value+'" target="_blank"> '+t.label+"</a>");common.create_dom_element({element_type:"span",class_name:"",inner_html:a,parent:o})}return o},draw_bibliographic_reference:function(e){const n=e,t=n?n.length:0,o=biblio_row_fields,a=new DocumentFragment;for(let e=0;e<t;e++){const t=n[e],_=common.create_dom_element({element_type:"div",class_name:"bibliographic_reference",parent:a});o.biblio_object=t,_.appendChild(o.row_bibliography())}return a},hoards_and_findspots:function(e,n){!0===SHOW_DEBUG&&console.log("item.ref_coins_findspots_data:",e.ref_coins_findspots_data);const t=this,o=common.create_dom_element({element_type:"div",id:"findspots",class_name:"info_line "+n}),a=common.create_dom_element({element_type:"div",class_name:"map_container hide_opacity map",parent:o});function _(e,n){const o=common.create_dom_element({element_type:"div",class_name:"find_coin",parent:n}),a=common.create_dom_element({element_type:"div",class_name:"images_wrapper",parent:o}),_=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:a});common.create_dom_element({element_type:"img",src:e.image_obverse,parent:_}).loading="lazy";const l=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:a});common.create_dom_element({element_type:"img",src:e.image_reverse,parent:l}).loading="lazy";const m=common.create_dom_element({element_type:"div",class_name:"info_wrapper",parent:o});common.create_dom_element({element_type:"div",class_name:"",inner_html:e.collection,parent:m});const i=[];e.weight&&e.weight.length>0&&i.push(e.weight.replace(".",",")+" g"),e.diameter&&e.diameter.length>0&&i.push(e.diameter.replace(".",",")+" mm"),e.dies&&e.dies.length>0&&i.push(e.dies+" h");const c=i.join("; ");common.create_dom_element({element_type:"div",class_name:"",inner_html:c,parent:m});const r=page_globals.__WEB_ROOT_WEB__+"/coin/"+e.section_id,s=(page_globals.__WEB_BASE_URL__,'<a class="icon_link" target="_blank" href="'+r+'"> URI </a>');common.create_dom_element({element_type:"div",class_name:"",inner_html:s,parent:m}),common.create_dom_element({element_type:"div",class_name:"",inner_html:e.hoard,parent:m});const p=common.create_dom_element({element_type:"div",class_name:"references",parent:m}),d=e.bibliography_data;p.appendChild(t.draw_bibliographic_reference(d))}const l=[],m=[],i=[],c=e.ref_coins_hoard_data,r=c.length;for(let n=0;n<r;n++){const t=c[n],a=JSON.parse(t.coins)||[],m=a.length;if(m<1){console.warn("! Skipped hoard without zero coins :",c);continue}if(i.find(e=>e===t.section_id))continue;const r=common.create_dom_element({element_type:"div",class_name:"find_wrapper hoard",parent:o});common.create_dom_element({element_type:"div",inner_html:" "+(t.name||"")+" ("+(t.place||"")+") ",parent:r});const s=common.create_dom_element({element_type:"div",text_content:" "+m+" "+(tstring.items||"items")+" ",parent:r}),p=common.create_dom_element({element_type:"div",class_name:"find_coins hoard",parent:o}),d=[];for(let n=0;n<m;n++){const t=a[n],o=e.coin_references.find(e=>e.section_id==t);o&&(_(o,p),d.push(t))}s.innerHTML=s.innerHTML+"("+d.length+")";const f=JSON.parse(t.map);f&&l.push({section_id:t.section_id,name:t.name,place:t.place,georef:t.georef,data:f,items:d.length,total_items:m,type:"hoard",marker_icon:page.maps_config.markers.hoard}),i.push(t.section_id)}const s=e.ref_coins_findspots_data,p=s.length;for(let n=0;n<p;n++){const t=s[n],a=JSON.parse(t.coins)||[],i=a.length;if(i<1){console.warn("! Skipped findspot without zero coins :",s);continue}if(m.find(e=>e===t.section_id))continue;const c=common.create_dom_element({element_type:"div",class_name:"find_wrapper findspot",parent:o});common.create_dom_element({element_type:"div",inner_html:" "+(t.name||"")+" ("+(t.place||"")+") ",parent:c});const r=common.create_dom_element({element_type:"div",text_content:" "+i+" "+(tstring.items||"items")+" ",parent:c}),p=common.create_dom_element({element_type:"div",class_name:"find_coins findspot gallery",parent:o}),d=[];for(let n=0;n<i;n++){const t=a[n],o=e.coin_references.find(e=>e.section_id==t);o&&(_(o,p),d.push(t))}const f=JSON.parse(t.map);f&&l.push({section_id:t.section_id,name:t.name,place:t.place,georef:t.georef,data:f,items:d.length,total_items:i,type:"findspot",marker_icon:page.maps_config.markers.findspot}),r.innerHTML=r.innerHTML+"("+d.length+")",m.push(t.section_id)}if(console.log("// map_data:",l),l.length>0){common.when_in_dom(a,(function(){t.caller.draw_map({container:a,map_position:null,map_data:l})}))}else a.remove();return o},mint:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line mint"});if(e.mint&&e.mint.length>0){common.create_dom_element({element_type:"label",class_name:"",text_content:tstring.mint||"Mint",parent:n});const e=row_object.mint;common.create_dom_element({element_type:"span",class_name:"info_value",text_content:e,parent:n})}return n},authors_alt:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line authors_alt"});if(e.authors_alt&&e.authors_alt.length>0){const t=" ("+(e.authors_alt||"")+"). ";common.create_dom_element({element_type:"div",class_name:"info_value authors_alt",text_content:t,parent:n})}return n},publication_date:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line publication_date"});if(e.publication_date){const t=e.publication_date.split("-");let o=parseInt(t[0]);t[1],parseInt(t[1])>0&&(o=o+"-"+parseInt(t[1])),t[2],parseInt(t[2])>0&&(o=o+"-"+parseInt(t[2])),o=" ("+o+"). ",common.create_dom_element({element_type:"div",class_name:"info_value",text_content:o,parent:n}),n.classList.remove("hide")}return n},title:function(e){const n=this.get_typology(e),t=e.title||"",o="1"==n||"20"==n||"28"==n||"30"==n||"32"==n?" italic":"",a=common.create_dom_element({element_type:"div",class_name:"info_line title"}),_=" "+t+". ";return common.create_dom_element({element_type:"div",class_name:""+o,text_content:_,parent:a}),a},editor:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line editor"});if(e.editor&&e.editor.length>0){const t=" "+(tstring.en||"En")+" "+e.editor+", ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:t,parent:n})}return n},title_secondary:function(e){this.get_typology(e);const n=e.title_secondary||"",t=common.create_dom_element({element_type:"div",class_name:"info_line row_title"});if(n.length>0){const e=" "+n+" ";common.create_dom_element({element_type:"div",class_name:"title_secondary italic",text_content:e,parent:t})}return t},magazine:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line magazine"});if(e.magazine&&e.magazine.length>0){const t=" "+e.magazine+", ";common.create_dom_element({element_type:"div",class_name:"info_value italic",text_content:t,parent:n})}return n},serie:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line serie"});if(e.serie&&e.serie.length>0){const t=!e.copy||e.copy.length<1?" "+e.serie+", ":" "+e.serie;common.create_dom_element({element_type:"div",class_name:"info_value italic",text_content:t,parent:n})}return n},copy:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line copy"});if(e.copy&&e.copy.length>0){const t=" ("+e.copy+"), ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:t,parent:n})}return n},physical_description:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line physical_description"});if(e.physical_description&&e.physical_description.length>0){const t=" "+e.physical_description+". ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:t,parent:n})}return n},editorial:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line editorial"});if(e.editorial&&e.editorial.length>0){const t=" "+e.editorial+". ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:t,parent:n})}return n},url:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line url"}),t=e.url_data;if(t&&t.length>0){const e=JSON.parse(t),o=e.length;for(let t=0;t<o;t++){const a=e[t],_=a.title&&a.title.length>1?a.title:a.iri;common.create_dom_element({element_type:"a",class_name:"url_data",title:_,text_content:_,href:a.iri,parent:n}).setAttribute("target","_blank"),!(t%2)&&t<o&&o>1&&common.create_dom_element({element_type:"span",class_name:"separator",text_content:" | ",parent:n})}}return n},place:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line place"});return e.place&&e.place.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.place,parent:n}),n},descriptors:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line descriptors"});return e.descriptors&&e.descriptors.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.descriptors,parent:n}),n},typology_name:function(e){const n=common.create_dom_element({element_type:"div",class_name:"info_line typology_name"});return e.typology_name&&e.typology_name.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.typology_name,parent:n}),n},create_float_prompt:function(e,n,t){if(e[t]&&e[t].length>0){n.classList.add("active-pointer"),n.classList.add("underline-text");const a=document.getElementById("main"),_=common.create_dom_element({element_type:"div",class_name:"float-prompt hide",parent:a});if("material_data"===t)var o=e.material;else o=e[t][0].term;const l=page_globals.__WEB_ROOT_WEB__+"/catalog/?item_type="+e[t][0].table+"&label="+o+"&value="+o,m=(common.create_dom_element({element_type:"a",class_name:"prompt-label underline-text",inner_html:e[t][0].term,href:l,parent:_}),common.create_dom_element({element_type:"div",class_name:"close-buttom",parent:_}));if(e[t][0].definition){common.create_dom_element({element_type:"p",class_name:"prompt-description",inner_html:e[t][0].definition,parent:_})}if(e[t][0].iri.length>0){const n=page.split_data(e[t][0].iri," | ");for(let e=0;e<n.length;e++){common.create_dom_element({element_type:"a",class_name:"image_link underline-text",target:"_blank",href:n[e],inner_html:n[e],parent:_})}}n.addEventListener("click",(function(e){const n=document.getElementsByClassName("float-prompt");for(let e=0;e<n.length;e++)n[e].classList.contains("hide")||n[e].classList.add("hide");_.style.left=e.clientX+"px",_.style.top=e.clientY+"px",_.classList.remove("hide")})),m.addEventListener("click",(function(){_.classList.add("hide")}))}}};