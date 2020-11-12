"use strict";var row_fields={caller:null,draw_item:function(e){const t=this,n=new DocumentFragment;if(!0===dedalo_logged){const o=t.dedalo_link(e,"numisdata3");n.appendChild(o)}n.appendChild(t.catalog_hierarchy(e,"catalog_hierarchy"));const o=common.create_dom_element({element_type:"div",class_name:"identify_coin_wrapper gallery",parent:n});if(o.appendChild(t.image(e,"ref_coins_image_obverse")),o.appendChild(t.image(e,"ref_coins_image_reverse")),n.appendChild(t.identify_coin(e,"identify_coin")),n.appendChild(t.id_line(e,"id_line")),n.appendChild(t.default(e,"design_obverse")),n.appendChild(t.default(e,"symbol_obverse")),n.appendChild(t.default(e,"legend_obverse",page.local_to_remote_path)),n.appendChild(t.default(e,"design_reverse")),n.appendChild(t.default(e,"symbol_reverse")),n.appendChild(t.default(e,"legend_reverse",page.local_to_remote_path)),n.appendChild(t.default(e,"equivalents",(function(e){const t=page.split_data(e,"<br>"),n=[];for(let e=0;e<t.length;e++)n.push(t[e].replace(/ \| /g," "));return n.join(" | ")}))),n.appendChild(t.default(e,"section_id",(function(e){const t=tstring.permanent_uri||"Permanent URI",n=page_globals.__WEB_ROOT_WEB__+"/type/"+e;return t+': <span class="uri">'+(page_globals.__WEB_BASE_URL__+n)+"</span>"}))),n.appendChild(t.default(e,"public_info",page.local_to_remote_path)),e._coins_group&&e._coins_group.length>0){const o=e._coins_group.filter(e=>"1"!=e.typology_id);o.length>0&&(n.appendChild(t.label(e,"items")),n.appendChild(t.items_list(e,"items_list",o)))}e.ref_coins_findspots_data&&e.ref_coins_findspots_data.length>0&&(n.appendChild(t.label(e,"hallazgos_monetarios")),n.appendChild(t.hoards_and_findspots(e,"findspots")));const a=common.create_dom_element({element_type:"div",class_name:"row_wrapper"});return a.appendChild(n),a},dedalo_link:function(e,t){const n=common.create_dom_element({element_type:"a",class_name:"section_id go_to_dedalo",inner_html:e.section_id+" <small>("+t+")</small>",href:"/dedalo/lib/dedalo/main/?t="+t+"&id="+e.section_id});return n.setAttribute("target","_blank"),n},default:function(e,t,n){const o=common.create_dom_element({element_type:"div",class_name:"info_line "+t});if(e[t]&&e[t].length>0){const a="function"==typeof n?n(e[t]):page.remove_gaps(e[t]," | ");common.create_dom_element({element_type:"span",class_name:"info_value",inner_html:a.trim(),parent:o})}return o},label:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line "+t});return common.create_dom_element({element_type:"div",class_name:"big_label",text_content:tstring[t]||t,parent:n}),n},catalog_hierarchy:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line inline "+t}),o=e.catalog;if(o&&Object.keys(o).length>0&&o.constructor===Object){const e=o.parents,t=[];for(let n=0;n<e.length&&(t.push(e[n]),"mints"!==e[n].term_table);n++);for(let e=t.length-1;e>=0;e--)common.create_dom_element({element_type:"span",class_name:"breadcrumb "+t[e].term_table,text_content:t[e].term,parent:n}),common.create_dom_element({element_type:"span",class_name:"breadcrumb_symbol",text_content:" > ",parent:n});common.create_dom_element({element_type:"span",class_name:"breadcrumb",text_content:o.term,parent:n})}return n},image:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line inline "+t});if(e[t]&&e[t].length>0){const o=e[t],a=common.create_dom_element({element_type:"a",class_name:"image_link",href:o,parent:n});common.create_dom_element({element_type:"img",class_name:"image",src:o,parent:a})}return n},identify_coin:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line inline "+t}),o=page.split_data(e.ref_coins," | "),a=[];for(var m=0;m<o.length;m++)a.push(JSON.parse(o[m]));const _=a[0][0],l=e.ref_coins_union.find(e=>e.section_id===_);if(l){common.create_dom_element({element_type:"span",class_name:t,text_content:l.ref_auction,parent:n});const e=(l.ref_auction_date?l.ref_auction_date.split(" "):[""])[0].split("-").reverse().join("-");e&&common.create_dom_element({element_type:"span",class_name:t,text_content:" | "+e,parent:n}),l.ref_auction_number&&common.create_dom_element({element_type:"span",class_name:t,text_content:", "+(tstring.n||"nº")+" "+l.ref_auction_number,parent:n});const o=[];l.weight&&l.weight.length>0&&o.push(l.weight+" g"),l.dies&&l.dies.length>0&&o.push(l.dies+" h"),l.diameter&&l.diameter.length>0&&o.push(l.diameter+" mm");const a=o.join("; ");common.create_dom_element({element_type:"span",class_name:t,text_content:" ("+a+")",parent:n})}return n},id_line:function(e,t){const n=common.create_dom_element({element_type:"div",class_name:"info_line "+t}),o=[];if(e[t="catalogue"]&&e[t].length>0){const n=e.section_id,a=e[t]+" "+n+"/"+e.number,m=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:a});o.push(m)}if(e[t="denomination"]&&e[t].length>0){const n=e[t],a=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:n});o.push(a)}if(e[t="material"]&&e[t].length>0){const n=page.split_data(e[t]," | ").filter(Boolean).join(", "),a=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:n});o.push(a)}if(t="averages",e.averages_weight&&e.averages_weight.length>0){const n=e.averages_weight+" g ("+e.total_weight_items+");",a=e.averages_diameter+" mm ("+e.total_diameter_items+")",m=common.create_dom_element({element_type:"span",class_name:"info_value "+t,text_content:n+" "+a});o.push(m)}const a=o.length;for(let e=0;e<a;e++){if(e>0&&e<a){common.create_dom_element({element_type:"span",class_name:"info_value separator",text_content:" | ",parent:n})}n.appendChild(o[e])}return n},items_list:function(e,t,n){const o=this,a=common.create_dom_element({element_type:"div",class_name:"info_line "+t});function m(e,t){const n=common.create_dom_element({element_type:"div",class_name:"sorted_coin",parent:t}),a=common.create_dom_element({element_type:"div",class_name:"images_wrapper",parent:n}),m=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:a});common.create_dom_element({element_type:"img",src:e.image_obverse,parent:m});const _=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:a});common.create_dom_element({element_type:"img",src:e.image_reverse,parent:_}),common.create_dom_element({element_type:"div",class_name:"",inner_html:e.collection,parent:n});const l=[];e.weight&&e.weight.length>0&&l.push(e.weight+" g"),e.dies&&e.dies.length>0&&l.push(e.dies+" h"),e.diameter&&e.diameter.length>0&&l.push(e.diameter+" mm");const i=l.join("; ");common.create_dom_element({element_type:"div",class_name:"",inner_html:i,parent:n});const c=page_globals.__WEB_ROOT_WEB__+"/coin/"+e.section_id,s='URI: <a href="'+c+'">'+(page_globals.__WEB_BASE_URL__+c)+"</a>";common.create_dom_element({element_type:"div",class_name:"",inner_html:s,parent:n});const r=[];if(e.hoard){const t=e.hoard_place?e.hoard+" ("+e.hoard_place+")":e.hoard;r.push(t)}if(e.findspot){const t=e.findspot_place?e.findspot+" ("+e.findspot_place+")":e.findspot;r.push(t)}const p=r.join(" | ");common.create_dom_element({element_type:"div",class_name:"",inner_html:p,parent:n});const d=common.create_dom_element({element_type:"div",class_name:"references",parent:n}),f=e.bibliography_data;for(let e=0;e<f.length;e++)o.draw_bibliographic_reference(f[e],d)}const _=n.length;for(let t=0;t<_;t++){const o=n[t];if(1==o.typology_id)continue;const _=o.typology;common.create_dom_element({element_type:"div",class_name:"medium_label",text_content:_,parent:a});const l=common.create_dom_element({element_type:"div",class_name:"typology_coins",parent:a}),i=o.coins,c=i.length;for(let t=0;t<c;t++){const n=i[t],o=e.ref_coins_union.find(e=>e.section_id==n);o&&m(o,l)}}return a},draw_bibliographic_reference:function(e,t){const n=e._publications,o=n.length;for(let e=0;e<o;e++){const o=n[e],a=common.create_dom_element({element_type:"div",class_name:"bibliographic_reference",parent:t});common.create_dom_element({element_type:"span",inner_html:" "+(o.title||"")+" ",parent:a}),common.create_dom_element({element_type:"span",inner_html:" "+(o.authors||"")+" ",parent:a}),common.create_dom_element({element_type:"span",inner_html:" "+(o.date||"")+" ",parent:a}),common.create_dom_element({element_type:"span",inner_html:" "+(o.place||"")+" ",parent:a})}return wrapper},hoards_and_findspots:function(e,t){SHOW_DEBUG;const n=this,o=common.create_dom_element({element_type:"div",id:"findspots",class_name:"info_line "+t}),a=common.create_dom_element({element_type:"div",class_name:"map_container",parent:o}),m=common.create_dom_element({element_type:"div",class_name:"map_legend",parent:a});function _(e,t){const o=common.create_dom_element({element_type:"div",class_name:"find_coin",parent:t}),a=common.create_dom_element({element_type:"div",class_name:"images_wrapper",parent:o}),m=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_obverse,parent:a});common.create_dom_element({element_type:"img",src:e.image_obverse,parent:m});const _=common.create_dom_element({element_type:"a",class_name:"image_link",href:e.image_reverse,parent:a});common.create_dom_element({element_type:"img",src:e.image_reverse,parent:_});const l=common.create_dom_element({element_type:"div",class_name:"info_wrapper",parent:o});common.create_dom_element({element_type:"div",class_name:"",inner_html:e.collection,parent:l});const i=[];e.weight&&e.weight.length>0&&i.push(e.weight+" g"),e.dies&&e.dies.length>0&&i.push(e.dies+" h"),e.diameter&&e.diameter.length>0&&i.push(e.diameter+" mm");const c=i.join("; ");common.create_dom_element({element_type:"div",class_name:"",inner_html:c,parent:l});const s=page_globals.__WEB_ROOT_WEB__+"/coin/"+e.section_id,r='URI: <a href="'+s+'">'+(page_globals.__WEB_BASE_URL__+s)+"</a>";common.create_dom_element({element_type:"div",class_name:"",inner_html:r,parent:l}),common.create_dom_element({element_type:"div",class_name:"",inner_html:e.hoard,parent:l});const p=common.create_dom_element({element_type:"div",class_name:"references",parent:l}),d=e.bibliography_data;for(let e=0;e<d.length;e++)n.draw_bibliographic_reference(d[e],p)}common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.hoard+'<img src="'+page.maps_config.markers.hoard.iconUrl+'"/>',parent:m}),common.create_dom_element({element_type:"div",class_name:"legend_item",inner_html:tstring.findspot+'<img src="'+page.maps_config.markers.findspot.iconUrl+'"/>',parent:m});const l=[],i=[],c=[],s=e.ref_coins_hoard_data,r=s.length;for(let t=0;t<r;t++){const n=s[t],a=JSON.parse(n.coins)||[],m=a.length;if(m<1){console.warn("! Skipped hoard without zero coins :",s);continue}if(c.find(e=>e===n.section_id))continue;const i=common.create_dom_element({element_type:"div",class_name:"find_wrapper hoard",parent:o});common.create_dom_element({element_type:"div",inner_html:" "+(n.name||"")+" ("+(n.place||"")+") ",parent:i});const r=common.create_dom_element({element_type:"div",text_content:" "+m+" "+(tstring.items||"items")+" ",parent:i}),p=common.create_dom_element({element_type:"div",class_name:"find_coins hoard",parent:o}),d=[];for(let t=0;t<m;t++){const n=a[t],o=e.ref_coins_union.find(e=>e.section_id==n);o&&(_(o,p),d.push(n))}r.innerHTML=r.innerHTML+"("+d.length+")";const f=JSON.parse(n.map);f&&l.push({section_id:n.section_id,name:n.name,place:n.place,georef:n.georef,data:f,items:d.length,total_items:m,type:"hoard",marker_icon:page.maps_config.markers.hoard}),c.push(n.section_id)}const p=e.ref_coins_findspots_data,d=p.length;for(let t=0;t<d;t++){const n=p[t],a=JSON.parse(n.coins)||[],m=a.length;if(m<1){console.warn("! Skipped findspot without zero coins :",p);continue}if(i.find(e=>e===n.section_id))continue;const c=common.create_dom_element({element_type:"div",class_name:"find_wrapper findspot",parent:o});common.create_dom_element({element_type:"div",inner_html:" "+(n.name||"")+" ("+(n.place||"")+") ",parent:c});const s=common.create_dom_element({element_type:"div",text_content:" "+m+" "+(tstring.items||"items")+" ",parent:c}),r=common.create_dom_element({element_type:"div",class_name:"find_coins findspot gallery",parent:o}),d=[];for(let t=0;t<m;t++){const n=a[t],o=e.ref_coins_union.find(e=>e.section_id==n);o&&(_(o,r),d.push(n))}const f=JSON.parse(n.map);f&&l.push({section_id:n.section_id,name:n.name,place:n.place,georef:n.georef,data:f,items:d.length,total_items:m,type:"findspot",marker_icon:page.maps_config.markers.findspot}),s.innerHTML=s.innerHTML+"("+d.length+")",i.push(n.section_id)}if(console.log("// map_data:",l),l.length>0){common.when_in_dom(a,(function(){n.caller.draw_map({container:a,map_position:null,map_data:l})}))}else a.remove();return o},mint:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line mint"});if(e.mint&&e.mint.length>0){common.create_dom_element({element_type:"label",class_name:"",text_content:tstring.mint||"Mint",parent:t});const e=row_object.mint;common.create_dom_element({element_type:"span",class_name:"info_value",text_content:e,parent:t})}return t},authors_alt:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line authors_alt"});if(e.authors_alt&&e.authors_alt.length>0){const n=" ("+(e.authors_alt||"")+"). ";common.create_dom_element({element_type:"div",class_name:"info_value authors_alt",text_content:n,parent:t})}return t},publication_date:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line publication_date"});if(e.publication_date){const n=e.publication_date.split("-");let o=parseInt(n[0]);n[1],parseInt(n[1])>0&&(o=o+"-"+parseInt(n[1])),n[2],parseInt(n[2])>0&&(o=o+"-"+parseInt(n[2])),o=" ("+o+"). ",common.create_dom_element({element_type:"div",class_name:"info_value",text_content:o,parent:t}),t.classList.remove("hide")}return t},title:function(e){const t=this.get_typology(e),n=e.title||"",o="1"==t||"20"==t||"28"==t||"30"==t||"32"==t?" italic":"",a=common.create_dom_element({element_type:"div",class_name:"info_line title"}),m=" "+n+". ";return common.create_dom_element({element_type:"div",class_name:""+o,text_content:m,parent:a}),a},editor:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line editor"});if(e.editor&&e.editor.length>0){const n=" "+(tstring.en||"En")+" "+e.editor+", ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},title_secondary:function(e){this.get_typology(e);const t=e.title_secondary||"",n=common.create_dom_element({element_type:"div",class_name:"info_line row_title"});if(t.length>0){const e=" "+t+" ";common.create_dom_element({element_type:"div",class_name:"title_secondary italic",text_content:e,parent:n})}return n},magazine:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line magazine"});if(e.magazine&&e.magazine.length>0){const n=" "+e.magazine+", ";common.create_dom_element({element_type:"div",class_name:"info_value italic",text_content:n,parent:t})}return t},serie:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line serie"});if(e.serie&&e.serie.length>0){const n=!e.copy||e.copy.length<1?" "+e.serie+", ":" "+e.serie;common.create_dom_element({element_type:"div",class_name:"info_value italic",text_content:n,parent:t})}return t},copy:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line copy"});if(e.copy&&e.copy.length>0){const n=" ("+e.copy+"), ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},physical_description:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line physical_description"});if(e.physical_description&&e.physical_description.length>0){const n=" "+e.physical_description+". ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},editorial:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line editorial"});if(e.editorial&&e.editorial.length>0){const n=" "+e.editorial+". ";common.create_dom_element({element_type:"div",class_name:"info_value",text_content:n,parent:t})}return t},url:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line url"}),n=e.url_data;if(n&&n.length>0){const e=JSON.parse(n),o=e.length;for(let n=0;n<o;n++){const a=e[n],m=a.title&&a.title.length>1?a.title:a.iri;common.create_dom_element({element_type:"a",class_name:"url_data",title:m,text_content:m,href:a.iri,parent:t}).setAttribute("target","_blank"),!(n%2)&&n<o&&o>1&&common.create_dom_element({element_type:"span",class_name:"separator",text_content:" | ",parent:t})}}return t},place:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line place"});return e.place&&e.place.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.place,parent:t}),t},descriptors:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line descriptors"});return e.descriptors&&e.descriptors.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.descriptors,parent:t}),t},typology_name:function(e){const t=common.create_dom_element({element_type:"div",class_name:"info_line typology_name"});return e.typology_name&&e.typology_name.length>0&&common.create_dom_element({element_type:"div",class_name:"info_value",text_content:e.typology_name,parent:t}),t}};