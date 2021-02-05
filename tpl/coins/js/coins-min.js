"use strict";var coins={form:null,pagination:null,list:null,form_node:null,form_container:null,rows_container:null,set_up:function(e){const n=this;return n.form_container=e.form_container,n.rows_container=e.rows_container,n.form=new form_factory,n.form_node=n.render_form(),n.form_container.appendChild(n.form_node),n.pagination={total:null,limit:10,offset:0,n_nodes:8},event_manager.subscribe("paginate",(function(e){n.pagination.offset=e,n.form_submit()})),!0},render_form:function(){const e=this,n=new DocumentFragment,t=common.create_dom_element({element_type:"div",class_name:"form-row fields",parent:n});e.form.item_factory({id:"section_id",name:"section_id",label:tstring.is||"ID",q_column:"section_id",eq:"=",eq_in:"",eq_out:"",parent:t}),e.form.item_factory({id:"collection",name:"collection",label:tstring.collection||"collection",q_column:"collection",eq:"LIKE",eq_in:"%",eq_out:"%",parent:t,callback:function(n){e.form.activate_autocomplete({form_item:n,table:"coins"})}}),e.form.item_factory({id:"public_info",name:"public_info",label:tstring.public_info||"public_info",q_column:"public_info",eq:"LIKE",eq_in:"%",eq_out:"%",parent:t,callback:function(n){e.form.activate_autocomplete({form_item:n,table:"coins"})}}),e.form.item_factory({id:"mint",name:"mint",label:tstring.mint||"mint",q_column:"mint",eq:"LIKE",eq_in:"%",eq_out:"%",parent:t,callback:function(n){e.form.activate_autocomplete({form_item:n,table:"coins"})}});const o=common.create_dom_element({element_type:"div",class_name:"form-group field button_submit",parent:n});common.create_dom_element({element_type:"input",type:"submit",id:"submit",value:tstring.search||"Search",class_name:"btn btn-light btn-block primary",parent:o}).addEventListener("click",(function(n){n.preventDefault(),e.form_submit()}));const i=e.form.build_operators_node();n.appendChild(i);const a=common.create_dom_element({element_type:"form",id:"search_form",class_name:"form-inline"});return a.appendChild(n),a},form_submit:function(){const e=this,n=e.form_node;if(!n)return new Promise((function(e){console.error("Error on submit. Invalid form_node.",n),e(!1)}));const t=e.rows_container;return e.pagination.total?t.classList.add("loading"):page.add_spinner(t),new Promise((function(o){const i=e.pagination.limit,a=e.pagination.offset,r=e.form.form_to_sql_filter({form_node:n});data_manager.request({body:{dedalo_get:"records",table:"coins",ar_fields:["*"],sql_filter:r,limit:i,count:!0,offset:a,order:"section_id ASC",process_result:null}}).then((function(n){console.log("--------------- api_response:",n);const i=page.parse_coin_data(n.result),r=n.total;e.pagination.total=r,e.pagination.offset=a,i||(t.classList.remove("loading"),o(null)),function(){for(;t.hasChildNodes();)t.removeChild(t.lastChild);t.classList.remove("loading")}(),e.list=e.list||new list_factory,e.list.init({data:i,fn_row_builder:e.list_row_builder,pagination:e.pagination,caller:e}),e.list.render_list().then((function(e){e&&t.appendChild(e),o(e)}))}))}))},list_row_builder:function(e,n){const t=new DocumentFragment,o=common.create_dom_element({element_type:"div",class_name:"wrapper",parent:t}),i=common.create_dom_element({element_type:"img",class_name:"image",src:e.image_obverse_thumb,loading:"lazy",parent:o});i.hires=e.image_obverse,i.addEventListener("load",page.load_hires);const a=common.create_dom_element({element_type:"img",class_name:"image",src:e.image_reverse_thumb,loading:"lazy",parent:o});return a.hires=e.image_reverse,a.addEventListener("load",page.load_hires),t}};