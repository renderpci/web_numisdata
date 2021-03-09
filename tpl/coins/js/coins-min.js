"use strict";var coins={form:null,pagination:null,list:null,form_node:null,form_container:null,rows_container:null,set_up:function(t){const e=this;e.form_container=t.form_container,e.rows_container=t.rows_container,e.form=new form_factory;const o=e.render_form();return e.form_container.appendChild(o),e.pagination={total:null,limit:10,offset:0,n_nodes:8},event_manager.subscribe("paginate",(function(t){e.pagination.offset=t,e.form_submit()})),!0},render_form:function(){const t=this,e=new DocumentFragment,o=common.create_dom_element({element_type:"div",class_name:"form-row fields",parent:e});t.form.item_factory({id:"section_id",name:"section_id",label:tstring.id||"ID",q_column:"section_id",eq:"=",eq_in:"",eq_out:"",parent:o}),t.form.item_factory({id:"collection",name:"collection",label:tstring.collection||"collection",q_column:"collection",eq:"LIKE",eq_in:"%",eq_out:"%",parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}}),t.form.item_factory({id:"ref_auction",name:"ref_auction",label:tstring.auction||"auction",q_column:"ref_auction",eq:"LIKE",eq_in:"%",eq_out:"%",parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}}),t.form.item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"mint",eq:"LIKE",eq_in:"%",eq_out:"%",parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}}),t.form.item_factory({id:"findspot",name:"findspot",label:tstring.findspot||"findspot",q_column:"findspot",eq:"LIKE",eq_in:"%",eq_out:"%",parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}}),t.form.item_factory({id:"hoard",name:"hoard",label:tstring.hoard||"hoard",q_column:"hoard",eq:"LIKE",eq_in:"%",eq_out:"%",parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}}),t.form.item_factory({id:"number",name:"number",q_column:"type",label:tstring.number||"number",is_term:!1,parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}}),t.form.item_factory({id:"public_info",name:"public_info",q_column:"public_info",label:tstring.public_info||"Public info",is_term:!1,parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}}),t.form.item_factory({id:"countermark_obverse",name:"countermark_obverse",label:tstring.countermark_obverse||"Countermark obverse",q_column:"countermark_obverse",eq_in:"%",is_term:!1,parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}}),t.form.item_factory({id:"countermark_reverse",name:"countermark_reverse",label:tstring.countermark_reverse||"Countermark reverse",q_column:"countermark_reverse",eq_in:"%",is_term:!1,parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}}),t.form.item_factory({id:"equivalents",name:"equivalents",q_column:"ref_type_equivalents",eq_in:"%",eq_out:"%",label:tstring.equivalents||"equivalents",is_term:!1,parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"types"})}}),t.form.item_factory({id:"bibliography_author",name:"bibliography_author",q_column:"bibliography_author",label:tstring.authorship||"Authorship",is_term:!1,parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}}),t.form.item_factory({id:"bibliography_title",name:"bibliography_title",q_column:"bibliography_title",label:tstring.bibliography||"Bibliography",is_term:!1,parent:o,callback:function(e){t.form.activate_autocomplete({form_item:e,table:"coins"})}});const n=common.create_dom_element({element_type:"div",class_name:"form-group field button_submit",parent:e});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.search||"Search",class_name:"btn btn-light btn-block primary",parent:n}).addEventListener("click",(function(e){e.preventDefault(),t.pagination={total:null,limit:10,offset:0,n_nodes:8},t.form_submit()}));const i=t.form.build_operators_node();return e.appendChild(i),t.form.node=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline form_factory"}),t.form.node.appendChild(e),t.form.node},form_submit:function(){const t=this,e=t.form.node;if(!e)return new Promise((function(t){console.error("Error on submit. Invalid form_node.",e),t(!1)}));const o=t.rows_container;return t.pagination.total?o.classList.add("loading"):page.add_spinner(o),new Promise((function(e){const n=t.pagination.limit,i=t.pagination.offset,r=t.form.build_filter(),a=t.form.parse_sql_filter(r,[]),l=a?"("+a+")":null;!0===SHOW_DEBUG&&console.log("-> coins form_submit sql_filter:",l),data_manager.request({body:{dedalo_get:"records",table:"coins",ar_fields:["*"],sql_filter:l,limit:n,count:!0,offset:i,order:"type",process_result:null,resolve_portals_custom:{mint_data:"mints"}}}).then((function(n){console.log("--------------- api_response:",n);const r=page.parse_coin_data(n.result),a=n.total;t.pagination.total=a,t.pagination.offset=i,r||(o.classList.remove("loading"),e(null)),function(){for(;o.hasChildNodes();)o.removeChild(o.lastChild);o.classList.remove("loading")}(),t.list=t.list||new list_factory,t.list.init({data:r,fn_row_builder:t.list_row_builder,pagination:t.pagination,caller:t}),t.list.render_list().then((function(t){t&&o.appendChild(t),e(t)}))}));const m=document.querySelector(".rows_container");m&&m.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"})}))},list_row_builder:function(t,e){return coins_row_fields.draw_item(t)}};