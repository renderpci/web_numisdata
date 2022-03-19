"use strict";var thesaurus={search_options:{},view_mode:null,filters:{},filter_op:"AND",draw_delay:200,form:null,list:null,map:null,timeline:null,table:[],root_term:[],term_id:null,set_up:function(e){const t=this;t.table=e.table,t.root_term=e.root_term,t.term_id=e.term_id,t.ar_fields=e.ar_fields;const n=e.rows_list;t.view_mode="tree";const o=common.create_dom_element({element_type:"div",class_name:"spinner"});return t.render_form({container:document.getElementById("items_container")}).then((function(){n.appendChild(o)})),t.load_tree_data({}).then((function(e){t.render_data({target:n,ar_rows:e.result,set_hilite:t.term_id&&t.term_id.length>0}).then((function(){o.remove()}))})),!0},load_tree_data:function(e){const t=e.filter||null,n=e.ar_fields||this.ar_fields||["*"],o=e.order||"norder ASC",s=e.table||this.table.join(","),i=page_globals.WEB_CURRENT_LANG_CODE,r=[],a=function(e){if(e){const t=Object.keys(e)[0],n=e[t],o=[],s=n.length;for(let e=0;e<s;e++){const t=n[e],s=Object.keys(t)[0];if("AND"===s||"OR"===s){const e="("+a(t)+")";o.push(e);continue}const i=-1!==t.field.indexOf("AS")?t.field+" "+t.op+" "+t.value:"`"+t.field+"` "+t.op+" "+t.value;o.push(i),t.group&&r.push(t.group)}return o.join(" "+t+" ")}return null},l=a(t),c="mints_hierarchy"===WEB_AREA?l?" AND (term_table='mints')":"(term_table='mints')":l;SHOW_DEBUG;const _={dedalo_get:"records",db_name:page_globals.WEB_DB,table:s,ar_fields:n,lang:i,sql_filter:c,limit:0,count:!1,order:o};"mints_hierarchy"===WEB_AREA&&(_.process_result={fn:"process_result::add_parents_or_children",columns_name:["parents"]});return data_manager.request({body:_})},render_data:function(e){const t=this;return new Promise((function(n){const o=e.ar_rows,s=common.is_node(e.target)?e.target:document.getElementById(e.target);s.className="",s.classList.add(t.view_mode);const i=e.set_hilite||!1,r=(t.view_mode,t.root_term);{const e=t.term_id?[t.term_id]:null;t.data_clean=page.parse_tree_data(o,e,t.root_term),SHOW_DEBUG,t.tree=t.tree||new tree_factory,t.tree.init({target:s,data:t.data_clean,root_term:r,set_hilite:i,render_node:t.render_tree_node}),t.tree.render().then((function(){n(!0)}))}}))},render_tree_node:function(e){const t=this,n=common.create_dom_element({element_type:"div",class_name:"tree_node",id:e.term_id});n.term_id=e.term_id,n.parent=e.parent;const o=e.term,s=!0===(e.hilite&&!0===e.hilite)?" hilite":"",i=common.create_dom_element({element_type:"span",class_name:"term"+s,inner_html:o,parent:n});switch(WEB_AREA){case"mints_hierarchy":if(e.term_table&&"mints"===e.term_table&&e.term_data&&e.term_data[0]){common.create_dom_element({element_type:"a",class_name:"icon_link",parent:i}).addEventListener("click",(function(){const t="mint/"+e.term_data[0];window.open(t,"mint",null)}))}break;case"symbols":if(e.illustration&&e.illustration.length>0){common.create_dom_element({element_type:"a",class_name:"icon_link",parent:i}).addEventListener("click",(function(){const t={$or:[{$and:[{$and:[{id:"ref_type_symbol_obverse_data",field:"ref_type_symbol_obverse_data",q:""+e.section_id,q_type:"q",op:"LIKE"}]}]},{$and:[{$and:[{id:"ref_type_symbol_reverse_data",field:"ref_type_symbol_reverse_data",q:""+e.section_id,q_type:"q",op:"LIKE"}]}]}]},n="catalog/?psqo="+psqo_factory.encode_psqo(t);window.open(n,"mint",null)}))}break;case"iconography":if(!e.children||0===e.children.length){common.create_dom_element({element_type:"a",class_name:"icon_link",parent:i}).addEventListener("click",(function(){const t={$or:[{$and:[{$and:[{id:"ref_type_design_obverse_iconography_data",field:"ref_type_design_obverse_iconography_data",q:""+e.section_id,q_type:"q",op:"LIKE"}]}]},{$and:[{$and:[{id:"ref_type_design_reverse_iconography_data",field:"ref_type_design_reverse_iconography_data",q:""+e.section_id,q_type:"q",op:"LIKE"}]}]}]},n="catalog/?psqo="+psqo_factory.encode_psqo(t);window.open(n,"mint",null)}))}break;case"countermarks":if(e.illustration&&e.illustration.length>0){common.create_dom_element({element_type:"a",class_name:"icon_link",parent:i}).addEventListener("click",(function(){const t={$or:[{$and:[{$and:[{id:"countermark_obverse_data",field:"countermark_obverse_data",q:""+e.section_id,q_type:"q",op:"LIKE"}]}]},{$and:[{$and:[{id:"countermark_reverse_data",field:"countermark_reverse_data",q:""+e.section_id,q_type:"q",op:"LIKE"}]}]}]},n="coins/?psqo="+psqo_factory.encode_psqo(t);window.open(n,"mint",null)}))}}if(e.nd&&e.nd.length>0&&common.create_dom_element({element_type:"span",class_name:"nd",inner_html:"["+e.nd.join(", ")+"]",parent:n}),e.illustration&&e.illustration.length>0){const t=common.create_dom_element({element_type:"img",class_name:"illustration",src:page_globals.__WEB_BASE_URL__+e.illustration,parent:n}),o=e=>{e.target===t?t.classList.toggle("big"):t.classList.remove("big")};document.addEventListener("click",o)}if(e.scope_note&&e.scope_note.length>0){common.create_dom_element({element_type:"span",class_name:"btn_scope_note",parent:n}).addEventListener("mousedown",(function(){this.classList.contains("open")?(l.classList.add("hide"),this.classList.remove("open")):(l.classList.remove("hide"),this.classList.add("open"))}))}let r,a,l,c,_,m;if(e.relations&&e.relations.length>0&&(r=common.create_dom_element({element_type:"span",class_name:"btn_relations",parent:n}),r.addEventListener("mousedown",(function(){this.classList.contains("open")?(c.classList.add("hide"),this.classList.remove("open")):(c.classList.remove("hide"),this.classList.add("open"))}))),e.indexation&&e.indexation.length>0&&(a=common.create_dom_element({element_type:"span",class_name:"btn_indexation",parent:n}),a.addEventListener("mousedown",(function(){this.classList.contains("open")?(_.classList.add("hide"),this.classList.remove("open")):(_.classList.remove("hide"),this.classList.add("open"))}))),e.children&&e.children.length>0){const o="opened"===e.state?" open":"";common.create_dom_element({element_type:"span",class_name:"arrow"+o,parent:n}).addEventListener("mousedown",(function(){let n;this.classList.contains("open")?(m.classList.add("hide"),this.classList.remove("open"),n="closed"):(m.classList.remove("hide"),this.classList.add("open"),n="opened");const o=t.tree_state[e.term_id];o&&o.state!==n&&(t.tree_state[e.term_id]=n,sessionStorage.setItem("tree_state_"+WEB_AREA,JSON.stringify(t.tree_state)))}))}if(e.scope_note&&e.scope_note.length>0){e.state;const t=e.scope_note.replace(/^\s*<br\s*\/?>|<br\s*\/?>\s*$/g,"");l=common.create_dom_element({element_type:"div",class_name:"scope_note hide",inner_html:t,parent:n})}if(e.relations&&e.relations.length>0){c=common.create_dom_element({element_type:"div",class_name:"relations_container hide",parent:n});const o=function(n,o){for(let s of n)"attributes"===s.type&&"class"===s.attributeName&&(n[0].target.classList.contains("hide")||(t.render_relation_nodes(e,c,t,!1),o.disconnect()))};new MutationObserver(o).observe(c,{attributes:!0,childList:!1,subtree:!1}),!0===e.hilite&&t.hilite_relations_showed<t.hilite_relations_limit&&(c.classList.remove("hide"),r.classList.add("open"),t.hilite_relations_showed++)}if(e.indexation&&e.indexation.length>0){_=common.create_dom_element({element_type:"div",class_name:"indexation_container hide",parent:n});const o=function(n,o){for(let s of n)"attributes"===s.type&&"class"===s.attributeName&&(n[0].target.classList.contains("hide")||(t.render_indexation_nodes(e,_,t),o.disconnect()))};new MutationObserver(o).observe(_,{attributes:!0,childList:!1,subtree:!1}),!0===e.hilite&&t.hilite_indexation_showed<t.hilite_indexation_limit&&(_.classList.remove("hide"),a.classList.add("open"),t.hilite_indexation_showed++)}if(e.children&&e.children.length>0){const t="opened"===e.state?"":" hide";m=common.create_dom_element({element_type:"div",class_name:"branch"+t,parent:n}),n.branch=m}else n.branch=null;return n},render_form:function(e){const t=this;return new Promise((function(n){const o=new DocumentFragment;t.form=t.form||new form_factory;const s=common.create_dom_element({element_type:"div",class_name:"global_search_container form-row fields",parent:o});t.form.item_factory({id:"term",name:"term",class_name:"global_search",label:tstring.term||"Term",q_column:"term",eq:"LIKE",eq_in:"%",eq_out:"%",parent:s,callback:function(e){const n=e.node_input;t.activate_autocomplete(n)}});const i=common.create_dom_element({element_type:"div",class_name:"form-group submit field",parent:o});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.buscar||"Search",class_name:"btn btn-light btn-block primary",parent:i}).addEventListener("click",(function(e){e.preventDefault(),t.form_submit()})),t.form.node=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline form_factory"}),t.form.node.appendChild(o),e.container.appendChild(t.form.node),n(t.form.node)}))},activate_autocomplete:function(e){const t=this;let n;return $(e).autocomplete({delay:150,minLength:1,source:function(o,s){const i=o.term;n=t.form.form_items[e.id];const r=n.q_column;t.search_rows({q:i,q_column:r,limit:25}).then((e=>{const t=[],n=e.result.length;for(let o=0;o<n;o++){const n=e.result[o];t.push({label:n.label,value:n.value})}SHOW_DEBUG,s(t)}))},select:function(e,o){return e.preventDefault(),t.form.add_selected_value(n,o.item.label,o.item.value),this.value="",!1},focus:function(){return!1},close:function(e,t){},change:function(e,t){},response:function(e,t){}}).on("keydown",(function(e){e.keyCode===$.ui.keyCode.ENTER&&$(this).autocomplete("close")})).focus((function(){$(this).autocomplete("search",null)})).blur((function(){})),!0},search_rows:function(e){const t=this;return new Promise((function(n){const o=performance.now(),s=e.q,i=e.q_column,r=e.q_selected||null,a=e.limit,l=t.data_clean.map((e=>({term:e.term,scope_note:e.scope_note,parent:e.parent,term_id:e.term_id,nd:e.nd})));let c=1;n({result:l.filter((function(e){if(a>0&&c>a)return!1;let t=!1;if(s&&s.length>0){const n=e[i].normalize("NFD").replace(/[\u0300-\u036f]/g,""),o=RegExp(s,"i");if(t=o.test(n),!t&&e.nd&&e.nd.length>0)for(let n=0;n<e.nd.length;n++){const s=e.nd[n].normalize("NFD").replace(/[\u0300-\u036f]/g,"");if(t=o.test(s),!0===t)break}}if(!t&&r)for(let n=0;n<r.length;n++)if(e.term_id===r[n]){t=!0;break}return!0===t&&c++,t})).map((e=>{const n=e.parent[0],o=t.data_clean.find((e=>e.term_id===n)),s=o?" ("+o.term+")":"",i=e.nd?" ["+e.nd.join(", ")+"]":"";return{label:e.term+i+s,value:e.term_id}})),debug:{time:performance.now()-o}})}))},form_submit:function(){const e=this,t=e.form.form_items.term;return e.search_rows({q:t.q,q_column:t.q_column,q_selected:t.q_selected,limit:0}).then((t=>{SHOW_DEBUG;const n=t.result.map((e=>e.value));e.term_id=null;const o=document.getElementById("rows_list");for(;o.hasChildNodes();)o.removeChild(o.lastChild);const s=common.create_dom_element({element_type:"div",id:"spinner",class_name:"spinner",parent:o});e.load_tree_data({}).then((function(t){const i=t.result.map((function(e){return-1!==n.indexOf(e.term_id)&&(e.hilite=!0,e.status="closed"),e}));e.render_data({target:o,ar_rows:i,set_hilite:!0}).then((function(){s.remove()}))}))}))}};
//# sourceMappingURL=thesaurus-min.js.map