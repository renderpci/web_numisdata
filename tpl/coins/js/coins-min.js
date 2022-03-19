"use strict";var coins={form:null,pagination:null,list:null,form_node:null,form_container:null,rows_container:null,set_up:function(e){const t=this;t.form_container=e.form_container,t.rows_container=e.rows_container;const o=e.psqo;t.pagination={total:null,limit:100,offset:0,n_nodes:8},t.form=new form_factory;const n=t.render_form();if(t.form_container.appendChild(n),o&&o.length>1){const e=psqo_factory.decode_psqo(o);e&&(t.form.parse_psqo_to_form(e),t.form_submit(n,{scroll_result:!0}))}else t.form_submit();return event_manager.subscribe("paginate",(function(e){t.pagination.offset=e,t.form_submit()})),!0},render_form:function(){const e=this,t=new DocumentFragment,o=common.create_dom_element({element_type:"div",class_name:"form-row fields",parent:t});e.form.item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"mint_name",eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!0,parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"collection",name:"collection",label:tstring.collection||"collection",q_column:"collection",eq:"LIKE",eq_in:"%",eq_out:"%",parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"ref_auction",name:"ref_auction",label:tstring.auction||"auction",q_column:"ref_auction",eq:"LIKE",eq_in:"%",eq_out:"%",value_wrapper:['["','"]'],parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"number",name:"number",q_column:"number",label:tstring.number||"number",is_term:!1,parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"type_full_value",name:"type_full_value",q_column:"type_full_value",label:tstring.type||"type",value_split:" - ",q_splittable:!0,q_selected_eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!1,parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"material",name:"material",label:tstring.material||"Material",q_column:"material",eq:"LIKE",value_split:" | ",q_splittable:!0,q_selected_eq:"LIKE",eq_in:"%",eq_out:"%",parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"denomination",name:"denomination",label:tstring.denomination||"Denomination",q_column:"denomination",value_split:" | ",q_splittable:!0,q_selected_eq:"LIKE",eq_in:"%",eq_out:"%",parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"section_id",name:"section_id",label:tstring.id||"ID",q_column:"section_id",eq:"=",eq_in:"",eq_out:"",parent:o}),e.form.item_factory({id:"hoard",name:"hoard",label:tstring.hoard||"hoard",q_column:"hoard",eq:"LIKE",eq_in:"%",eq_out:"%",parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"findspot",name:"findspot",label:tstring.findspot||"findspot",q_column:"findspot",eq:"LIKE",eq_in:"%",eq_out:"%",parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"countermark_obverse",name:"countermark_obverse",label:tstring.countermark_obverse||"Countermark obverse",q_column:"countermark_obverse",eq_in:"%",is_term:!1,parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"countermark_reverse",name:"countermark_reverse",label:tstring.countermark_reverse||"Countermark reverse",q_column:"countermark_reverse",eq_in:"%",is_term:!1,parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"bibliography_author",name:"bibliography_author",q_column:"bibliography_author",label:tstring.authorship||"Authorship",value_split:" | ",q_splittable:!0,q_selected_eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!1,parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"bibliography_title",name:"bibliography_title",q_column:"bibliography_title",label:tstring.bibliography||"Bibliography",value_split:" | ",q_splittable:!0,q_selected_eq:"LIKE",eq_in:"%",eq_out:"%",is_term:!1,parent:o,callback:function(t){e.form.activate_autocomplete({form_item:t,table:"coins"})}}),e.form.item_factory({id:"countermark_obverse_data",name:"countermark_obverse_data",class_name:"hide",label:"countermark_obverse_data",q_column:"countermark_obverse_data",q_selected_eq:"LIKE",eq_in:'%"',eq_out:'"%',is_term:!1,parent:o}),e.form.item_factory({id:"countermark_reverse_data",name:"countermark_reverse_data",class_name:"hide",label:"countermark_reverse_data",q_column:"countermark_reverse_data",q_selected_eq:"LIKE",eq_in:'%"',eq_out:'"%',is_term:!1,parent:o});const n=common.create_dom_element({element_type:"div",class_name:"form-group field button_submit",parent:t});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.search||"Search",class_name:"btn btn-light btn-block primary",parent:n}).addEventListener("click",(function(t){t.preventDefault(),e.pagination={total:null,limit:100,offset:0,n_nodes:8},e.form_submit()}));const a=e.form.build_operators_node();return t.appendChild(a),e.form.node=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline form_factory"}),e.form.node.appendChild(t),e.form.node},form_submit:function(){const e=this,t=e.form.node;if(!t)return new Promise((function(e){console.error("Error on submit. Invalid form_node.",t),e(!1)}));const o=e.rows_container;return e.pagination.total?o.classList.add("loading"):page.add_spinner(o),new Promise((function(t){const n=e.pagination.limit,a=e.pagination.offset,r=e.form.build_filter(),i=e.form.parse_sql_filter(r,[]),l=i?"("+i+")":null;SHOW_DEBUG,data_manager.request({body:{dedalo_get:"records",table:"coins",ar_fields:["*"],sql_filter:l,limit:n,count:!0,offset:a,order:"type IS NULL, type ASC",process_result:null,resolve_portals_custom:{image_obverse_data:"images"}}}).then((function(n){coins_row_fields.last_type=null;const r=page.parse_coin_data(n.result),i=n.total;e.pagination.total=i,e.pagination.offset=a,r||(o.classList.remove("loading"),t(null)),function(){for(;o.hasChildNodes();)o.removeChild(o.lastChild);o.classList.remove("loading")}(),e.list=e.list||new list_factory,e.list.init({data:r,fn_row_builder:e.list_row_builder,pagination:e.pagination,caller:e}),e.list.render_list().then((function(e){e&&o.appendChild(e),t(e)}))}));const m=document.querySelector(".rows_container");m&&m.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"})}))},list_row_builder:function(e){return coins_row_fields.draw_item(e)}};
//# sourceMappingURL=coins-min.js.map